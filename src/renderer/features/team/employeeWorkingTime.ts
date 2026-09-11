const MAX_SAFE_MINUTES = BigInt(Number.MAX_SAFE_INTEGER);
const DURATION_PATTERN = /^(\d+):([0-5]\d)$/;

/** Formatiert eine intern gespeicherte Wochenarbeitszeit als HH:MM. */
export function formatEmployeeWorkingDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
}

/** Wandelt eine Zeitdauer im Format H:MM ohne Rundung in Minuten um. */
export function parseEmployeeWorkingDuration(value: string): number | null {
  const match = DURATION_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const minutes = BigInt(match[1]) * 60n + BigInt(match[2]);

  return minutes <= MAX_SAFE_MINUTES ? Number(minutes) : null;
}

/** Ergänzt die exakte Dauer um die Bezeichnung der Teamübersicht. */
export function formatWeeklyWorkingTime(minutes: number): string {
  return `${formatEmployeeWorkingDuration(minutes)} Std./Woche`;
}
