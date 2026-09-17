import {
  monthlyPlanSchema,
  type Employee,
  type MonthlyPlan,
  type PlanDay,
  type PlanEmployee,
} from '../schemas';
import { countWorkingDays, createMonthCalendar } from './calendar';

export interface EmployeeMonthlyEvaluation {
  planEmployeeId: string;
  snfServiceCount: number;
  freeDayCount: number;
  freeSaturdayCount: number;
  freeSundayCount: number;
  onCallCount: number;
  workingMinutes: number;
  workingWithoutNightReadinessMinutes: number;
  nightReadinessMinutes: number;
  nightWorkMinutes: number;
  sundayOrHolidayWorkingWithoutNightReadinessMinutes: number;
  nightWorkBonusMinutes: number;
  nightReadinessBonusMinutes: number;
  targetWorkingMinutes: number;
  actualWorkingMinutes: number;
  workingDifferenceMinutes: number;
}

export interface MonthlyPlanEvaluation {
  workingDayCount: number;
  targetFreeDayCount: number;
  totalEducatorSnfServiceCount: number;
  employees: EmployeeMonthlyEvaluation[];
}

export type TargetCountStatus = 'below' | 'met' | 'above';

export const TARGET_FREE_WEEKEND_DAY_COUNT = 2;

type EvaluationInput = {
  year: number;
  month: number;
  employees: readonly Pick<
    PlanEmployee,
    'id' | 'role' | 'weeklyWorkingMinutes'
  >[];
  days: readonly Pick<PlanDay, 'date' | 'onCallEmployeeId' | 'entries'>[];
};

function addSafeMinutes(
  currentMinutes: number,
  additionalMinutes: number,
): number {
  const result = currentMinutes + additionalMinutes;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      'Die berechnete Minutensumme ist zu groß, um zuverlässig ausgewertet zu werden.',
    );
  }

  return result;
}

function calculateSafeDifference(
  actualWorkingMinutes: number,
  targetWorkingMinutes: number,
): number {
  const result = actualWorkingMinutes - targetWorkingMinutes;

  if (!Number.isSafeInteger(result)) {
    throw new RangeError(
      'Die Soll-/Ist-Differenz ist zu groß, um zuverlässig ausgewertet zu werden.',
    );
  }

  return result;
}

/** Berechnet den monatsweiten Zielwert freier Tage aus Kalender- und Arbeitstagen. */
export function calculateTargetFreeDayCount(
  calendarDayCount: number,
  workingDayCount: number,
): number {
  return calendarDayCount - workingDayCount;
}

/** Ordnet einen gezählten Ist-Wert relativ zu seinem Zielwert ein. */
export function getTargetCountStatus(
  actualCount: number,
  targetCount: number,
): TargetCountStatus {
  if (actualCount < targetCount) {
    return 'below';
  }

  return actualCount > targetCount ? 'above' : 'met';
}

/** Rundet einen ganzzahligen Anteil ohne Genauigkeitsverlust durch große Gleitkommazahlen. */
function calculateRoundedFraction(
  totalMinutes: number,
  divisor: number,
): number {
  const remainder = totalMinutes % divisor;
  const wholeMinutes = (totalMinutes - remainder) / divisor;

  return remainder * 2 >= divisor ? wholeMinutes + 1 : wholeMinutes;
}

function calculateEvaluation({
  year,
  month,
  employees: inputEmployees,
  days,
}: EvaluationInput): MonthlyPlanEvaluation {
  const calendarDays = createMonthCalendar(year, month);
  const calendarDaysByDate = new Map(
    calendarDays.map((calendarDay) => [calendarDay.date, calendarDay]),
  );
  const workingDayCount = countWorkingDays(year, month);
  const targetFreeDayCount = calculateTargetFreeDayCount(
    calendarDays.length,
    workingDayCount,
  );

  const employees = inputEmployees.map(
    (planEmployee): EmployeeMonthlyEvaluation => {
      let snfServiceCount = 0;
      let freeDayCount = 0;
      let freeSaturdayCount = 0;
      let freeSundayCount = 0;
      let onCallCount = 0;
      let workingMinutes = 0;
      let workingWithoutNightReadinessMinutes = 0;
      let nightReadinessMinutes = 0;
      let nightWorkMinutes = 0;
      let sundayOrHolidayWorkingWithoutNightReadinessMinutes = 0;

      days.forEach((day) => {
        if (day.onCallEmployeeId === planEmployee.id) {
          onCallCount += 1;
        }

        const entry = day.entries.find(
          (candidate) => candidate.planEmployeeId === planEmployee.id,
        );

        if (!entry) {
          return;
        }

        if (entry.code === 'SN/F' || entry.code === 'SN') {
          snfServiceCount += 1;
        }

        const calendarDay = calendarDaysByDate.get(day.date);

        if (!calendarDay) {
          throw new Error(
            'Ein Kalendertag des Monatsplans liegt außerhalb des Planmonats.',
          );
        }

        if (entry.isFreeDay) {
          freeDayCount += 1;

          if (calendarDay.isSaturday) {
            freeSaturdayCount += 1;
          }

          if (calendarDay.isSunday) {
            freeSundayCount += 1;
          }
        }

        workingMinutes = addSafeMinutes(
          workingMinutes,
          entry.timeValues.workingMinutes,
        );
        workingWithoutNightReadinessMinutes = addSafeMinutes(
          workingWithoutNightReadinessMinutes,
          entry.timeValues.workingWithoutNightReadinessMinutes,
        );
        nightReadinessMinutes = addSafeMinutes(
          nightReadinessMinutes,
          entry.timeValues.nightReadinessMinutes,
        );
        nightWorkMinutes = addSafeMinutes(
          nightWorkMinutes,
          entry.timeValues.nightWorkMinutes,
        );

        if (calendarDay.isSunday || calendarDay.isHoliday) {
          sundayOrHolidayWorkingWithoutNightReadinessMinutes = addSafeMinutes(
            sundayOrHolidayWorkingWithoutNightReadinessMinutes,
            entry.timeValues.workingWithoutNightReadinessMinutes,
          );
        }
      });

      const nightWorkBonusMinutes = calculateRoundedFraction(
        nightWorkMinutes,
        5,
      );
      const nightReadinessBonusMinutes = calculateRoundedFraction(
        nightReadinessMinutes,
        4,
      );
      const targetWorkingMinutes =
        (workingDayCount * planEmployee.weeklyWorkingMinutes) / 5;

      if (!Number.isSafeInteger(targetWorkingMinutes)) {
        throw new RangeError(
          'Die Soll-Arbeitszeit ist zu groß, um zuverlässig ausgewertet zu werden.',
        );
      }

      const actualWorkingMinutes = addSafeMinutes(
        workingWithoutNightReadinessMinutes,
        nightReadinessBonusMinutes,
      );
      const workingDifferenceMinutes = calculateSafeDifference(
        actualWorkingMinutes,
        targetWorkingMinutes,
      );

      return {
        planEmployeeId: planEmployee.id,
        snfServiceCount,
        freeDayCount,
        freeSaturdayCount,
        freeSundayCount,
        onCallCount,
        workingMinutes,
        workingWithoutNightReadinessMinutes,
        nightReadinessMinutes,
        nightWorkMinutes,
        sundayOrHolidayWorkingWithoutNightReadinessMinutes,
        nightWorkBonusMinutes,
        nightReadinessBonusMinutes,
        targetWorkingMinutes,
        actualWorkingMinutes,
        workingDifferenceMinutes,
      };
    },
  );
  const educatorIds = new Set(
    inputEmployees
      .filter((employee) => employee.role === 'Erzieher')
      .map((employee) => employee.id),
  );
  const totalEducatorSnfServiceCount = employees.reduce(
    (total, employee) =>
      educatorIds.has(employee.planEmployeeId)
        ? total + employee.snfServiceCount
        : total,
    0,
  );

  return {
    workingDayCount,
    targetFreeDayCount,
    totalEducatorSnfServiceCount,
    employees,
  };
}

/** Berechnet sämtliche festgelegten Monatskennzahlen aus den gespeicherten Snapshots. */
export function calculateMonthlyPlanEvaluation(
  plan: MonthlyPlan,
): MonthlyPlanEvaluation {
  return calculateEvaluation(monthlyPlanSchema.parse(plan));
}

/** Berechnet den leeren Vorschauzustand ohne künstliche Plan-Snapshots. */
export function calculateEmptyMonthlyPlanEvaluation(
  year: number,
  month: number,
  employees: readonly Pick<Employee, 'id' | 'role' | 'weeklyWorkingMinutes'>[],
): MonthlyPlanEvaluation {
  return calculateEvaluation({
    year,
    month,
    employees,
    days: createMonthCalendar(year, month).map(
      (day): EvaluationInput['days'][number] => ({
        date: day.date,
        onCallEmployeeId: null,
        entries: [],
      }),
    ),
  });
}
