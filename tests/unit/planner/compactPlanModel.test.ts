import { describe, expect, it } from 'vitest';

import { createMonthlyPlan } from '../../../src/main/domain/monthlyPlanFactory';
import {
  createCompactPlanModel,
  formatCompactClockTime,
} from '../../../src/renderer/features/planner/compactPlanModel';
import type {
  Employee,
  MonthlyPlan,
  PlanEntry,
} from '../../../src/shared/schemas';

const EMPTY_TIME_VALUES = {
  attendanceMinutes: 0,
  workingMinutes: 0,
  workingWithoutNightReadinessMinutes: 0,
  nightReadinessMinutes: 0,
  nightWorkMinutes: 0,
};

function createEmployee(
  sequence: number,
  overrides: Partial<Employee> = {},
): Employee {
  return {
    id: `10000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
    firstName: `Vorname${sequence}`,
    lastName: `Nachname${sequence}`,
    role: 'Erzieher',
    weeklyWorkingMinutes: 2_340,
    colorKey: 'blue',
    active: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    ...overrides,
  };
}

function addEntry(
  plan: MonthlyPlan,
  date: string,
  employeeId: string,
  overrides: Partial<PlanEntry> = {},
): void {
  const day = plan.days.find((candidate) => candidate.date === date);

  if (!day) {
    throw new Error(`Testtag ${date} fehlt.`);
  }

  day.entries.push({
    id: '30000000-0000-4000-8000-000000000001',
    planEmployeeId: employeeId,
    sourceEntryTypeId: '20000000-0000-4000-8000-000000000001',
    code: 'D',
    name: 'Dienst',
    startTime: null,
    endTime: null,
    timeValues: { ...EMPTY_TIME_VALUES },
    ...overrides,
  });
}

describe('Kompaktansichtsmodell', () => {
  it.each([
    ['05:30', '5:30'],
    ['09:00', '9'],
    ['12:00', '12'],
    ['22:30', '22:30'],
    ['00:00', '0'],
  ])('formatiert die Uhrzeit %s kurz als %s', (clockTime, expected) => {
    expect(formatCompactClockTime(clockTime)).toBe(expected);
  });

  it('bereitet Kopf, Tagesdaten, Einträge, Feiertage und Abschlusswerte auf', () => {
    const plan = createMonthlyPlan({
      year: 2026,
      month: 10,
      title: 'Oktoberplan',
      employees: [
        createEmployee(1, { firstName: 'Eva', lastName: 'Müller' }),
        createEmployee(2, { firstName: 'Max', lastName: 'Müller' }),
      ],
    });
    plan.updatedAt = '2026-09-30T21:45:00.000Z';
    const firstEmployeeId = plan.employees[0].id;
    const secondEmployeeId = plan.employees[1].id;
    const holiday = plan.days.find((day) => day.date === '2026-10-03')!;
    holiday.onCallEmployeeId = secondEmployeeId;
    holiday.note = 'Übergabe mit Team';
    addEntry(plan, holiday.date, firstEmployeeId, {
      startTime: '05:30',
      endTime: '09:00',
      timeValues: {
        ...EMPTY_TIME_VALUES,
        workingMinutes: 210,
        workingWithoutNightReadinessMinutes: 210,
      },
    });

    const model = createCompactPlanModel(plan);
    const holidayRow = model.days.find((day) => day.date === holiday.date)!;

    expect(model).toMatchObject({
      title: 'Oktoberplan',
      periodLabel: 'Oktober 2026',
      savedDateLabel: '30.09.2026',
    });
    expect(model.employees.map((employee) => employee.displayName)).toEqual([
      'E. Müller',
      'M. Müller',
    ]);
    expect(model.employees[0]).toMatchObject({
      actualWorkingTime: '03:30',
      weeklyWorkingTime: '39:00',
    });
    expect(holidayRow).toMatchObject({
      dateLabel: 'Sa 03.10.*',
      isWeekend: true,
      isHoliday: true,
      onCallEmployeeName: 'M. Müller',
      note: 'Übergabe mit Team',
    });
    expect(holidayRow.entries[firstEmployeeId]).toEqual({
      code: 'D',
      timeRange: '5:30–9',
    });
    expect(holidayRow.entries[secondEmployeeId]).toBeNull();
    expect(model.holidays).toContainEqual({
      date: '2026-10-03',
      label: '* 03.10. – Tag der Deutschen Einheit',
    });
  });

  it('zeigt bei einem Eintrag ohne Uhrzeit nur das Kürzel', () => {
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: [createEmployee(1)],
    });
    const employeeId = plan.employees[0].id;
    addEntry(plan, '2026-09-01', employeeId, { code: 'F' });

    const model = createCompactPlanModel(plan);

    expect(model.days[0].entries[employeeId]).toEqual({
      code: 'F',
      timeRange: null,
    });
  });

  it('bildet den Grenzfall mit neun Mitarbeitern und 31 Tagen vollständig ab', () => {
    const plan = createMonthlyPlan({
      year: 2026,
      month: 7,
      title: 'Grenzfall',
      employees: Array.from({ length: 9 }, (_, index) =>
        createEmployee(index + 1),
      ),
    });

    const model = createCompactPlanModel(plan);

    expect(model.employees).toHaveLength(9);
    expect(model.days).toHaveLength(31);
    expect(Object.keys(model.days[0].entries)).toHaveLength(9);
  });

  it('bleibt unabhängig von einem abweichenden Entwurf', () => {
    const baseline = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Gespeicherter Plan',
      employees: [createEmployee(1)],
    });
    const draft = structuredClone(baseline);
    draft.title = 'Ungespeicherter Entwurf';
    draft.days[0].note = 'Noch nicht gespeichert';

    const firstResult = createCompactPlanModel(baseline);
    createCompactPlanModel(draft);
    const secondResult = createCompactPlanModel(baseline);

    expect(secondResult).toEqual(firstResult);
    expect(secondResult.title).toBe('Gespeicherter Plan');
    expect(secondResult.days[0].note).toBeNull();
  });
});
