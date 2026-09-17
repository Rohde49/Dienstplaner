import {
  calculateEmptyMonthlyPlanEvaluation,
  calculateMonthlyPlanEvaluation,
  createMonthCalendar,
  type CalendarDay,
  type EmployeeMonthlyEvaluation,
} from '../../../shared/calculations';
import type {
  EmployeeColorKey,
  EmployeeRole,
  PlanDay,
} from '../../../shared/schemas';
import type { PlannerDocumentState, PlannerPeriod } from './plannerState';

export type PlannerTableEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  colorKey: EmployeeColorKey;
  evaluation: EmployeeMonthlyEvaluation;
};

export type PlannerTableDay = {
  calendarDay: CalendarDay;
  planDay: PlanDay | null;
};

export type PlannerTableModel = {
  period: PlannerPeriod;
  employees: readonly PlannerTableEmployee[];
  days: readonly PlannerTableDay[];
  targetFreeDayCount: number;
  isEditable: boolean;
};

/** Ordnet Vorschau- oder Snapshotdaten der gemeinsamen Tabellendarstellung zu. */
export function createPlannerTableModel(
  document: PlannerDocumentState,
): PlannerTableModel {
  if (document.kind === 'preview') {
    const { preview } = document;
    const evaluation = calculateEmptyMonthlyPlanEvaluation(
      preview.period.year,
      preview.period.month,
      preview.employees,
    );
    const evaluationsById = new Map(
      evaluation.employees.map((employee) => [
        employee.planEmployeeId,
        employee,
      ]),
    );

    return {
      period: preview.period,
      employees: preview.employees.map((employee) => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        colorKey: employee.colorKey,
        evaluation: evaluationsById.get(employee.id)!,
      })),
      days: preview.calendarDays.map((calendarDay): PlannerTableDay => ({
        calendarDay,
        planDay: null,
      })),
      targetFreeDayCount: evaluation.targetFreeDayCount,
      isEditable: false,
    };
  }

  const plan = document.draft;
  const evaluation = calculateMonthlyPlanEvaluation(plan);
  const evaluationsById = new Map(
    evaluation.employees.map((employee) => [employee.planEmployeeId, employee]),
  );
  const planDaysByDate = new Map(plan.days.map((day) => [day.date, day]));

  return {
    period: { year: plan.year, month: plan.month },
    employees: [...plan.employees]
      .sort((first, second) => first.position - second.position)
      .map((employee) => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        colorKey: employee.colorKey,
        evaluation: evaluationsById.get(employee.id)!,
      })),
    days: createMonthCalendar(plan.year, plan.month).map((calendarDay) => ({
      calendarDay,
      planDay: planDaysByDate.get(calendarDay.date) ?? null,
    })),
    targetFreeDayCount: evaluation.targetFreeDayCount,
    isEditable: true,
  };
}
