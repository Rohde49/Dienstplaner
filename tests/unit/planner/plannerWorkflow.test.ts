import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { MonthlyPlansRepository } from '../../../src/main/storage/monthlyPlansRepository';
import {
  setDraftDayNote,
  setDraftOnCallEmployee,
  setDraftPlanEntry,
} from '../../../src/renderer/features/planner/plannerDraft';
import {
  completePlannerSave,
  completePlannerTeamLoad,
  createInitialPlannerPageState,
  hasUnsavedPlannerChanges,
  openPlannerPlan,
  replacePlannerDraft,
  returnToPlannerPreview,
} from '../../../src/renderer/features/planner/plannerState';
import type { Employee, EntryType } from '../../../src/shared/schemas';

const testDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    testDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

function createEmployee(): Employee {
  return {
    id: '10000000-0000-4000-8000-000000000001',
    firstName: 'Eva',
    lastName: 'Beispiel',
    role: 'Erzieher',
    weeklyWorkingMinutes: 2_340,
    colorKey: 'blue',
    active: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  };
}

function createEntryType(): EntryType {
  return {
    id: '20000000-0000-4000-8000-000000000001',
    code: 'T',
    name: 'Tagdienst',
    calculationType: 'fixed',
    startTime: '06:00',
    endTime: '14:00',
    timeValues: {
      attendanceMinutes: 480,
      pauseMinutes: 0,
      workingMinutes: 480,
      workingWithoutNightReadinessMinutes: 480,
      nightReadinessMinutes: 0,
      nightWorkMinutes: 0,
    },
    active: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  };
}

describe('Planungsseiten-Kernablauf', () => {
  it('führt Vorschau, Anlage, Bearbeitung, Speichern, Laden, Wiederherstellung und Löschen isoliert aus', async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), 'dienstplaner-workflow-'),
    );
    testDirectories.push(directory);
    const employee = createEmployee();
    const entryType = createEntryType();
    const repository = new MonthlyPlansRepository({
      dataDirectoryPath: directory,
      loadEmployees: async () => [employee],
      loadEntryTypes: async () => [entryType],
    });
    let state = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [employee],
    );

    expect(state.document.kind).toBe('preview');

    const createdPlan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    state = openPlannerPlan(state, createdPlan, false);
    const employeeId = createdPlan.employees[0].id;
    const dayId = createdPlan.days[0].id;
    let draft = setDraftPlanEntry(createdPlan, dayId, employeeId, entryType);
    draft = setDraftOnCallEmployee(draft, dayId, employeeId);
    draft = setDraftDayNote(draft, dayId, 'Besprechung');
    state = replacePlannerDraft(state, draft);

    expect(hasUnsavedPlannerChanges(state)).toBe(true);

    const savedPlan = await repository.save(draft);
    state = completePlannerSave(state, savedPlan);

    expect(hasUnsavedPlannerChanges(state)).toBe(false);
    await expect(repository.get(savedPlan.id)).resolves.toEqual({
      plan: savedPlan,
      recoveryWarning: null,
    });

    const filePath = path.join(directory, 'plans', `${savedPlan.id}.json`);
    await writeFile(filePath, '{ beschädigt', 'utf8');
    const recoveredResult = await repository.get(savedPlan.id);

    expect(recoveredResult.plan).not.toBeNull();
    expect(recoveredResult.recoveryWarning).toContain('Sicherungsdatei');
    state = openPlannerPlan(state, recoveredResult.plan!, true);
    expect(hasUnsavedPlannerChanges(state)).toBe(true);

    await repository.remove(savedPlan.id);
    state = returnToPlannerPreview(state);

    await expect(repository.list()).resolves.toEqual([]);
    expect(state.document.kind).toBe('preview');
  });
});
