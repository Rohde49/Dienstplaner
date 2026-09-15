import {
  removePlanEntry,
  setPlanEntry,
} from '../../../shared/domain/monthlyPlanEntries';
import {
  monthlyPlanSchema,
  type EntryType,
  type MonthlyPlan,
} from '../../../shared/schemas';

function updatePlanDay(
  planValue: MonthlyPlan,
  planDayId: string,
  update: (day: MonthlyPlan['days'][number]) => MonthlyPlan['days'][number],
): MonthlyPlan {
  const plan = monthlyPlanSchema.parse(planValue);
  const dayIndex = plan.days.findIndex((day) => day.id === planDayId);

  if (dayIndex === -1) {
    throw new Error('Der Kalendertag gehört nicht zu diesem Monatsplan.');
  }

  const days = [...plan.days];
  days[dayIndex] = update(days[dayIndex]);

  return monthlyPlanSchema.parse({ ...plan, days });
}

/** Setzt oder ersetzt einen Eintrag ausschließlich im lokalen Entwurf. */
export function setDraftPlanEntry(
  plan: MonthlyPlan,
  planDayId: string,
  planEmployeeId: string,
  entryType: EntryType,
): MonthlyPlan {
  return setPlanEntry({ plan, planDayId, planEmployeeId, entryType });
}

/** Entfernt einen Eintrag ausschließlich aus dem lokalen Entwurf. */
export function removeDraftPlanEntry(
  plan: MonthlyPlan,
  planDayId: string,
  planEmployeeId: string,
): MonthlyPlan {
  return removePlanEntry({ plan, planDayId, planEmployeeId });
}

/** Ändert die Rufbereitschaft eines Tages und prüft die Snapshot-Rolle. */
export function setDraftOnCallEmployee(
  plan: MonthlyPlan,
  planDayId: string,
  planEmployeeId: string | null,
): MonthlyPlan {
  if (planEmployeeId !== null) {
    const employee = plan.employees.find(
      (candidate) => candidate.id === planEmployeeId,
    );

    if (!employee) {
      throw new Error('Der Mitarbeiter gehört nicht zu diesem Monatsplan.');
    }

    if (employee.role !== 'Erzieher') {
      throw new Error('Rufbereitschaft darf nur Erziehern zugeordnet werden.');
    }
  }

  return updatePlanDay(plan, planDayId, (day) => ({
    ...day,
    onCallEmployeeId: planEmployeeId,
  }));
}

/** Übernimmt eine Tagesbemerkung mit den gemeinsamen Schema-Regeln. */
export function setDraftDayNote(
  plan: MonthlyPlan,
  planDayId: string,
  note: string,
): MonthlyPlan {
  return updatePlanDay(plan, planDayId, (day) => ({ ...day, note }));
}

/** Übernimmt einen Plantitel mit den gemeinsamen Schema-Regeln. */
export function setDraftPlanTitle(
  plan: MonthlyPlan,
  title: string,
): MonthlyPlan {
  return monthlyPlanSchema.parse({ ...plan, title });
}
