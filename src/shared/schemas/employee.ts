import { z } from 'zod';

/** Enthält alle Farben, die einem Mitarbeiter zugeordnet werden können. */
export const EMPLOYEE_COLOR_KEYS = [
  'blue',
  'emerald',
  'amber',
  'violet',
  'rose',
  'cyan',
] as const;

export const employeeColorKeySchema = z.enum(EMPLOYEE_COLOR_KEYS);

export const employeeIdSchema = z.string().uuid();

/** Prüft einen vollständig gespeicherten Mitarbeiter. */
export const employeeSchema = z
  .object({
    id: employeeIdSchema,
    firstName: z
      .string()
      .trim()
      .min(1, 'Der Vorname ist erforderlich.')
      .max(100, 'Der Vorname darf höchstens 100 Zeichen enthalten.'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Der Nachname ist erforderlich.')
      .max(100, 'Der Nachname darf höchstens 100 Zeichen enthalten.'),
    role: z
      .string()
      .trim()
      .min(1, 'Die Rolle ist erforderlich.')
      .max(100, 'Die Rolle darf höchstens 100 Zeichen enthalten.'),
    weeklyWorkingMinutes: z
      .number()
      .int('Die Wochenarbeitszeit muss minutengenau angegeben werden.')
      .min(0, 'Die Wochenarbeitszeit darf nicht negativ sein.')
      .max(
        10_080,
        'Die Wochenarbeitszeit darf 168 Stunden nicht überschreiten.',
      ),
    colorKey: employeeColorKeySchema,
    active: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

/** Prüft die Eingaben zum Anlegen oder Bearbeiten eines Mitarbeiters. */
export const employeeInputSchema = employeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/** Prüft den vollständigen Aufbau der lokalen Mitarbeiterdatei. */
export const employeesFileSchema = z
  .object({
    schemaVersion: z.literal(1),
    updatedAt: z.string().datetime(),
    employees: z.array(employeeSchema),
  })
  .strict();

export type EmployeeColorKey = z.infer<typeof employeeColorKeySchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeInput = z.infer<typeof employeeInputSchema>;
export type EmployeesFile = z.infer<typeof employeesFileSchema>;
