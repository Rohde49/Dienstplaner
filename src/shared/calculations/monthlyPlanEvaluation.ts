import { monthlyPlanSchema, type MonthlyPlan } from '../schemas';
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
  employees: EmployeeMonthlyEvaluation[];
}

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

/** Rundet einen ganzzahligen Anteil ohne Genauigkeitsverlust durch große Gleitkommazahlen. */
function calculateRoundedFraction(
  totalMinutes: number,
  divisor: number,
): number {
  const remainder = totalMinutes % divisor;
  const wholeMinutes = (totalMinutes - remainder) / divisor;

  return remainder * 2 >= divisor ? wholeMinutes + 1 : wholeMinutes;
}

/** Berechnet sämtliche festgelegten Monatskennzahlen aus den gespeicherten Snapshots. */
export function calculateMonthlyPlanEvaluation(
  plan: MonthlyPlan,
): MonthlyPlanEvaluation {
  // Die Prüfung verwendet bewusst nicht das normalisierte Parse-Ergebnis:
  // Kennzahlen wie SN/F und Frei vergleichen den gespeicherten Text exakt.
  monthlyPlanSchema.parse(plan);

  const calendarDays = createMonthCalendar(plan.year, plan.month);
  const calendarDaysByDate = new Map(
    calendarDays.map((calendarDay) => [calendarDay.date, calendarDay]),
  );
  const workingDayCount = countWorkingDays(plan.year, plan.month);

  const employees = plan.employees.map(
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

      plan.days.forEach((day) => {
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

        if (entry.code === '/') {
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

  return { workingDayCount, employees };
}
