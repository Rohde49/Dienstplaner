const MAX_SAFE_MINUTES = BigInt(Number.MAX_SAFE_INTEGER);
const DURATION_PATTERN = /^(\d+)[:.,](\d{2})$/;
const CLOCK_TIME_PATTERN = /^(\d{1,2})[:.,](\d{2})$/;

export type ParsedDuration = {
  minutes: number;
  normalized: string;
};

/** Liest eine Dauer mit Doppelpunkt, Punkt oder Komma als Trennzeichen. */
export function parseDurationInput(value: string): ParsedDuration | null {
  const match = DURATION_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const minutePart = Number(match[2]);

  if (minutePart > 59) {
    return null;
  }

  const hours = BigInt(match[1]);
  const minutes = hours * 60n + BigInt(minutePart);

  if (minutes > MAX_SAFE_MINUTES) {
    return null;
  }

  return {
    minutes: Number(minutes),
    normalized: `${hours.toString().padStart(2, '0')}:${match[2]}`,
  };
}

/** Formatiert gespeicherte Minuten als Dauer im Format HH:mm. */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const minutePart = minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutePart).padStart(2, '0')}`;
}

/** Normalisiert eine Uhrzeit und begrenzt sie auf einen Kalendertag. */
export function normalizeClockTime(value: string): string | null {
  const match = CLOCK_TIME_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, '0')}:${match[2]}`;
}
