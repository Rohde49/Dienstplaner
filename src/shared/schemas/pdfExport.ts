import { z } from 'zod';

import { monthlyPlanInputSchema } from './monthlyPlan';

/** Prüft ausschließlich die für Dateiname und PDF-Ausgabe benötigten Planangaben. */
export const pdfExportRequestSchema = monthlyPlanInputSchema;

/** Beschreibt das einzige Ergebnis, das die Oberfläche vom Export erhält. */
export const pdfExportResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('saved') }).strict(),
  z.object({ status: z.literal('cancelled') }).strict(),
]);

export type PdfExportRequest = z.infer<typeof pdfExportRequestSchema>;
export type PdfExportResult = z.infer<typeof pdfExportResultSchema>;
