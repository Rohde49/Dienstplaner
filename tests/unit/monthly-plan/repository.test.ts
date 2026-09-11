import { mkdtemp, rm, writeFile } from 'node:fs/promises';
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

async function createTestRepository(employees: Employee[] = []): Promise<{
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
    const { directory, repository } =
      await createTestRepository(sourceEmployees);
    const plan = await repository.create({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
    });
    const entryType: EntryType = {
      id: '20000000-0000-4000-8000-000000000001',
      code: ' SN/F ',
      name: 'Abweichendes Kürzel',
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
    };
    const planWithEntry = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType,
    });
    await repository.save(planWithEntry);
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
      `${JSON.stringify({ schemaVersion: 1, plan: foreignPlan }, null, 2)}\n`,
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
      schemaVersion: 1,
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
      employees: [],
    });

    await expect(repository.save(unknownPlan)).rejects.toThrow(
      'nicht gefunden',
    );
  });
});
