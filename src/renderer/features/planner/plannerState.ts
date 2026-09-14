import {
  MAX_CALENDAR_YEAR,
  MIN_CALENDAR_YEAR,
  countWorkingDays,
  createMonthCalendar,
  type CalendarDay,
} from '../../../shared/calculations';
import type { Employee, MonthlyPlan } from '../../../shared/schemas';

export const PLANNER_MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

export type PlannerPeriod = {
  year: number;
  month: number;
};

export type PlannerPreview = {
  period: PlannerPeriod;
  employees: readonly Employee[];
  calendarDays: readonly CalendarDay[];
  workingDayCount: number;
  canCreatePlan: boolean;
};

/** Trennt die unverbindliche Vorschau von einem später geladenen Planentwurf. */
export type PlannerDocumentState =
  | {
      kind: 'preview';
      preview: PlannerPreview;
      baseline: null;
      draft: null;
      recoveredFromBackup: false;
    }
  | {
      kind: 'plan';
      preview: null;
      baseline: MonthlyPlan;
      draft: MonthlyPlan;
      recoveredFromBackup: boolean;
    };

export type PlannerLoadState =
  | { status: 'loading'; errorMessage: null }
  | { status: 'ready'; errorMessage: null }
  | { status: 'error'; errorMessage: string };

export type PlannerPageState = {
  period: PlannerPeriod;
  team: readonly Employee[];
  document: PlannerDocumentState;
  load: PlannerLoadState;
};

function assertValidPeriod(period: PlannerPeriod): void {
  createMonthCalendar(period.year, period.month);
}

/** Liefert die dokumentierte Jahresauswahl rund um das aktuelle Jahr. */
export function getPlannerYearOptions(referenceYear: number): number[] {
  const firstYear = Math.max(MIN_CALENDAR_YEAR, referenceYear - 2);
  const lastYear = Math.min(MAX_CALENDAR_YEAR, referenceYear + 2);

  return Array.from(
    { length: lastYear - firstYear + 1 },
    (_, index) => firstYear + index,
  );
}

/** Erzeugt die Vorschau ausschließlich aus aktuellem Team und Kalenderlogik. */
export function createPlannerPreview(
  period: PlannerPeriod,
  team: readonly Employee[],
): PlannerPreview {
  assertValidPeriod(period);
  const employees = team.filter((employee) => employee.active);

  return {
    period,
    employees,
    calendarDays: createMonthCalendar(period.year, period.month),
    workingDayCount: countWorkingDays(period.year, period.month),
    canCreatePlan: employees.length > 0,
  };
}

function createPreviewDocument(
  period: PlannerPeriod,
  team: readonly Employee[],
): PlannerDocumentState {
  return {
    kind: 'preview',
    preview: createPlannerPreview(period, team),
    baseline: null,
    draft: null,
    recoveredFromBackup: false,
  };
}

/** Erstellt den initialen Ladezustand für den lokalen aktuellen Monat. */
export function createInitialPlannerPageState(now: Date): PlannerPageState {
  const period = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };

  assertValidPeriod(period);

  return {
    period,
    team: [],
    document: createPreviewDocument(period, []),
    load: { status: 'loading', errorMessage: null },
  };
}

/** Übernimmt das geladene Team und bildet daraus die aktuelle Vorschau. */
export function completePlannerTeamLoad(
  state: PlannerPageState,
  team: readonly Employee[],
): PlannerPageState {
  return {
    ...state,
    team,
    document: createPreviewDocument(state.period, team),
    load: { status: 'ready', errorMessage: null },
  };
}

/** Hält einen Ladefehler dauerhaft im Seitenzustand fest. */
export function failPlannerTeamLoad(
  state: PlannerPageState,
  errorMessage: string,
): PlannerPageState {
  return {
    ...state,
    load: { status: 'error', errorMessage },
  };
}

/** Setzt einen erneuten Ladevorgang in Gang, ohne die letzte Ansicht zu löschen. */
export function beginPlannerTeamLoad(
  state: PlannerPageState,
): PlannerPageState {
  return {
    ...state,
    load: { status: 'loading', errorMessage: null },
  };
}

/** Ein Zeitraumwechsel führt stets zurück in eine frische, ungespeicherte Vorschau. */
export function selectPlannerPeriod(
  state: PlannerPageState,
  period: PlannerPeriod,
): PlannerPageState {
  assertValidPeriod(period);

  return {
    ...state,
    period,
    document: createPreviewDocument(period, state.team),
  };
}

/** Berechnet den benachbarten Monat innerhalb der angebotenen Jahresauswahl. */
export function getAdjacentPlannerPeriod(
  period: PlannerPeriod,
  monthOffset: -1 | 1,
  selectableYears: readonly number[],
): PlannerPeriod | null {
  assertValidPeriod(period);

  const monthIndex = period.year * 12 + period.month - 1 + monthOffset;
  const adjacentPeriod = {
    year: Math.floor(monthIndex / 12),
    month: (monthIndex % 12) + 1,
  };

  return selectableYears.includes(adjacentPeriod.year) ? adjacentPeriod : null;
}
