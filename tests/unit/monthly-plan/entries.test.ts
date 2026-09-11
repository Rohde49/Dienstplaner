import { describe, expect, it } from 'vitest';

import {
  removePlanEntry,
  setPlanEntry,
} from '../../../src/main/domain/monthlyPlanEntries';
import { createMonthlyPlan } from '../../../src/main/domain/monthlyPlanFactory';
import { createPlanEntrySnapshot } from '../../../src/shared/domain/planEntrySnapshot';
import {
  EMPLOYEE_ROLES,
  monthlyPlanSchema,
  type Employee,
  type EntryType,
  type MonthlyPlan,
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
    code: 'SN',
    name: 'Spät-Nacht-Dienst',
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

function createPlan(employeeCount = 1): MonthlyPlan {
  const employees = Array.from({ length: employeeCount }, (_, index) =>
    createEmployee(
      `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      { firstName: `Mitarbeiter ${index + 1}` },
    ),
  );

  return createMonthlyPlan({
    year: 2026,
    month: 9,
    title: 'Septemberplan',
    employees,
  });
}

describe('Planungseintrag-Snapshots', () => {
  it('übernimmt feste Werte und berechnet Arbeitszeit mit NB ausdrücklich neu', () => {
    const plan = createPlan();
    const snapshot = createPlanEntrySnapshot({
      id: '30000000-0000-4000-8000-000000000001',
      entryType: createEntryType(),
      planEmployee: plan.employees[0],
    });

    expect(snapshot).toMatchObject({
      planEmployeeId: plan.employees[0].id,
      sourceEntryTypeId: '20000000-0000-4000-8000-000000000001',
      code: 'SN',
      name: 'Spät-Nacht-Dienst',
      startTime: '14:00',
      endTime: '08:00',
      timeValues: {
        attendanceMinutes: 1_080,
        workingMinutes: 600,
        workingWithoutNightReadinessMinutes: 480,
        nightReadinessMinutes: 120,
        nightWorkMinutes: 60,
      },
    });
  });

  it.each(EMPLOYEE_ROLES)(
    'wendet Wochenarbeitszeit für die Rolle %s identisch an',
    (role) => {
      const employee = createEmployee('10000000-0000-4000-8000-000000000001', {
        role,
      });
      const plan = createMonthlyPlan({
        year: 2026,
        month: 9,
        title: 'Septemberplan',
        employees: [employee],
      });
      const snapshot = createPlanEntrySnapshot({
        id: '30000000-0000-4000-8000-000000000001',
        entryType: createEntryType({
          code: 'AZ',
          name: 'Wochenarbeitszeit',
          calculationType: 'weeklyWorkingTime',
          startTime: null,
          endTime: null,
          timeValues: {
            attendanceMinutes: 0,
            workingMinutes: 0,
            workingWithoutNightReadinessMinutes: 0,
            nightReadinessMinutes: 0,
            nightWorkMinutes: 0,
          },
        }),
        planEmployee: plan.employees[0],
      });

      expect(snapshot.startTime).toBeNull();
      expect(snapshot.endTime).toBeNull();
      expect(snapshot.timeValues).toEqual({
        attendanceMinutes: 0,
        workingMinutes: 468,
        workingWithoutNightReadinessMinutes: 468,
        nightReadinessMinutes: 0,
        nightWorkMinutes: 0,
      });
    },
  );

  it('unterstützt eine Wochenarbeitszeit von null Minuten', () => {
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: [
        createEmployee('10000000-0000-4000-8000-000000000001', {
          weeklyWorkingMinutes: 0,
        }),
      ],
    });
    const snapshot = createPlanEntrySnapshot({
      id: '30000000-0000-4000-8000-000000000001',
      entryType: createEntryType({
        calculationType: 'weeklyWorkingTime',
        startTime: null,
        endTime: null,
        timeValues: {
          attendanceMinutes: 0,
          workingMinutes: 0,
          workingWithoutNightReadinessMinutes: 0,
          nightReadinessMinutes: 0,
          nightWorkMinutes: 0,
        },
      }),
      planEmployee: plan.employees[0],
    });

    expect(snapshot.timeValues).toEqual({
      attendanceMinutes: 0,
      workingMinutes: 0,
      workingWithoutNightReadinessMinutes: 0,
      nightReadinessMinutes: 0,
      nightWorkMinutes: 0,
    });
  });

  it('behält den Snapshot nach späteren Änderungen der Ausgangsdaten bei', () => {
    const plan = createPlan();
    const entryType = createEntryType();
    const snapshot = createPlanEntrySnapshot({
      id: '30000000-0000-4000-8000-000000000001',
      entryType,
      planEmployee: plan.employees[0],
    });

    entryType.code = 'NEU';
    entryType.timeValues.workingWithoutNightReadinessMinutes = 0;
    entryType.timeValues.nightReadinessMinutes = 0;
    entryType.timeValues.workingMinutes = 0;
    plan.employees[0].weeklyWorkingMinutes = 0;

    expect(snapshot.code).toBe('SN');
    expect(snapshot.timeValues.workingMinutes).toBe(600);
  });

  it('lehnt inaktive und zur Laufzeit ungültige Eintragsarten ab', () => {
    const plan = createPlan();

    expect(() =>
      createPlanEntrySnapshot({
        id: '30000000-0000-4000-8000-000000000001',
        entryType: createEntryType({ active: false }),
        planEmployee: plan.employees[0],
      }),
    ).toThrow('inaktive Eintragsart');
    expect(() =>
      createPlanEntrySnapshot({
        id: '30000000-0000-4000-8000-000000000001',
        entryType: {
          ...createEntryType(),
          timeValues: {
            ...createEntryType().timeValues,
            workingMinutes: 599,
          },
        },
        planEmployee: plan.employees[0],
      }),
    ).toThrow();
  });
});

describe('Planungszellen ändern', () => {
  it('setzt einen neuen Eintrag ohne den Ausgangsplan zu verändern', () => {
    const plan = createPlan();
    plan.updatedAt = '2026-01-01T00:00:00.000Z';
    const dayId = plan.days[0].id;
    const employeeId = plan.employees[0].id;

    const updatedPlan = setPlanEntry({
      plan,
      planDayId: dayId,
      planEmployeeId: employeeId,
      entryType: createEntryType(),
    });

    expect(plan.days[0].entries).toEqual([]);
    expect(plan.updatedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(updatedPlan.days[0].entries).toHaveLength(1);
    expect(updatedPlan.days[0].entries[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(updatedPlan.days[0].entries[0].planEmployeeId).toBe(employeeId);
    expect(updatedPlan.updatedAt).not.toBe(plan.updatedAt);
    expect(monthlyPlanSchema.safeParse(updatedPlan).success).toBe(true);
  });

  it('ersetzt den gesamten Snapshot und behält seine technische ID', () => {
    const plan = createPlan();
    const dayId = plan.days[0].id;
    const employeeId = plan.employees[0].id;
    const firstPlan = setPlanEntry({
      plan,
      planDayId: dayId,
      planEmployeeId: employeeId,
      entryType: createEntryType(),
    });
    const previousEntryId = firstPlan.days[0].entries[0].id;

    const replacedPlan = setPlanEntry({
      plan: firstPlan,
      planDayId: dayId,
      planEmployeeId: employeeId,
      entryType: createEntryType({
        id: '20000000-0000-4000-8000-000000000002',
        code: '/',
        name: 'Frei',
        startTime: null,
        endTime: null,
        timeValues: {
          attendanceMinutes: 0,
          workingMinutes: 0,
          workingWithoutNightReadinessMinutes: 0,
          nightReadinessMinutes: 0,
          nightWorkMinutes: 0,
        },
      }),
    });

    expect(replacedPlan.days[0].entries).toHaveLength(1);
    expect(replacedPlan.days[0].entries[0]).toMatchObject({
      id: previousEntryId,
      sourceEntryTypeId: '20000000-0000-4000-8000-000000000002',
      code: '/',
      name: 'Frei',
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
  });

  it('verwendet beim erneuten Setzen die aktuelle Definition und weiterhin den Mitarbeiter-Snapshot', () => {
    const employee = createEmployee('10000000-0000-4000-8000-000000000001', {
      weeklyWorkingMinutes: 2_340,
    });
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: [employee],
    });
    employee.weeklyWorkingMinutes = 0;

    const updatedPlan = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType: createEntryType({
        calculationType: 'weeklyWorkingTime',
        startTime: null,
        endTime: null,
        timeValues: {
          attendanceMinutes: 0,
          workingMinutes: 0,
          workingWithoutNightReadinessMinutes: 0,
          nightReadinessMinutes: 0,
          nightWorkMinutes: 0,
        },
      }),
    });

    expect(updatedPlan.days[0].entries[0].timeValues.workingMinutes).toBe(468);
  });

  it('verändert beim Setzen keine vorhandenen Snapshots in anderen Zellen', () => {
    const plan = createPlan();
    const firstPlan = setPlanEntry({
      plan,
      planDayId: plan.days[0].id,
      planEmployeeId: plan.employees[0].id,
      entryType: createEntryType(),
    });
    const existingSnapshot = firstPlan.days[0].entries[0];
    const changedEntryType = createEntryType({ code: 'T', name: 'Tagdienst' });

    const secondPlan = setPlanEntry({
      plan: firstPlan,
      planDayId: firstPlan.days[1].id,
      planEmployeeId: firstPlan.employees[0].id,
      entryType: changedEntryType,
    });

    expect(secondPlan.days[0].entries[0]).toEqual(existingSnapshot);
    expect(secondPlan.days[1].entries[0].code).toBe('T');
  });

  it('entfernt nur den gewählten Snapshot und verändert den Ausgangsplan nicht', () => {
    const plan = createPlan(2);
    const dayId = plan.days[0].id;
    const firstEmployeeId = plan.employees[0].id;
    const secondEmployeeId = plan.employees[1].id;
    const withFirstEntry = setPlanEntry({
      plan,
      planDayId: dayId,
      planEmployeeId: firstEmployeeId,
      entryType: createEntryType(),
    });
    const withBothEntries = setPlanEntry({
      plan: withFirstEntry,
      planDayId: dayId,
      planEmployeeId: secondEmployeeId,
      entryType: createEntryType({
        id: '20000000-0000-4000-8000-000000000002',
      }),
    });
    const remainingEntry = withBothEntries.days[0].entries[1];

    const updatedPlan = removePlanEntry({
      plan: withBothEntries,
      planDayId: dayId,
      planEmployeeId: firstEmployeeId,
    });

    expect(withBothEntries.days[0].entries).toHaveLength(2);
    expect(updatedPlan.days[0].entries).toEqual([remainingEntry]);
    expect(updatedPlan.id).toBe(plan.id);
    expect(updatedPlan.days[0].id).toBe(dayId);
    expect(updatedPlan.employees.map((employee) => employee.id)).toEqual(
      plan.employees.map((employee) => employee.id),
    );
    expect(updatedPlan.createdAt).toBe(plan.createdAt);
  });

  it('lehnt unbekannte Ziele und eine leere zu entfernende Zelle ab', () => {
    const plan = createPlan();

    expect(() =>
      setPlanEntry({
        plan,
        planDayId: '90000000-0000-4000-8000-000000000001',
        planEmployeeId: plan.employees[0].id,
        entryType: createEntryType(),
      }),
    ).toThrow('Kalendertag');
    expect(() =>
      setPlanEntry({
        plan,
        planDayId: plan.days[0].id,
        planEmployeeId: '90000000-0000-4000-8000-000000000001',
        entryType: createEntryType(),
      }),
    ).toThrow('Mitarbeiter');
    expect(() =>
      removePlanEntry({
        plan,
        planDayId: plan.days[0].id,
        planEmployeeId: plan.employees[0].id,
      }),
    ).toThrow('keinen Eintrag');
  });

  it('lehnt einen bereits ungültigen Ausgangsplan ab', () => {
    const plan = createPlan();
    plan.days.pop();

    expect(() =>
      setPlanEntry({
        plan,
        planDayId: plan.days[0].id,
        planEmployeeId: plan.employees[0].id,
        entryType: createEntryType(),
      }),
    ).toThrow();
  });
});
