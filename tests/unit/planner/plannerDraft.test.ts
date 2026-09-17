import { describe, expect, it } from 'vitest';

import { createMonthlyPlan } from '../../../src/main/domain/monthlyPlanFactory';
import {
  removeDraftPlanEntry,
  setDraftDayNote,
  setDraftOnCallEmployee,
  setDraftPlanEntry,
  setDraftPlanTitle,
} from '../../../src/renderer/features/planner/plannerDraft';
import {
  completePlannerTeamLoad,
  createInitialPlannerPageState,
  openPlannerPlan,
  replacePlannerDraft,
} from '../../../src/renderer/features/planner/plannerState';
import type {
  Employee,
  EntryType,
  MonthlyPlan,
} from '../../../src/shared/schemas';

function createEmployee(
  id: string,
  overrides: Partial<Employee> = {},
): Employee {
  return {
    id,
    firstName: 'Eva',
    lastName: 'Beispiel',
    role: 'Erzieher',
    weeklyWorkingMinutes: 2_340,
    colorKey: 'blue',
    active: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    ...overrides,
  };
}

function createEntryType(overrides: Partial<EntryType> = {}): EntryType {
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
    ...overrides,
  };
}

function createPlan(): MonthlyPlan {
  return createMonthlyPlan({
    year: 2026,
    month: 9,
    title: 'Septemberplan',
    employees: [
      createEmployee('10000000-0000-4000-8000-000000000001'),
      createEmployee('10000000-0000-4000-8000-000000000002', {
        firstName: 'Wanda',
        role: 'Wirtschaftskraft',
      }),
    ],
  });
}

describe('Planentwurf', () => {
  it('setzt, ersetzt und entfernt Einträge über die gemeinsame Snapshotlogik', () => {
    const plan = createPlan();
    const dayId = plan.days[0].id;
    const employeeId = plan.employees[0].id;
    const withEntry = setDraftPlanEntry(
      plan,
      dayId,
      employeeId,
      createEntryType(),
    );
    const entryId = withEntry.days[0].entries[0].id;
    const replaced = setDraftPlanEntry(
      withEntry,
      dayId,
      employeeId,
      createEntryType({
        id: '20000000-0000-4000-8000-000000000002',
        code: '/',
        name: 'Frei',
        startTime: null,
        endTime: null,
        timeValues: {
          attendanceMinutes: 0,
          pauseMinutes: 0,
          workingMinutes: 0,
          workingWithoutNightReadinessMinutes: 0,
          nightReadinessMinutes: 0,
          nightWorkMinutes: 0,
        },
      }),
    );

    expect(replaced.days[0].entries[0]).toMatchObject({
      id: entryId,
      code: '/',
    });
    expect(
      removeDraftPlanEntry(replaced, dayId, employeeId).days[0].entries,
    ).toEqual([]);
    expect(plan.days[0].entries).toEqual([]);
  });

  it('ordnet Rufbereitschaft nur einem Erzieher-Snapshot zu oder entfernt sie', () => {
    const plan = createPlan();
    const dayId = plan.days[0].id;
    const educatorId = plan.employees[0].id;
    const serviceEmployeeId = plan.employees[1].id;

    const assigned = setDraftOnCallEmployee(plan, dayId, educatorId);

    expect(assigned.days[0].onCallEmployeeId).toBe(educatorId);
    expect(
      setDraftOnCallEmployee(assigned, dayId, null).days[0].onCallEmployeeId,
    ).toBeNull();
    expect(() =>
      setDraftOnCallEmployee(plan, dayId, serviceEmployeeId),
    ).toThrow('nur Erziehern');
  });

  it('trimmt Bemerkung und Titel und hält ihre Längengrenzen ein', () => {
    const plan = createPlan();
    const withNote = setDraftDayNote(plan, plan.days[0].id, '  Hinweis  ');
    const withoutNote = setDraftDayNote(withNote, plan.days[0].id, '   ');
    const withTitle = setDraftPlanTitle(plan, '  Neuer Titel  ');

    expect(withNote.days[0].note).toBe('Hinweis');
    expect(withoutNote.days[0].note).toBeNull();
    expect(withTitle.title).toBe('Neuer Titel');
    expect(() =>
      setDraftDayNote(plan, plan.days[0].id, 'x'.repeat(61)),
    ).toThrow();
    expect(() => setDraftPlanTitle(plan, 'x'.repeat(201))).toThrow();
  });

  it('ersetzt nur den Entwurf und bewahrt den gespeicherten Ausgangsstand', () => {
    const plan = createPlan();
    const readyState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [],
    );
    const openedState = openPlannerPlan(readyState, plan, false);
    const changedDraft = setDraftPlanTitle(plan, 'Entwurfstitel');

    const state = replacePlannerDraft(openedState, changedDraft);

    expect(state.document.kind).toBe('plan');
    if (state.document.kind !== 'plan') {
      throw new Error('Planansicht erwartet.');
    }
    expect(state.document.baseline.title).toBe('Septemberplan');
    expect(state.document.draft.title).toBe('Entwurfstitel');
  });
});
