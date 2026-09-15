import {
  MAX_CALENDAR_YEAR,
  MIN_CALENDAR_YEAR,
  countWorkingDays,
  createMonthCalendar,
  type CalendarDay,
} from '../../../shared/calculations';
import {
  monthlyPlanSchema,
  type Employee,
  type MonthlyPlan,
} from '../../../shared/schemas';

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
export function getPlannerYearOptions(
  referenceYear: number,
  selectedYear = referenceYear,
): number[] {
  const firstYear = Math.max(MIN_CALENDAR_YEAR, referenceYear - 2);
  const lastYear = Math.min(MAX_CALENDAR_YEAR, referenceYear + 2);
  const years = new Set(
    Array.from(
      { length: lastYear - firstYear + 1 },
      (_, index) => firstYear + index,
    ),
  );

  for (let year = selectedYear - 1; year <= selectedYear + 1; year += 1) {
    if (year >= MIN_CALENDAR_YEAR && year <= MAX_CALENDAR_YEAR) {
      years.add(year);
    }
  }

  return [...years].sort((first, second) => first - second);
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
    document:
      state.document.kind === 'plan'
        ? state.document
        : createPreviewDocument(state.period, team),
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

/** Übernimmt ausschließlich einen vollständig validierten gespeicherten Plan. */
export function openPlannerPlan(
  state: PlannerPageState,
  plan: MonthlyPlan,
  recoveredFromBackup: boolean,
): PlannerPageState {
  const baseline = monthlyPlanSchema.parse(plan);

  return {
    ...state,
    period: { year: baseline.year, month: baseline.month },
    document: {
      kind: 'plan',
      preview: null,
      baseline,
      draft: structuredClone(baseline),
      recoveredFromBackup,
    },
  };
}

/** Übernimmt einen validierten Plan ausschließlich als aktuellen Entwurf. */
export function replacePlannerDraft(
  state: PlannerPageState,
  draft: MonthlyPlan,
): PlannerPageState {
  if (state.document.kind !== 'plan') {
    throw new Error('Eine Vorschau kann nicht bearbeitet werden.');
  }

  const validatedDraft = monthlyPlanSchema.parse(draft);

  if (validatedDraft.id !== state.document.baseline.id) {
    throw new Error('Der Entwurf gehört nicht zum geöffneten Monatsplan.');
  }

  return {
    ...state,
    document: {
      ...state.document,
      draft: validatedDraft,
    },
  };
}

/** Kehrt nach dem Löschen des geöffneten Plans zur Vorschau desselben Zeitraums zurück. */
export function returnToPlannerPreview(
  state: PlannerPageState,
): PlannerPageState {
  return {
    ...state,
    document: createPreviewDocument(state.period, state.team),
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
