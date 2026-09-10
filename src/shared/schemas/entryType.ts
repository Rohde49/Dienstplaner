import { z } from 'zod';

export const CALCULATION_TYPES = ['fixed', 'weeklyWorkingTime'] as const;

export const calculationTypeSchema = z.enum(CALCULATION_TYPES);
export const entryTypeIdSchema = z.string().uuid();

const minuteValueSchema = z
  .number()
  .int('Der Zeitwert muss minutengenau angegeben werden.')
  .nonnegative('Der Zeitwert darf nicht negativ sein.')
  .max(
    Number.MAX_SAFE_INTEGER,
    'Der Zeitwert ist zu groß, um zuverlässig gespeichert zu werden.',
  );

export const timeValuesSchema = z
  .object({
    attendanceMinutes: minuteValueSchema,
    workingMinutes: minuteValueSchema,
    workingWithoutNightReadinessMinutes: minuteValueSchema,
    nightReadinessMinutes: minuteValueSchema,
    nightWorkMinutes: minuteValueSchema,
  })
  .strict();

const clockTimeSchema = z
  .string()
  .regex(
    /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    'Bitte geben Sie eine gültige Uhrzeit im Format HH:mm ein.',
  )
  .nullable();

const entryTypeObjectSchema = z
  .object({
    id: entryTypeIdSchema,
    code: z
      .string()
      .trim()
      .min(1, 'Das Kürzel ist erforderlich.')
      .max(20, 'Das Kürzel darf höchstens 20 Zeichen enthalten.'),
    name: z
      .string()
      .trim()
      .min(1, 'Die Bezeichnung ist erforderlich.')
      .max(100, 'Die Bezeichnung darf höchstens 100 Zeichen enthalten.'),
    calculationType: calculationTypeSchema,
    startTime: clockTimeSchema,
    endTime: clockTimeSchema,
    timeValues: timeValuesSchema,
    active: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

type EntryTypeValidationValue = {
  calculationType: z.infer<typeof calculationTypeSchema>;
  startTime?: string | null;
  endTime?: string | null;
  timeValues: z.infer<typeof timeValuesSchema>;
};

/** Prüft Regeln, die mehrere Felder einer Eintragsart betreffen. */
function validateEntryTypeRelations(
  value: EntryTypeValidationValue,
  context: z.RefinementCtx,
): void {
  if ((value.startTime === null) !== (value.endTime === null)) {
    context.addIssue({
      code: 'custom',
      path: [value.startTime === null ? 'startTime' : 'endTime'],
      message: 'Start- und Endzeit müssen gemeinsam angegeben werden.',
    });
  }

  if (value.calculationType !== 'weeklyWorkingTime') {
    return;
  }

  if (value.startTime !== null || value.endTime !== null) {
    context.addIssue({
      code: 'custom',
      path: ['calculationType'],
      message:
        'Bei der Berechnung aus der Wochenarbeitszeit sind keine Uhrzeiten zulässig.',
    });
  }

  if (Object.values(value.timeValues).some((minutes) => minutes !== 0)) {
    context.addIssue({
      code: 'custom',
      path: ['calculationType'],
      message:
        'Bei der Berechnung aus der Wochenarbeitszeit werden keine festen Zeitwerte gespeichert.',
    });
  }
}

/** Prüft eine vollständig gespeicherte Eintragsart. */
export const entryTypeSchema = entryTypeObjectSchema.superRefine(
  validateEntryTypeRelations,
);

/** Prüft die Eingaben zum Anlegen oder Bearbeiten einer Eintragsart. */
export const entryTypeInputSchema = entryTypeObjectSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .superRefine(validateEntryTypeRelations);

/** Prüft den vollständigen Aufbau der lokalen Eintragsartendatei. */
export const entryTypesFileSchema = z
  .object({
    schemaVersion: z.literal(1),
    updatedAt: z.string().datetime(),
    entryTypes: z.array(entryTypeSchema),
  })
  .strict();

export type CalculationType = z.infer<typeof calculationTypeSchema>;
export type TimeValues = z.infer<typeof timeValuesSchema>;
export type EntryType = z.infer<typeof entryTypeSchema>;
export type EntryTypeInput = z.infer<typeof entryTypeInputSchema>;
export type EntryTypesFile = z.infer<typeof entryTypesFileSchema>;
