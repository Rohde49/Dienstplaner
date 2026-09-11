const MAX_SAFE_MINUTES = BigInt(Number.MAX_SAFE_INTEGER);
const DURATION_PATTERN = /^(\d+):([0-5]\d)$/;
const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type ParsedDuration = {
  minutes: number;
  normalized: string;
};

function assertSafeInteger(minutes: number, allowNegative: boolean): void {
  if (!Number.isSafeInteger(minutes) || (!allowNegative && minutes < 0)) {
    throw new RangeError(
      allowNegative
        ? 'Der Minutenwert muss eine sichere ganze Zahl sein.'
        : 'Der Minutenwert muss eine nichtnegative sichere ganze Zahl sein.',
    );
  }
}

/** Liest eine nichtnegative Zeitdauer im verbindlichen Format H:MM. */
export function parseDuration(value: string): number | null {
  const match = DURATION_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const minutes = BigInt(match[1]) * 60n + BigInt(match[2]);

  return minutes <= MAX_SAFE_MINUTES ? Number(minutes) : null;
}

/** Liest und normalisiert eine Zeitdauer für Formulare. */
export function parseDurationInput(value: string): ParsedDuration | null {
  const minutes = parseDuration(value);

  return minutes === null
    ? null
    : {
        minutes,
        normalized: formatDuration(minutes),
      };
}

/** Formatiert eine nichtnegative, ganzzahlige Minutendauer als HH:MM. */
export function formatDuration(minutes: number): string {
  assertSafeInteger(minutes, false);

  const hours = Math.floor(minutes / 60);
  const minutePart = minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutePart).padStart(2, '0')}`;
}

/** Formatiert eine ganzzahlige Soll-/Ist-Differenz mit fachlichem Vorzeichen. */
export function formatTimeDifference(minutes: number): string {
  assertSafeInteger(minutes, true);

  if (minutes === 0) {
    return '00:00';
  }

  const sign = minutes > 0 ? '+' : '−';

  return `${sign}${formatDuration(Math.abs(minutes))}`;
}

/** Prüft und normalisiert eine Uhrzeit im verbindlichen Format HH:MM. */
export function normalizeClockTime(value: string): string | null {
  const normalized = value.trim();

  return CLOCK_TIME_PATTERN.test(normalized) ? normalized : null;
}

/** Rundet eine nichtnegative berechnete Dauer ab 0,5 aufwärts. */
export function roundNonNegativeMinutes(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new RangeError(
      'Die zu rundende Dauer muss nichtnegativ und endlich sein.',
    );
  }

  const roundedMinutes = Math.round(minutes);

  if (!Number.isSafeInteger(roundedMinutes)) {
    throw new RangeError(
      'Die gerundete Dauer muss eine sichere ganze Zahl ergeben.',
    );
  }

  return roundedMinutes;
}
