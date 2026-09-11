import { z } from 'zod';

import {
  MAX_CALENDAR_YEAR,
  MIN_CALENDAR_YEAR,
  createMonthCalendar,
} from '../calculations/calendar';
import { employeeColorKeySchema, employeeRoleSchema } from './employee';
import { entryCodeSchema, timeValuesSchema } from './entryType';

const uuidSchema = z.string().uuid();
export const monthlyPlanIdSchema = uuidSchema;

const requiredNameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} ist erforderlich.`)
    .max(100, `${label} darf höchstens 100 Zeichen enthalten.`);

const weeklyWorkingMinutesSchema = z
  .number()
  .int('Die Wochenarbeitszeit muss minutengenau angegeben werden.')
  .min(0, 'Die Wochenarbeitszeit darf nicht negativ sein.')
  .max(10_080, 'Die Wochenarbeitszeit darf 168 Stunden nicht überschreiten.')
  .multipleOf(
    5,
    'Die Wochenarbeitszeit muss in Fünf-Minuten-Schritten angegeben werden.',
  );

const clockTimeSchema = z
  .string()
  .trim()
  .regex(
    /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    'Bitte geben Sie eine gültige Uhrzeit im Format HH:MM ein.',
  )
  .nullable();

const calendarDateSchema = z.string().refine(
  (date) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (!match) {
      return false;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (
      year < MIN_CALENDAR_YEAR ||
      year > MAX_CALENDAR_YEAR ||
      month < 1 ||
      month > 12
    ) {
      return false;
    }

    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    return (
      parsedDate.getUTCFullYear() === year &&
      parsedDate.getUTCMonth() === month - 1 &&
      parsedDate.getUTCDate() === day
    );
  },
  {
    message:
      'Das Datum muss ein gültiges Kalenderdatum im Format YYYY-MM-DD sein.',
  },
);

/** Prüft einen im Monatsplan eingefrorenen Mitarbeiterstand. */
export const planEmployeeSchema = z
  .object({
    id: uuidSchema,
    sourceEmployeeId: uuidSchema,
    firstName: requiredNameSchema('Der Vorname'),
    lastName: requiredNameSchema('Der Nachname'),
    role: employeeRoleSchema,
    weeklyWorkingMinutes: weeklyWorkingMinutesSchema,
    colorKey: employeeColorKeySchema,
    position: z.number().int().positive(),
  })
  .strict();

const planEntryObjectSchema = z
  .object({
    id: uuidSchema,
    planEmployeeId: uuidSchema,
    sourceEntryTypeId: uuidSchema,
    code: entryCodeSchema,
    name: requiredNameSchema('Die Bezeichnung'),
    startTime: clockTimeSchema,
    endTime: clockTimeSchema,
    timeValues: timeValuesSchema,
  })
  .strict();

/** Prüft den vollständigen Snapshot eines Planungseintrags. */
export const planEntrySchema = planEntryObjectSchema.superRefine(
  (entry, context) => {
    if ((entry.startTime === null) !== (entry.endTime === null)) {
      context.addIssue({
        code: 'custom',
        path: [entry.startTime === null ? 'startTime' : 'endTime'],
        message: 'Start- und Endzeit müssen gemeinsam angegeben werden.',
      });
    }
  },
);

const planNoteSchema = z
  .string()
  .trim()
  .transform((note) => (note.length === 0 ? null : note))
  .nullable();

/** Prüft einen Kalendertag samt seiner planlokalen Inhalte. */
export const planDaySchema = z
  .object({
    id: uuidSchema,
    date: calendarDateSchema,
    note: planNoteSchema,
    onCallEmployeeId: uuidSchema.nullable(),
    entries: z.array(planEntrySchema),
  })
  .strict();

const monthlyPlanObjectSchema = z
  .object({
    id: uuidSchema,
    year: z.number().int().min(MIN_CALENDAR_YEAR).max(MAX_CALENDAR_YEAR),
    month: z.number().int().min(1).max(12),
    title: z
      .string()
      .trim()
      .min(1, 'Der Titel ist erforderlich.')
      .max(200, 'Der Titel darf höchstens 200 Zeichen enthalten.'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    employees: z.array(planEmployeeSchema),
    days: z.array(planDaySchema),
  })
  .strict();

/** Prüft die Angaben zum Erstellen eines neuen Monatsplans. */
export const monthlyPlanInputSchema = monthlyPlanObjectSchema.pick({
  year: true,
  month: true,
  title: true,
});

const timeValueKeys = [
  'attendanceMinutes',
  'workingMinutes',
  'workingWithoutNightReadinessMinutes',
  'nightReadinessMinutes',
  'nightWorkMinutes',
] as const;

/** Prüft alle Beziehungen innerhalb eines vollständigen Monatsplans. */
export const monthlyPlanSchema = monthlyPlanObjectSchema.superRefine(
  (plan, context) => {
    if (
      !Number.isInteger(plan.year) ||
      plan.year < MIN_CALENDAR_YEAR ||
      plan.year > MAX_CALENDAR_YEAR ||
      !Number.isInteger(plan.month) ||
      plan.month < 1 ||
      plan.month > 12
    ) {
      return;
    }

    const expectedDates = createMonthCalendar(plan.year, plan.month).map(
      (day) => day.date,
    );

    if (plan.days.length !== expectedDates.length) {
      context.addIssue({
        code: 'custom',
        path: ['days'],
        message:
          'Der Monatsplan muss jeden Kalendertag des ausgewählten Monats genau einmal enthalten.',
      });
    }

    const comparableDayCount = Math.min(plan.days.length, expectedDates.length);
    for (let dayIndex = 0; dayIndex < comparableDayCount; dayIndex += 1) {
      if (plan.days[dayIndex].date !== expectedDates[dayIndex]) {
        context.addIssue({
          code: 'custom',
          path: ['days', dayIndex, 'date'],
          message:
            'Die Kalendertage müssen vollständig und chronologisch zum ausgewählten Monat gehören.',
        });
      }
    }

    const employeesById = new Map(
      plan.employees.map((employee) => [employee.id, employee]),
    );
    const employeeIds = new Set<string>();
    const sourceEmployeeIds = new Set<string>();
    const positions = new Set<number>();

    plan.employees.forEach((employee, employeeIndex) => {
      if (employeeIds.has(employee.id)) {
        context.addIssue({
          code: 'custom',
          path: ['employees', employeeIndex, 'id'],
          message: 'Planmitarbeiter-IDs müssen eindeutig sein.',
        });
      }
      employeeIds.add(employee.id);

      if (sourceEmployeeIds.has(employee.sourceEmployeeId)) {
        context.addIssue({
          code: 'custom',
          path: ['employees', employeeIndex, 'sourceEmployeeId'],
          message: 'Herkunfts-IDs der Planmitarbeiter müssen eindeutig sein.',
        });
      }
      sourceEmployeeIds.add(employee.sourceEmployeeId);

      if (positions.has(employee.position)) {
        context.addIssue({
          code: 'custom',
          path: ['employees', employeeIndex, 'position'],
          message: 'Mitarbeiterpositionen müssen eindeutig sein.',
        });
      }
      positions.add(employee.position);
    });

    for (let position = 1; position <= plan.employees.length; position += 1) {
      if (!positions.has(position)) {
        context.addIssue({
          code: 'custom',
          path: ['employees'],
          message:
            'Mitarbeiterpositionen müssen eine lückenlose Folge von 1 bis zur Mitarbeiteranzahl bilden.',
        });
        break;
      }
    }

    const dayIds = new Set<string>();
    const entryIds = new Set<string>();
    const summedTimeValuesByEmployee = new Map<
      string,
      Record<(typeof timeValueKeys)[number], number>
    >();
    const unsafeSums = new Set<string>();

    plan.days.forEach((day, dayIndex) => {
      if (dayIds.has(day.id)) {
        context.addIssue({
          code: 'custom',
          path: ['days', dayIndex, 'id'],
          message: 'Plantag-IDs müssen innerhalb des Plans eindeutig sein.',
        });
      }
      dayIds.add(day.id);

      if (day.onCallEmployeeId !== null) {
        const onCallEmployee = employeesById.get(day.onCallEmployeeId);

        if (!onCallEmployee) {
          context.addIssue({
            code: 'custom',
            path: ['days', dayIndex, 'onCallEmployeeId'],
            message:
              'Die Rufbereitschaft muss auf einen Mitarbeiter desselben Monatsplans verweisen.',
          });
        } else if (onCallEmployee.role !== 'Erzieher') {
          context.addIssue({
            code: 'custom',
            path: ['days', dayIndex, 'onCallEmployeeId'],
            message: 'Rufbereitschaft darf nur Erziehern zugeordnet werden.',
          });
        }
      }

      const assignedEmployeeIds = new Set<string>();

      day.entries.forEach((entry, entryIndex) => {
        const entryPath = ['days', dayIndex, 'entries', entryIndex] as const;

        if (entryIds.has(entry.id)) {
          context.addIssue({
            code: 'custom',
            path: [...entryPath, 'id'],
            message:
              'Planungseintrags-IDs müssen im gesamten Monatsplan eindeutig sein.',
          });
        }
        entryIds.add(entry.id);

        if (!employeesById.has(entry.planEmployeeId)) {
          context.addIssue({
            code: 'custom',
            path: [...entryPath, 'planEmployeeId'],
            message:
              'Der Planungseintrag muss auf einen Mitarbeiter desselben Monatsplans verweisen.',
          });
        }

        if (assignedEmployeeIds.has(entry.planEmployeeId)) {
          context.addIssue({
            code: 'custom',
            path: [...entryPath, 'planEmployeeId'],
            message:
              'Pro Mitarbeiter und Kalendertag ist höchstens ein Planungseintrag zulässig.',
          });
        }
        assignedEmployeeIds.add(entry.planEmployeeId);

        const summedTimeValues =
          summedTimeValuesByEmployee.get(entry.planEmployeeId) ??
          (Object.fromEntries(timeValueKeys.map((key) => [key, 0])) as Record<
            (typeof timeValueKeys)[number],
            number
          >);
        summedTimeValuesByEmployee.set(entry.planEmployeeId, summedTimeValues);

        timeValueKeys.forEach((key) => {
          summedTimeValues[key] += entry.timeValues[key];
          const sumKey = `${entry.planEmployeeId}:${key}`;

          if (
            !unsafeSums.has(sumKey) &&
            !Number.isSafeInteger(summedTimeValues[key])
          ) {
            unsafeSums.add(sumKey);
            context.addIssue({
              code: 'custom',
              path: [...entryPath, 'timeValues', key],
              message:
                'Die Summe der Zeitwerte ist zu groß, um zuverlässig berechnet zu werden.',
            });
          }
        });
      });
    });
  },
);

export type PlanEmployee = z.infer<typeof planEmployeeSchema>;
export type PlanEntry = z.infer<typeof planEntrySchema>;
export type PlanDay = z.infer<typeof planDaySchema>;
export type MonthlyPlan = z.infer<typeof monthlyPlanSchema>;
export type MonthlyPlanInput = z.infer<typeof monthlyPlanInputSchema>;
