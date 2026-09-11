import { formatDuration } from '../../../shared/calculations';

/** Ergänzt die exakte Dauer um die Bezeichnung der Teamübersicht. */
export function formatWeeklyWorkingTime(minutes: number): string {
  return `${formatDuration(minutes)} Std./Woche`;
}
