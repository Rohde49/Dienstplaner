import { z } from 'zod';

import { monthlyPlanSchema } from './monthlyPlan';

/** Prüft die technische Dateihülle eines gespeicherten Monatsplans. */
export const monthlyPlanFileSchema = z
  .object({
    schemaVersion: z.literal(3),
    plan: monthlyPlanSchema,
  })
  .strict();

export type MonthlyPlanFile = z.infer<typeof monthlyPlanFileSchema>;

/** Kleine Übersicht eines Plans für Auswahllisten. */
export type MonthlyPlanSummary = Pick<
  MonthlyPlanFile['plan'],
  'id' | 'year' | 'month' | 'title' | 'createdAt' | 'updatedAt'
>;

/** Ergebnis beim Laden einschließlich einer möglichen Wiederherstellungswarnung. */
export type MonthlyPlanLoadResult = {
  plan: MonthlyPlanFile['plan'] | null;
  recoveryWarning: string | null;
};
