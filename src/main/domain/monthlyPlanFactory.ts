import { randomUUID } from 'node:crypto';

import { createMonthCalendar } from '../../shared/calculations';
import {
  monthlyPlanSchema,
  type Employee,
  type MonthlyPlan,
  type PlanDay,
  type PlanEmployee,
} from '../../shared/schemas';

export interface CreateMonthlyPlanInput {
  year: number;
  month: number;
  title: string;
  employees: readonly Employee[];
}

/**
 * Erzeugt einen vollständigen Monatsplan mit einem eingefrorenen Stand aller
 * zu diesem Zeitpunkt aktiven Mitarbeiter.
 */
export function createMonthlyPlan({
  year,
  month,
  title,
  employees,
}: CreateMonthlyPlanInput): MonthlyPlan {
  const timestamp = new Date().toISOString();

  const planEmployees: PlanEmployee[] = employees
    .filter((employee) => employee.active)
    .map((employee, index) => ({
      id: randomUUID(),
      sourceEmployeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      weeklyWorkingMinutes: employee.weeklyWorkingMinutes,
      colorKey: employee.colorKey,
      position: index + 1,
    }));

  if (planEmployees.length === 0) {
    throw new Error(
      'Ein Monatsplan kann nur mit mindestens einem aktiven Mitarbeiter erstellt werden.',
    );
  }

  return monthlyPlanSchema.parse({
    id: randomUUID(),
    year,
    month,
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    employees: planEmployees,
    days: createMonthCalendar(year, month).map((calendarDay): PlanDay => ({
      id: randomUUID(),
      date: calendarDay.date,
      note: null,
      onCallEmployeeId: null,
      entries: [],
    })),
  });
}
