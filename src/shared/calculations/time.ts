const MAX_SAFE_MINUTES = BigInt(Number.MAX_SAFE_INTEGER);
const SEPARATED_TIME_PATTERN = /^(\d+)[.:,](\d{2})$/;
const DIGITS_PATTERN = /^\d+$/;

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

function parseTimeParts(
  value: string,
): { hours: string; minutes: string } | null {
  const normalized = value.trim();
  const separatedMatch = SEPARATED_TIME_PATTERN.exec(normalized);

  if (separatedMatch) {
    return {
      hours: separatedMatch[1],
      minutes: separatedMatch[2],
    };
  }

  if (!DIGITS_PATTERN.test(normalized)) {
    return null;
  }

  if (normalized.length <= 2) {
    return { hours: normalized, minutes: '00' };
  }

  return {
    hours: normalized.slice(0, -2),
    minutes: normalized.slice(-2),
  };
}

/** Liest eine nichtnegative Zeitdauer in der flexiblen Formulareingabe. */
export function parseDuration(value: string): number | null {
  const parts = parseTimeParts(value);

  if (!parts || Number(parts.minutes) > 59) {
    return null;
  }

  const minutes = BigInt(parts.hours) * 60n + BigInt(parts.minutes);

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

/** Prüft und normalisiert eine flexible Uhrzeiteingabe. */
export function normalizeClockTime(value: string): string | null {
  const normalized = value.trim();
  const separatedMatch = SEPARATED_TIME_PATTERN.exec(normalized);
  let hoursText: string;
  let minutesText: string;

  if (separatedMatch) {
    hoursText = separatedMatch[1];
    minutesText = separatedMatch[2];
  } else if (DIGITS_PATTERN.test(normalized)) {
    if (normalized.length <= 2) {
      const hours = Number(normalized);

      if (hours > 23) {
        return null;
      }

      hoursText = normalized;
      minutesText = '00';
    } else if (normalized.length <= 4) {
      hoursText = normalized.slice(0, -2);
      minutesText = normalized.slice(-2);
    } else {
      return null;
    }
  } else {
    return null;
  }

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return hours <= 23 && minutes <= 59
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    : null;
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
