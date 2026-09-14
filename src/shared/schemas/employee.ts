import { z } from 'zod';

/** Enthält alle Farben, die einem Mitarbeiter zugeordnet werden können. */
export const EMPLOYEE_COLOR_KEYS = [
  'blue',
  'green',
  'red',
  'orange',
  'yellow',
  'purple',
  'pink',
  'teal',
] as const;

export const employeeColorKeySchema = z.enum(EMPLOYEE_COLOR_KEYS);

export type EmployeeColorKey = z.infer<typeof employeeColorKeySchema>;

export const employeeIdSchema = z.string().uuid();

/** Enthält alle fachlich zulässigen Mitarbeiterrollen. */
export const EMPLOYEE_ROLES = [
  'Erzieher',
  'Wirtschaftskraft',
  'Praktikant',
] as const;

export const employeeRoleSchema = z.enum(EMPLOYEE_ROLES);

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
    role: employeeRoleSchema,
    weeklyWorkingMinutes: z
      .number()
      .int('Die Wochenarbeitszeit muss minutengenau angegeben werden.')
      .min(0, 'Die Wochenarbeitszeit darf nicht negativ sein.')
      .max(
        10_080,
        'Die Wochenarbeitszeit darf 168 Stunden nicht überschreiten.',
      )
      .multipleOf(
        5,
        'Die Wochenarbeitszeit muss in Fünf-Minuten-Schritten angegeben werden.',
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
    schemaVersion: z.literal(3),
    updatedAt: z.string().datetime(),
    employees: z.array(employeeSchema),
  })
  .strict()
  .superRefine((file, context) => {
    const knownIds = new Set<string>();

    file.employees.forEach((employee, index) => {
      if (knownIds.has(employee.id)) {
        context.addIssue({
          code: 'custom',
          path: ['employees', index, 'id'],
          message: 'Mitarbeiter-IDs müssen innerhalb der Datei eindeutig sein.',
        });
      }

      knownIds.add(employee.id);
    });
  });

export type EmployeeRole = z.infer<typeof employeeRoleSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeInput = z.infer<typeof employeeInputSchema>;
export type EmployeesFile = z.infer<typeof employeesFileSchema>;
