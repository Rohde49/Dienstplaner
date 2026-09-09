import type { CalculationType, EntryCategory } from '../../../shared/schemas';

export const ENTRY_CATEGORY_LABELS: Record<EntryCategory, string> = {
  duty: 'Dienst',
  absence: 'Abwesenheit',
  free: 'Frei',
};

export const CALCULATION_TYPE_LABELS: Record<CalculationType, string> = {
  fixed: 'Feste Zeitwerte',
  weeklyWorkingTime: 'Wochenarbeitszeit',
};
