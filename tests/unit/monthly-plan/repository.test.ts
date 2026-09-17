import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { MonthlyPlansRepository } from '../../../src/main/storage/monthlyPlansRepository';
import { createMonthlyPlan } from '../../../src/main/domain/monthlyPlanFactory';
import { setPlanEntry } from '../../../src/main/domain/monthlyPlanEntries';
import { calculateMonthlyPlanEvaluation } from '../../../src/shared/calculations';
import type {
  Employee,
  EntryType,
  MonthlyPlan,
} from '../../../src/shared/schemas';

const temporaryDirectories: string[] = [];

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
    code: 'SN/F',
    name: 'Spät-Nacht-Früh-Dienst',
    calculationType: 'fixed',
    startTime: '14:00',
    endTime: '08:00',
    timeValues: {
      attendanceMinutes: 1_080,
      workingMinutes: 600,
      workingWithoutNightReadinessMinutes: 480,
      nightReadinessMinutes: 120,
      nightWorkMinutes: 60,
    },
    active: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    ...overrides,
  };
}

async function createTestRepository(
  employees: Employee[] = [
    createEmployee('10000000-0000-4000-8000-000000000001'),
  ],
  entryTypes: EntryType[] = [],
): Promise<{
  directory: string;
  repository: MonthlyPlansRepository;
}> {
  const directory = await mkdtemp(path.join(tmpdir(), 'dienstplaner-plans-'));
  temporaryDirectories.push(directory);

  return {
    directory,
    repository: new MonthlyPlansRepository({
      dataDirectoryPath: directory,
      loadEmployees: async () => employees,
      loadEntryTypes: async () => entryTypes,
    }),
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('Monatsplan-Repository', () => {
  it('speichert pro Plan-ID und lädt nach einer Neustart-Simulation unverändert', async () => {
    const employees = [createEmployee('10000000-0000-4000-8000-000000000001')];
    const { directory, repository } = await createTestRepository(employees);
    const createdPlan = await repository.create({
      year: 2026,
      month: 9,
      title: '  Septemberplan  ',
    });
    const restartedRepository = new MonthlyPlansRepository({
      dataDirectoryPath: directory,
      loadEmployees: async () => [],
    });

    await expect(restartedRepository.get(createdPlan.id)).resolves.toEqual({
      plan: createdPlan,
      recoveryWarning: null,
    });
  });

  it('übernimmt nur aktive Mitarbeiter in ihrer aktuellen Reihenfolge', async () => {
    const employees = [
      createEmployee('10000000-0000-4000-8000-000000000001', {
        firstName: 'Anna',
      }),
      createEmployee('10000000-0000-4000-8000-000000000002', {
        firstName: 'Berta',
        active: false,
      }),
      createEmployee('10000000-0000-4000-8000-000000000003', {
        firstName: 'Clara',
      }),
    ];
    const { repository } = await createTestRepository(employees);

    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });

    expect(plan.employees.map((employee) => employee.firstName)).toEqual([
      'Anna',
      'Clara',
    ]);
    expect(plan.employees.map((employee) => employee.position)).toEqual([1, 2]);
  });

  it('lehnt die Anlage ohne aktiven Mitarbeiter an der Repository-Grenze ab', async () => {
    const { repository } = await createTestRepository([
      createEmployee('10000000-0000-4000-8000-000000000001', {
        active: false,
      }),
    ]);

    await expect(
      repository.create({ year: 2026, month: 9, title: 'Septemberplan' }),
    ).rejects.toThrow('mindestens einem aktiven Mitarbeiter');
  });

  it('erlaubt mehrere Pläne desselben Monats und listet beide getrennt', async () => {
    const { repository } = await createTestRepository();

    const [firstPlan, secondPlan] = await Promise.all([
      repository.create({ year: 2026, month: 9, title: 'Plan A' }),
      repository.create({ year: 2026, month: 9, title: 'Plan B' }),
    ]);
    const summaries = await repository.list();

    expect(firstPlan.id).not.toBe(secondPlan.id);
    expect(summaries).toHaveLength(2);
    expect(summaries.map(({ id }) => id)).toEqual(
      expect.arrayContaining([firstPlan.id, secondPlan.id]),
    );
  });

  it('listet Erstellungszeitpunkte und sortiert nach der letzten Änderung', async () => {
    const { repository } = await createTestRepository();
    const firstPlan = await repository.create({
      year: 2025,
      month: 1,
      title: 'Plan A',
    });
    const secondPlan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Plan B',
    });
    const firstSavedPlan = await repository.save({
      ...firstPlan,
      title: 'Plan A geändert',
    });
    const updatedFirstPlan = await repository.save(firstSavedPlan);

    const summaries = await repository.list();

    expect(summaries.map(({ id }) => id)).toEqual([
      updatedFirstPlan.id,
      secondPlan.id,
    ]);
    expect(summaries[0]).toMatchObject({
      createdAt: firstPlan.createdAt,
      updatedAt: updatedFirstPlan.updatedAt,
    });
  });

  it('liefert für eine unbekannte gültige Plan-ID einen leeren Ladezustand', async () => {
    const { repository } = await createTestRepository();

    await expect(
      repository.get('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual({ plan: null, recoveryWarning: null });
  });

  it('speichert erlaubte Änderungen und ersetzt den gelieferten Änderungszeitpunkt', async () => {
    const { directory, repository } = await createTestRepository();
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const submittedPlan = structuredClone(plan);
    submittedPlan.title = 'Geänderter Titel';
    submittedPlan.days[0].note = 'Hinweis';
    submittedPlan.updatedAt = '2000-01-01T00:00:00.000Z';

    const savedPlan = await repository.save(submittedPlan);

    expect(savedPlan).toMatchObject({ title: 'Geänderter Titel' });
    expect(savedPlan.days[0].note).toBe('Hinweis');
    expect(savedPlan.updatedAt).not.toBe(submittedPlan.updatedAt);
    const restartedRepository = new MonthlyPlansRepository({
      dataDirectoryPath: directory,
      loadEmployees: async () => [],
    });
    await expect(restartedRepository.get(plan.id)).resolves.toEqual({
      plan: savedPlan,
      recoveryWarning: null,
    });
  });

  it.each<[string, (plan: MonthlyPlan) => void]>([
    ['Jahr', (plan) => (plan.year = 2027)],
    ['Monat', (plan) => (plan.month = 8)],
    [
      'Erstellungszeitpunkt',
      (plan) => (plan.createdAt = '2026-08-31T08:00:00.000Z'),
    ],
    [
      'Mitarbeiter-Snapshot',
      (plan) => {
        plan.employees[0].firstName = 'Manipuliert';
      },
    ],
    [
      'Plantag-ID',
      (plan) => {
        plan.days[0].id = '90000000-0000-4000-8000-000000000001';
      },
    ],
    [
      'Datumsfolge',
      (plan) => {
        [plan.days[0].id, plan.days[1].id] = [plan.days[1].id, plan.days[0].id];
      },
    ],
  ])('lehnt eine Änderung an %s ab', async (_label, changePlan) => {
    const employees = [createEmployee('10000000-0000-4000-8000-000000000001')];
    const { repository } = await createTestRepository(employees);
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const changedPlan = structuredClone(plan);
    changePlan(changedPlan);

    await expect(repository.save(changedPlan)).rejects.toThrow();
  });

  it('wertet Snapshots ohne die ursprünglichen Stammdaten aus', async () => {
    const sourceEmployees = [
      createEmployee('10000000-0000-4000-8000-000000000001'),
    ];
    const entryType = createEntryType({
      code: ' SN/F ',
      name: 'Abweichendes Kürzel',
    });
    const { directory, repository } = await createTestRepository(
      sourceEmployees,
      [entryType],
    );
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const planWithEntry = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType,
    });
    const draftEntryId = planWithEntry.days[0].entries[0].id;
    const savedPlan = await repository.save(planWithEntry);
    expect(savedPlan.days[0].entries[0].id).not.toBe(draftEntryId);
    sourceEmployees.splice(0);
    const restartedRepository = new MonthlyPlansRepository({
      dataDirectoryPath: directory,
      loadEmployees: async () => sourceEmployees,
    });

    const loadedPlan = (await restartedRepository.get(plan.id)).plan;

    expect(loadedPlan?.employees[0]).toMatchObject({
      firstName: 'Eva',
      role: 'Erzieher',
      weeklyWorkingMinutes: 2_340,
    });
    expect(loadedPlan?.days[0].entries[0]).toMatchObject({
      sourceEntryTypeId: entryType.id,
      code: 'SN/F',
      name: 'Abweichendes Kürzel',
      timeValues: entryType.timeValues,
    });
    const evaluation =
      loadedPlan && calculateMonthlyPlanEvaluation(loadedPlan).employees[0];
    expect(evaluation).toMatchObject({
      snfServiceCount: 1,
      workingMinutes: 600,
      workingWithoutNightReadinessMinutes: 480,
      nightReadinessMinutes: 120,
      nightWorkMinutes: 60,
    });
  });

  it('speichert die Freier-Tag-Wirkung unabhängig vom Kürzel im Snapshot', async () => {
    const entryType = createEntryType({
      code: 'WF',
      name: 'Wunschfrei',
      calculationType: 'freeDay',
      startTime: null,
      endTime: null,
      timeValues: {
        attendanceMinutes: 0,
        workingMinutes: 0,
        workingWithoutNightReadinessMinutes: 0,
        nightReadinessMinutes: 0,
        nightWorkMinutes: 0,
      },
    });
    const { directory, repository } = await createTestRepository(undefined, [
      entryType,
    ]);
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const planWithFreeDay = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType,
    });

    await repository.save(planWithFreeDay);

    const restartedRepository = new MonthlyPlansRepository({
      dataDirectoryPath: directory,
      loadEmployees: async () => [],
      loadEntryTypes: async () => [],
    });
    const loadedPlan = (await restartedRepository.get(plan.id)).plan;

    expect(loadedPlan?.days[0].entries[0]).toMatchObject({
      code: 'WF',
      isFreeDay: true,
      startTime: null,
      endTime: null,
    });
    expect(
      loadedPlan &&
        calculateMonthlyPlanEvaluation(loadedPlan).employees[0].freeDayCount,
    ).toBe(1);
  });

  it('lehnt manipulierte Werte eines neuen Planungseintrags ab', async () => {
    const entryType = createEntryType();
    const { repository } = await createTestRepository(undefined, [entryType]);
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const changedPlan = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType,
    });
    changedPlan.days[0].entries[0].code = 'Manipuliert';

    await expect(repository.save(changedPlan)).rejects.toThrow(
      'ungültige Snapshotwerte',
    );
    await expect(repository.get(plan.id)).resolves.toEqual({
      plan,
      recoveryWarning: null,
    });
  });

  it('akzeptiert einen vollständig neu hergeleiteten Ersatz-Snapshot', async () => {
    const currentEntryTypes = [createEntryType()];
    const { repository } = await createTestRepository(
      undefined,
      currentEntryTypes,
    );
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const planWithEntry = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType: currentEntryTypes[0],
    });
    const savedPlan = await repository.save(planWithEntry);
    const previousEntryId = savedPlan.days[0].entries[0].id;
    currentEntryTypes[0] = createEntryType({
      code: 'T',
      name: 'Tagdienst',
      startTime: '08:00',
      endTime: '16:00',
      timeValues: {
        attendanceMinutes: 480,
        workingMinutes: 450,
        workingWithoutNightReadinessMinutes: 450,
        nightReadinessMinutes: 0,
        nightWorkMinutes: 0,
      },
    });
    const replacedPlan = setPlanEntry({
      plan: savedPlan,
      planDayId: savedPlan.days[0].id,
      planEmployeeId: savedPlan.employees[0].id,
      entryType: currentEntryTypes[0],
    });

    const savedReplacement = await repository.save(replacedPlan);

    expect(savedReplacement.days[0].entries[0]).toMatchObject({
      id: previousEntryId,
      code: 'T',
      name: 'Tagdienst',
      timeValues: currentEntryTypes[0].timeValues,
    });
  });

  it('lehnt einen neuen Snapshot aus einer inzwischen inaktiven Eintragsart ab', async () => {
    const activeEntryType = createEntryType();
    const { repository } = await createTestRepository(undefined, [
      { ...activeEntryType, active: false },
    ]);
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const changedPlan = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType: activeEntryType,
    });

    await expect(repository.save(changedPlan)).rejects.toThrow(
      'aktuell aktive Eintragsart',
    );
  });

  it('erhält unveränderte ältere Snapshots ohne aktuelle Eintragsart', async () => {
    const entryType = createEntryType();
    const currentEntryTypes = [entryType];
    const { repository } = await createTestRepository(
      undefined,
      currentEntryTypes,
    );
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const planWithEntry = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType,
    });
    const savedPlan = await repository.save(planWithEntry);
    currentEntryTypes.splice(0);

    const savedWithoutSource = await repository.save({
      ...savedPlan,
      title: 'Titel ohne Stammdaten geändert',
    });

    expect(savedWithoutSource.days[0].entries[0]).toEqual(
      savedPlan.days[0].entries[0],
    );
  });

  it('entfernt Haupt- und Sicherungsdatei eines Monatsplans', async () => {
    const { directory, repository } = await createTestRepository();
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    await repository.save(plan);
    const filePath = path.join(directory, 'plans', `${plan.id}.json`);

    await repository.remove(plan.id);

    await expect(access(filePath)).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(access(`${filePath}.backup`)).rejects.toMatchObject({
      code: 'ENOENT',
    });
    await expect(repository.list()).resolves.toEqual([]);
    await expect(repository.get(plan.id)).resolves.toEqual({
      plan: null,
      recoveryWarning: null,
    });
  });

  it('meldet eine unbekannte Plan-ID beim Löschen', async () => {
    const { repository } = await createTestRepository();

    await expect(
      repository.remove('00000000-0000-4000-8000-000000000001'),
    ).rejects.toThrow('nicht gefunden');
  });

  it('verwendet bei einer fremden Plan-ID in der Hauptdatei die passende Sicherung', async () => {
    const { directory, repository } = await createTestRepository();
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    await repository.save(plan);
    const filePath = path.join(directory, 'plans', `${plan.id}.json`);
    const foreignPlan = {
      ...plan,
      id: '90000000-0000-4000-8000-000000000001',
    };
    await writeFile(
      filePath,
      `${JSON.stringify({ schemaVersion: 2, plan: foreignPlan }, null, 2)}\n`,
      'utf8',
    );

    const result = await repository.get(plan.id);

    expect(result.plan).toEqual(plan);
    expect(result.recoveryWarning).toContain('Sicherungsdatei');
    await expect(repository.list()).resolves.toContainEqual(
      expect.objectContaining({ id: plan.id }),
    );
  });

  it('blockiert, wenn Haupt- und Sicherungsdatei eine fremde Plan-ID enthalten', async () => {
    const { directory, repository } = await createTestRepository();
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const filePath = path.join(directory, 'plans', `${plan.id}.json`);
    const foreignFile = JSON.stringify({
      schemaVersion: 2,
      plan: {
        ...plan,
        id: '90000000-0000-4000-8000-000000000001',
      },
    });
    await writeFile(filePath, foreignFile, 'utf8');
    await writeFile(`${filePath}.backup`, foreignFile, 'utf8');

    await expect(repository.get(plan.id)).rejects.toThrow(
      'konnte nicht gelesen werden',
    );
  });

  it('meldet die Wiederherstellung aus einer gültigen Sicherung', async () => {
    const { directory, repository } = await createTestRepository();
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    await repository.save(plan);
    const filePath = path.join(directory, 'plans', `${plan.id}.json`);
    await writeFile(filePath, '{ beschädigt', 'utf8');

    const result = await repository.get(plan.id);

    expect(result.plan).toEqual(plan);
    expect(result.recoveryWarning).toContain('Sicherungsdatei');
  });

  it('blockiert einen Plan, wenn Haupt- und Sicherungsdatei beschädigt sind', async () => {
    const { directory, repository } = await createTestRepository();
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const filePath = path.join(directory, 'plans', `${plan.id}.json`);
    await writeFile(filePath, '{}', 'utf8');
    await writeFile(`${filePath}.backup`, '{}', 'utf8');

    await expect(repository.get(plan.id)).rejects.toThrow(
      'konnte nicht gelesen werden',
    );
  });

  it('verwendet den allgemeinen Speicheraufruf nicht als Upsert', async () => {
    const { repository } = await createTestRepository();
    const unknownPlan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Unbekannt',
      employees: [createEmployee('10000000-0000-4000-8000-000000000099')],
    });

    await expect(repository.save(unknownPlan)).rejects.toThrow(
      'nicht gefunden',
    );
  });
});
