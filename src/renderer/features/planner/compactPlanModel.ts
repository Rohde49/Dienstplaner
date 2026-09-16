import {
  calculateMonthlyPlanEvaluation,
  createMonthCalendar,
  formatDuration,
} from '../../../shared/calculations';
import {
  monthlyPlanSchema,
  type EmployeeColorKey,
  type MonthlyPlan,
} from '../../../shared/schemas';
import { PLANNER_MONTHS } from './plannerState';

const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

export type CompactPlanEmployee = {
  id: string;
  displayName: string;
  fullName: string;
  colorKey: EmployeeColorKey;
  actualWorkingTime: string;
  targetWorkingTime: string;
  weeklyWorkingTime: string;
};

export type CompactPlanEntry = {
  code: string;
  timeRange: string | null;
};

export type CompactPlanDay = {
  date: string;
  dateLabel: string;
  fullDateLabel: string;
  isWeekend: boolean;
  isHoliday: boolean;
  entries: Readonly<Record<string, CompactPlanEntry | null>>;
  onCallEmployeeName: string | null;
  note: string | null;
};

export type CompactPlanHoliday = {
  date: string;
  label: string;
};

export type CompactPlanModel = {
  title: string;
  periodLabel: string;
  savedDateLabel: string;
  employees: readonly CompactPlanEmployee[];
  days: readonly CompactPlanDay[];
  holidays: readonly CompactPlanHoliday[];
};

function formatCalendarDate(date: string): string {
  return `${date.slice(8, 10)}.${date.slice(5, 7)}.`;
}

function formatSavedDate(timestamp: string): string {
  const date = timestamp.slice(0, 10);

  return `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}`;
}

/** Formatiert gespeicherte Uhrzeiten platzsparend, ohne Minuteninformation zu verlieren. */
export function formatCompactClockTime(clockTime: string): string {
  const [hour, minute] = clockTime.split(':');

  return minute === '00' ? String(Number(hour)) : `${Number(hour)}:${minute}`;
}

function createEmployeeDisplayNames(
  employees: MonthlyPlan['employees'],
): Map<string, string> {
  const lastNameCounts = new Map<string, number>();

  employees.forEach((employee) => {
    const key = employee.lastName.toLocaleLowerCase('de-DE');
    lastNameCounts.set(key, (lastNameCounts.get(key) ?? 0) + 1);
  });

  return new Map(
    employees.map((employee) => {
      const key = employee.lastName.toLocaleLowerCase('de-DE');
      const displayName =
        (lastNameCounts.get(key) ?? 0) > 1
          ? `${employee.firstName.charAt(0)}. ${employee.lastName}`
          : employee.lastName;

      return [employee.id, displayName];
    }),
  );
}

/** Bereitet das gemeinsame A4-Dokument ausschließlich aus einem gespeicherten Plan auf. */
export function createCompactPlanModel(
  planValue: MonthlyPlan,
): CompactPlanModel {
  const plan = monthlyPlanSchema.parse(planValue);
  const employees = [...plan.employees].sort(
    (first, second) => first.position - second.position,
  );
  const employeeNames = createEmployeeDisplayNames(employees);
  const evaluation = calculateMonthlyPlanEvaluation(plan);
  const evaluationsByEmployeeId = new Map(
    evaluation.employees.map((employee) => [employee.planEmployeeId, employee]),
  );
  const planDaysByDate = new Map(plan.days.map((day) => [day.date, day]));
  const calendarDays = createMonthCalendar(plan.year, plan.month);

  return {
    title: plan.title,
    periodLabel: `${PLANNER_MONTHS[plan.month - 1]} ${plan.year}`,
    savedDateLabel: formatSavedDate(plan.updatedAt),
    employees: employees.map((employee) => {
      const employeeEvaluation = evaluationsByEmployeeId.get(employee.id);

      if (!employeeEvaluation) {
        throw new Error(
          'Für einen Planmitarbeiter fehlt die Monatsauswertung.',
        );
      }

      return {
        id: employee.id,
        displayName: employeeNames.get(employee.id)!,
        fullName: `${employee.firstName} ${employee.lastName}`,
        colorKey: employee.colorKey,
        actualWorkingTime: formatDuration(
          employeeEvaluation.actualWorkingMinutes,
        ),
        targetWorkingTime: formatDuration(
          employeeEvaluation.targetWorkingMinutes,
        ),
        weeklyWorkingTime: formatDuration(employee.weeklyWorkingMinutes),
      };
    }),
    days: calendarDays.map((calendarDay) => {
      const planDay = planDaysByDate.get(calendarDay.date);
      const entriesByEmployeeId = new Map(
        planDay?.entries.map((entry) => [entry.planEmployeeId, entry]) ?? [],
      );
      const weekdayName = WEEKDAY_NAMES[calendarDay.weekday - 1];
      const formattedDate = formatCalendarDate(calendarDay.date);

      return {
        date: calendarDay.date,
        dateLabel: `${weekdayName} ${formattedDate}${calendarDay.isHoliday ? '*' : ''}`,
        fullDateLabel: `${weekdayName} ${formattedDate}`,
        isWeekend: calendarDay.isWeekend,
        isHoliday: calendarDay.isHoliday,
        entries: Object.fromEntries(
          employees.map((employee) => {
            const entry = entriesByEmployeeId.get(employee.id);

            return [
              employee.id,
              entry
                ? {
                    code: entry.code,
                    timeRange:
                      entry.startTime && entry.endTime
                        ? `${formatCompactClockTime(entry.startTime)}–${formatCompactClockTime(entry.endTime)}`
                        : null,
                  }
                : null,
            ];
          }),
        ),
        onCallEmployeeName: planDay?.onCallEmployeeId
          ? (employeeNames.get(planDay.onCallEmployeeId) ?? null)
          : null,
        note: planDay?.note ?? null,
      };
    }),
    holidays: calendarDays.flatMap((calendarDay) =>
      calendarDay.holidayNames.length === 0
        ? []
        : [
            {
              date: calendarDay.date,
              label: `* ${formatCalendarDate(calendarDay.date)} – ${calendarDay.holidayNames.join(', ')}`,
            },
          ],
    ),
  };
}
