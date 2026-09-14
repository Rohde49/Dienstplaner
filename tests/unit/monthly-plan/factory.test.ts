import { describe, expect, it } from 'vitest';

import { createMonthlyPlan } from '../../../src/main/domain/monthlyPlanFactory';
import { monthlyPlanSchema, type Employee } from '../../../src/shared/schemas';

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

describe('Monatsplanerzeugung', () => {
  it('erzeugt einen vollständig validierten Monatsplan mit allen Kalendertagen', () => {
    const plan = createMonthlyPlan({
      year: 2024,
      month: 2,
      title: '  Februarplan  ',
      employees: [createEmployee('10000000-0000-4000-8000-000000000001')],
    });

    expect(monthlyPlanSchema.safeParse(plan).success).toBe(true);
    expect(plan.title).toBe('Februarplan');
    expect(plan.days).toHaveLength(29);
    expect(plan.days[0].date).toBe('2024-02-01');
    expect(plan.days.at(-1)?.date).toBe('2024-02-29');
    expect(
      plan.days.every(
        (day) =>
          day.note === null &&
          day.onCallEmployeeId === null &&
          day.entries.length === 0,
      ),
    ).toBe(true);
  });

  it('übernimmt ausschließlich aktive Mitarbeiter in ihrer aktuellen Reihenfolge', () => {
    const employees = [
      createEmployee('10000000-0000-4000-8000-000000000001', {
        firstName: 'Anna',
        colorKey: 'teal',
      }),
      createEmployee('10000000-0000-4000-8000-000000000002', {
        firstName: 'Berta',
        active: false,
      }),
      createEmployee('10000000-0000-4000-8000-000000000003', {
        firstName: 'Clara',
        lastName: 'Küche',
        role: 'Wirtschaftskraft',
        weeklyWorkingMinutes: 1_800,
        colorKey: 'orange',
      }),
    ];

    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees,
    });

    expect(plan.employees).toMatchObject([
      {
        sourceEmployeeId: employees[0].id,
        firstName: 'Anna',
        lastName: 'Beispiel',
        role: 'Erzieher',
        weeklyWorkingMinutes: 2_340,
        colorKey: 'teal',
        position: 1,
      },
      {
        sourceEmployeeId: employees[2].id,
        firstName: 'Clara',
        lastName: 'Küche',
        role: 'Wirtschaftskraft',
        weeklyWorkingMinutes: 1_800,
        colorKey: 'orange',
        position: 2,
      },
    ]);
    expect(plan.employees[0]).not.toHaveProperty('active');
  });

  it('friert Mitarbeiterdaten unabhängig von späteren Stammdatenänderungen ein', () => {
    const employee = createEmployee('10000000-0000-4000-8000-000000000001');
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: [employee],
    });

    employee.firstName = 'Geändert';
    employee.weeklyWorkingMinutes = 0;
    employee.colorKey = 'yellow';
    employee.active = false;

    expect(plan.employees[0]).toMatchObject({
      firstName: 'Eva',
      weeklyWorkingMinutes: 2_340,
      colorKey: 'blue',
    });
  });

  it('erzeugt für Plan, Mitarbeiter und Tage voneinander unabhängige UUIDs', () => {
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: [
        createEmployee('10000000-0000-4000-8000-000000000001'),
        createEmployee('10000000-0000-4000-8000-000000000002'),
      ],
    });
    const generatedIds = [
      plan.id,
      ...plan.employees.map((employee) => employee.id),
      ...plan.days.map((day) => day.id),
    ];

    expect(new Set(generatedIds).size).toBe(generatedIds.length);
  });

  it('lehnt ungültige Plandaten bei der Erzeugung ab', () => {
    const employees = [createEmployee('10000000-0000-4000-8000-000000000001')];

    expect(() =>
      createMonthlyPlan({
        year: 2026,
        month: 9,
        title: '   ',
        employees,
      }),
    ).toThrow();
    expect(() =>
      createMonthlyPlan({
        year: 1999,
        month: 9,
        title: 'Ungültiger Plan',
        employees,
      }),
    ).toThrow();
  });

  it('lehnt die Anlage ohne aktiven Mitarbeiter ab', () => {
    expect(() =>
      createMonthlyPlan({
        year: 2026,
        month: 9,
        title: 'Septemberplan',
        employees: [
          createEmployee('10000000-0000-4000-8000-000000000001', {
            active: false,
          }),
        ],
      }),
    ).toThrow('mindestens einem aktiven Mitarbeiter');
  });
});
