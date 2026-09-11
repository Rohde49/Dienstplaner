import { randomUUID } from 'node:crypto';

import { createPlanEntrySnapshot } from '../../shared/domain/planEntrySnapshot';
import { monthlyPlanSchema, type MonthlyPlan } from '../../shared/schemas';

export interface SetPlanEntryInput {
  plan: unknown;
  planDayId: string;
  planEmployeeId: string;
  entryType: unknown;
}

export interface RemovePlanEntryInput {
  plan: unknown;
  planDayId: string;
  planEmployeeId: string;
}

/** Setzt einen Eintrag oder ersetzt den Snapshot einer bereits belegten Zelle. */
export function setPlanEntry({
  plan: planValue,
  planDayId,
  planEmployeeId,
  entryType,
}: SetPlanEntryInput): MonthlyPlan {
  const plan = monthlyPlanSchema.parse(planValue);
  const dayIndex = plan.days.findIndex((day) => day.id === planDayId);

  if (dayIndex === -1) {
    throw new Error('Der Kalendertag gehört nicht zu diesem Monatsplan.');
  }

  const planEmployee = plan.employees.find(
    (employee) => employee.id === planEmployeeId,
  );

  if (!planEmployee) {
    throw new Error('Der Mitarbeiter gehört nicht zu diesem Monatsplan.');
  }

  const day = plan.days[dayIndex];
  const existingEntryIndex = day.entries.findIndex(
    (entry) => entry.planEmployeeId === planEmployeeId,
  );
  const entryId =
    existingEntryIndex === -1
      ? randomUUID()
      : day.entries[existingEntryIndex].id;
  const snapshot = createPlanEntrySnapshot({
    id: entryId,
    entryType,
    planEmployee,
  });

  const entries = [...day.entries];
  if (existingEntryIndex === -1) {
    entries.push(snapshot);
  } else {
    entries[existingEntryIndex] = snapshot;
  }

  const days = [...plan.days];
  days[dayIndex] = { ...day, entries };

  return monthlyPlanSchema.parse({
    ...plan,
    updatedAt: new Date().toISOString(),
    days,
  });
}

/** Entfernt den Snapshot aus einer belegten Planungszelle. */
export function removePlanEntry({
  plan: planValue,
  planDayId,
  planEmployeeId,
}: RemovePlanEntryInput): MonthlyPlan {
  const plan = monthlyPlanSchema.parse(planValue);
  const dayIndex = plan.days.findIndex((day) => day.id === planDayId);

  if (dayIndex === -1) {
    throw new Error('Der Kalendertag gehört nicht zu diesem Monatsplan.');
  }

  if (!plan.employees.some((employee) => employee.id === planEmployeeId)) {
    throw new Error('Der Mitarbeiter gehört nicht zu diesem Monatsplan.');
  }

  const day = plan.days[dayIndex];
  const remainingEntries = day.entries.filter(
    (entry) => entry.planEmployeeId !== planEmployeeId,
  );

  if (remainingEntries.length === day.entries.length) {
    throw new Error('Die Planungszelle enthält keinen Eintrag.');
  }

  const days = [...plan.days];
  days[dayIndex] = { ...day, entries: remainingEntries };

  return monthlyPlanSchema.parse({
    ...plan,
    updatedAt: new Date().toISOString(),
    days,
  });
}
