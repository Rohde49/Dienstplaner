import { describe, expect, it } from 'vitest';

import {
  calculateMonthlyPlanEvaluation,
  type MonthlyPlanEvaluation,
} from '../../../src/shared/calculations';
import { createMonthlyPlan } from '../../../src/main/domain/monthlyPlanFactory';
import {
  EMPLOYEE_ROLES,
  type Employee,
  type MonthlyPlan,
  type PlanEntry,
  type TimeValues,
} from '../../../src/shared/schemas';

const EMPTY_TIME_VALUES: TimeValues = {
  attendanceMinutes: 0,
  workingMinutes: 0,
  workingWithoutNightReadinessMinutes: 0,
  nightReadinessMinutes: 0,
  nightWorkMinutes: 0,
};

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

function createPlan(
  year: number,
  month: number,
  employees: Employee[] = [
    createEmployee('10000000-0000-4000-8000-000000000001'),
  ],
): MonthlyPlan {
  return createMonthlyPlan({
    year,
    month,
    title: 'Testplan',
    employees,
  });
}

function addEntry(
  plan: MonthlyPlan,
  date: string,
  planEmployeeId: string,
  sequence: number,
  overrides: Partial<PlanEntry> = {},
): PlanEntry {
  const entry: PlanEntry = {
    id: `30000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
    planEmployeeId,
    sourceEntryTypeId: `20000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
    code: 'D',
    name: 'Dienst',
    startTime: null,
    endTime: null,
    timeValues: { ...EMPTY_TIME_VALUES },
    ...overrides,
  };
  const day = plan.days.find((candidate) => candidate.date === date);

  if (!day) {
    throw new Error(`Testtag ${date} fehlt im Monatsplan.`);
  }

  day.entries.push(entry);
  return entry;
}

function getEmployeeEvaluation(
  evaluation: MonthlyPlanEvaluation,
  planEmployeeId: string,
) {
  const employeeEvaluation = evaluation.employees.find(
    (employee) => employee.planEmployeeId === planEmployeeId,
  );

  if (!employeeEvaluation) {
    throw new Error(`Auswertung für ${planEmployeeId} fehlt.`);
  }

  return employeeEvaluation;
}

describe('Monatsauswertung', () => {
  it('wertet exakte Dienst- und Frei-Kürzel tagesbezogen aus', () => {
    const plan = createPlan(2026, 3);
    const employeeId = plan.employees[0].id;

    addEntry(plan, '2026-03-02', employeeId, 1, { code: 'SN/F' });
    addEntry(plan, '2026-03-03', employeeId, 2, { code: 'SN' });
    addEntry(plan, '2026-03-04', employeeId, 3, { code: 'F' });
    addEntry(plan, '2026-03-07', employeeId, 4, { code: '/' });
    addEntry(plan, '2026-03-08', employeeId, 5, { code: '/' });
    addEntry(plan, '2026-03-09', employeeId, 6, { code: '/' });

    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result).toMatchObject({
      snfServiceCount: 2,
      freeDayCount: 3,
      freeSaturdayCount: 1,
      freeSundayCount: 1,
    });
  });

  it('erkennt abweichende Kürzel nicht durch nachträgliches Normalisieren', () => {
    const plan = createPlan(2026, 3);
    const employeeId = plan.employees[0].id;
    const entries = [
      addEntry(plan, '2026-03-02', employeeId, 1),
      addEntry(plan, '2026-03-03', employeeId, 2),
      addEntry(plan, '2026-03-04', employeeId, 3),
      addEntry(plan, '2026-03-05', employeeId, 4),
      addEntry(plan, '2026-03-06', employeeId, 5),
    ];

    // Die Werte werden nach der gültigen Planerzeugung absichtlich verändert.
    // Ein erneutes Schema-Parsing würde Leerzeichen entfernen und den Test verfälschen.
    entries[0].code = 'SN/F ';
    entries[1].code = ' SN';
    entries[2].code = 'sn';
    entries[3].code = ' /';
    entries[4].code = '//';

    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result.snfServiceCount).toBe(0);
    expect(result.freeDayCount).toBe(0);
  });

  it('zählt leere Zellen auch am Wochenende nicht als freie Tage', () => {
    const plan = createPlan(2026, 3);
    const employeeId = plan.employees[0].id;

    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result).toMatchObject({
      snfServiceCount: 0,
      freeDayCount: 0,
      freeSaturdayCount: 0,
      freeSundayCount: 0,
      onCallCount: 0,
      workingMinutes: 0,
      workingWithoutNightReadinessMinutes: 0,
      nightReadinessMinutes: 0,
      nightWorkMinutes: 0,
      sundayOrHolidayWorkingWithoutNightReadinessMinutes: 0,
      nightWorkBonusMinutes: 0,
      nightReadinessBonusMinutes: 0,
      actualWorkingMinutes: 0,
    });
  });

  it('zählt Rufbereitschaften unabhängig vom Planungseintrag desselben Tages', () => {
    const plan = createPlan(2026, 3);
    const employeeId = plan.employees[0].id;
    const day = plan.days.find(({ date }) => date === '2026-03-08');

    if (!day) {
      throw new Error('Testtag fehlt im Monatsplan.');
    }

    day.onCallEmployeeId = employeeId;
    addEntry(plan, day.date, employeeId, 1, { code: '/' });

    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result).toMatchObject({
      onCallCount: 1,
      freeDayCount: 1,
      freeSundayCount: 1,
    });
  });

  it('berechnet alle allgemeinen Monatskennzahlen für jede Rolle gleich', () => {
    const employees = EMPLOYEE_ROLES.map((role, index) =>
      createEmployee(
        `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        { role },
      ),
    );
    const plan = createPlan(2026, 2, employees);

    plan.employees.forEach((employee, index) => {
      addEntry(plan, '2026-02-02', employee.id, index + 1, {
        code: 'SN',
        timeValues: {
          attendanceMinutes: 600,
          workingMinutes: 510,
          workingWithoutNightReadinessMinutes: 480,
          nightReadinessMinutes: 30,
          nightWorkMinutes: 15,
        },
      });
    });

    const result = calculateMonthlyPlanEvaluation(plan);

    expect(
      result.employees.map(({ planEmployeeId }) => planEmployeeId),
    ).toEqual(plan.employees.map(({ id }) => id));
    result.employees.forEach((employeeEvaluation) => {
      expect(employeeEvaluation).toEqual({
        ...result.employees[0],
        planEmployeeId: employeeEvaluation.planEmployeeId,
      });
    });
  });

  it('addiert reine Arbeitszeit an Sonntagen und Feiertagen ohne Doppelzählung', () => {
    const plan = createPlan(2026, 4);
    const employeeId = plan.employees[0].id;
    const values = (minutes: number): TimeValues => ({
      ...EMPTY_TIME_VALUES,
      attendanceMinutes: minutes,
      workingMinutes: minutes,
      workingWithoutNightReadinessMinutes: minutes,
    });

    addEntry(plan, '2026-04-03', employeeId, 1, {
      timeValues: values(100),
    }); // Karfreitag
    addEntry(plan, '2026-04-04', employeeId, 2, {
      timeValues: values(200),
    }); // gewöhnlicher Samstag
    addEntry(plan, '2026-04-05', employeeId, 3, {
      timeValues: values(300),
    }); // Ostersonntag: Sonntag und Feiertag
    addEntry(plan, '2026-04-12', employeeId, 4, {
      timeValues: values(400),
    }); // gewöhnlicher Sonntag

    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result.workingWithoutNightReadinessMinutes).toBe(1_000);
    expect(result.sundayOrHolidayWorkingWithoutNightReadinessMinutes).toBe(800);
  });

  it('ordnet einen über Mitternacht dargestellten Dienst vollständig seinem Plantag zu', () => {
    const plan = createPlan(2026, 3);
    const employeeId = plan.employees[0].id;

    addEntry(plan, '2026-03-07', employeeId, 1, {
      startTime: '22:00',
      endTime: '06:00',
      timeValues: {
        ...EMPTY_TIME_VALUES,
        attendanceMinutes: 480,
        workingMinutes: 480,
        workingWithoutNightReadinessMinutes: 480,
      },
    });
    addEntry(plan, '2026-03-08', employeeId, 2, {
      startTime: '22:00',
      endTime: '06:00',
      timeValues: {
        ...EMPTY_TIME_VALUES,
        attendanceMinutes: 480,
        workingMinutes: 480,
        workingWithoutNightReadinessMinutes: 480,
      },
    });

    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result.workingWithoutNightReadinessMinutes).toBe(960);
    expect(result.sundayOrHolidayWorkingWithoutNightReadinessMinutes).toBe(480);
  });

  it('summiert den Monat vor der einmaligen Zuschlagsrundung', () => {
    const plan = createPlan(2026, 3);
    const employeeId = plan.employees[0].id;

    addEntry(plan, '2026-03-02', employeeId, 1, {
      timeValues: {
        ...EMPTY_TIME_VALUES,
        workingMinutes: 1,
        nightReadinessMinutes: 1,
        nightWorkMinutes: 1,
      },
    });
    addEntry(plan, '2026-03-03', employeeId, 2, {
      timeValues: {
        ...EMPTY_TIME_VALUES,
        workingMinutes: 1,
        nightReadinessMinutes: 1,
        nightWorkMinutes: 2,
      },
    });

    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result.nightWorkMinutes).toBe(3);
    expect(result.nightWorkBonusMinutes).toBe(1);
    expect(result.nightReadinessMinutes).toBe(2);
    expect(result.nightReadinessBonusMinutes).toBe(1);
    expect(result.actualWorkingMinutes).toBe(1);
  });

  it('rundet Zuschläge auch bei sehr großen sicheren Minutenwerten exakt', () => {
    const plan = createPlan(2026, 3);
    const employeeId = plan.employees[0].id;
    const nightWorkMinutes = Number.MAX_SAFE_INTEGER - 4;

    addEntry(plan, '2026-03-02', employeeId, 1, {
      timeValues: {
        ...EMPTY_TIME_VALUES,
        workingMinutes: Number.MAX_SAFE_INTEGER,
        nightReadinessMinutes: Number.MAX_SAFE_INTEGER,
        nightWorkMinutes,
      },
    });

    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result.nightWorkBonusMinutes).toBe(1_801_439_850_948_197);
    expect(result.nightReadinessBonusMinutes).toBe(2_251_799_813_685_248);
  });

  it('bildet das vollständige fachliche Beispiel für Februar 2026 ab', () => {
    const plan = createPlan(2026, 2);
    const employeeId = plan.employees[0].id;

    addEntry(plan, '2026-02-02', employeeId, 1, {
      timeValues: {
        attendanceMinutes: 9_121,
        workingMinutes: 9_121,
        workingWithoutNightReadinessMinutes: 9_000,
        nightReadinessMinutes: 121,
        nightWorkMinutes: 13,
      },
    });

    const result = calculateMonthlyPlanEvaluation(plan);

    expect(result.workingDayCount).toBe(20);
    expect(getEmployeeEvaluation(result, employeeId)).toEqual({
      planEmployeeId: employeeId,
      snfServiceCount: 0,
      freeDayCount: 0,
      freeSaturdayCount: 0,
      freeSundayCount: 0,
      onCallCount: 0,
      workingMinutes: 9_121,
      workingWithoutNightReadinessMinutes: 9_000,
      nightReadinessMinutes: 121,
      nightWorkMinutes: 13,
      sundayOrHolidayWorkingWithoutNightReadinessMinutes: 0,
      nightWorkBonusMinutes: 3,
      nightReadinessBonusMinutes: 30,
      targetWorkingMinutes: 9_360,
      actualWorkingMinutes: 9_030,
      workingDifferenceMinutes: -330,
    });
  });

  it('bildet positive und exakt ausgeglichene Soll-/Ist-Differenzen ab', () => {
    const plan = createPlan(2026, 2, [
      createEmployee('10000000-0000-4000-8000-000000000001', {
        weeklyWorkingMinutes: 0,
      }),
      createEmployee('10000000-0000-4000-8000-000000000002', {
        weeklyWorkingMinutes: 0,
      }),
    ]);
    const positiveEmployeeId = plan.employees[0].id;
    const balancedEmployeeId = plan.employees[1].id;

    addEntry(plan, '2026-02-02', positiveEmployeeId, 1, {
      timeValues: {
        ...EMPTY_TIME_VALUES,
        attendanceMinutes: 60,
        workingMinutes: 60,
        workingWithoutNightReadinessMinutes: 60,
      },
    });

    const result = calculateMonthlyPlanEvaluation(plan);

    expect(
      getEmployeeEvaluation(result, positiveEmployeeId)
        .workingDifferenceMinutes,
    ).toBe(60);
    expect(
      getEmployeeEvaluation(result, balancedEmployeeId)
        .workingDifferenceMinutes,
    ).toBe(0);
  });

  it('verwendet die eingefrorene Wochenarbeitszeit und verändert den Monatsplan nicht', () => {
    const sourceEmployee = createEmployee(
      '10000000-0000-4000-8000-000000000001',
      { weeklyWorkingMinutes: 1_500 },
    );
    const plan = createPlan(2026, 2, [sourceEmployee]);
    const employeeId = plan.employees[0].id;
    addEntry(plan, '2026-02-02', employeeId, 1, {
      timeValues: {
        ...EMPTY_TIME_VALUES,
        attendanceMinutes: 300,
        workingMinutes: 300,
        workingWithoutNightReadinessMinutes: 300,
      },
    });
    const planBeforeEvaluation = structuredClone(plan);

    sourceEmployee.weeklyWorkingMinutes = 0;
    calculateMonthlyPlanEvaluation(plan);
    const result = getEmployeeEvaluation(
      calculateMonthlyPlanEvaluation(plan),
      employeeId,
    );

    expect(result.targetWorkingMinutes).toBe(6_000);
    expect(plan).toEqual(planBeforeEvaluation);
  });
});
