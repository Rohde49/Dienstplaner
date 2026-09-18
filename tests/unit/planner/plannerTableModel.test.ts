import { describe, expect, it } from 'vitest';

import { createMonthlyPlan } from '../../../src/main/domain/monthlyPlanFactory';
import {
  completePlannerTeamLoad,
  createInitialPlannerPageState,
  openPlannerPlan,
} from '../../../src/renderer/features/planner/plannerState';
import { createPlannerTableModel } from '../../../src/renderer/features/planner/plannerTableModel';
import type { Employee } from '../../../src/shared/schemas';

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

describe('Planungstabellenmodell', () => {
  it('bildet die leere Vorschau aus aktuellem Team und gemeinsamer Monatsauswertung', () => {
    const state = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [
        createEmployee('10000000-0000-4000-8000-000000000001'),
        createEmployee('10000000-0000-4000-8000-000000000002', {
          firstName: 'Inga',
          active: false,
        }),
      ],
    );

    const model = createPlannerTableModel(state.document);

    expect(model.isEditable).toBe(false);
    expect(model.days).toHaveLength(30);
    expect(model.targetFreeDayCount).toBe(8);
    expect(model.days.every((day) => day.planDay === null)).toBe(true);
    expect(model.employees).toHaveLength(1);
    expect(model.employees[0].evaluation).toMatchObject({
      snfServiceCount: 0,
      freeDayCount: 0,
      actualWorkingMinutes: 0,
      targetWorkingMinutes: 10_296,
      workingDifferenceMinutes: -10_296,
    });
  });

  it('verwendet für einen geöffneten Plan ausschließlich dessen Snapshots und Plantage', () => {
    const sourceEmployee = createEmployee(
      '10000000-0000-4000-8000-000000000001',
    );
    const readyState = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 8, 15)),
      [sourceEmployee],
    );
    const plan = createMonthlyPlan({
      year: 2026,
      month: 9,
      title: 'Septemberplan',
      employees: [sourceEmployee],
    });
    sourceEmployee.firstName = 'Geändert';
    sourceEmployee.weeklyWorkingMinutes = 0;
    const loadedState = openPlannerPlan(readyState, plan, false);

    const model = createPlannerTableModel(loadedState.document);

    expect(model.isEditable).toBe(true);
    expect(model.targetFreeDayCount).toBe(8);
    expect(model.employees[0].firstName).toBe('Eva');
    expect(model.employees[0].evaluation.targetWorkingMinutes).toBe(10_296);
    expect(model.days[0].planDay?.id).toBe(plan.days[0].id);
  });

  it('reicht Schulferien als abgeleitete Kalenderinformation weiter', () => {
    const state = completePlannerTeamLoad(
      createInitialPlannerPageState(new Date(2026, 9, 15)),
      [createEmployee('10000000-0000-4000-8000-000000000001')],
    );

    const model = createPlannerTableModel(state.document);
    const firstHoliday = model.days.find(
      (day) => day.calendarDay.date === '2026-10-19',
    );

    expect(firstHoliday?.calendarDay).toMatchObject({
      isSchoolHoliday: true,
      schoolHolidays: [
        { name: 'Herbstferien', isFirstDay: true, isLastDay: false },
      ],
    });
    expect(firstHoliday?.planDay).toBeNull();
  });
});
