import {
  getBrandenburgSchoolHolidays,
  type BrandenburgSchoolHolidayDay,
} from './brandenburgSchoolHolidays';

export const MIN_CALENDAR_YEAR = 2000;
export const MAX_CALENDAR_YEAR = 2100;

export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CalendarDay {
  date: string;
  weekday: IsoWeekday;
  isSaturday: boolean;
  isSunday: boolean;
  isWeekend: boolean;
  holidayNames: string[];
  isHoliday: boolean;
  schoolHolidays: BrandenburgSchoolHolidayDay[];
  isSchoolHoliday: boolean;
  isWorkingDay: boolean;
}

interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

interface Holiday {
  name: string;
  date: string;
}

/** Prüft den fachlich unterstützten Kalenderbereich. */
function assertValidYear(year: number): void {
  if (
    !Number.isInteger(year) ||
    year < MIN_CALENDAR_YEAR ||
    year > MAX_CALENDAR_YEAR
  ) {
    throw new RangeError(
      `Das Jahr muss eine ganze Zahl zwischen ${MIN_CALENDAR_YEAR} und ${MAX_CALENDAR_YEAR} sein.`,
    );
  }
}

function assertValidMonth(month: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(
      'Der Monat muss eine ganze Zahl zwischen 1 und 12 sein.',
    );
  }
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function formatDate({ year, month, day }: CalendarDate): string {
  return `${year.toString().padStart(4, '0')}-${month
    .toString()
    .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function parseDate(date: string): CalendarDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    throw new RangeError('Das Datum muss dem Format YYYY-MM-DD entsprechen.');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  assertValidYear(year);
  assertValidMonth(month);

  if (day < 1 || day > getDaysInMonth(year, month)) {
    throw new RangeError('Das Datum muss ein gültiges Kalenderdatum sein.');
  }

  return { year, month, day };
}

/** Addiert Kalendertage ausschließlich mit UTC-Werten und damit ohne Sommerzeiteffekt. */
function addDays(date: CalendarDate, days: number): CalendarDate {
  const result = new Date(Date.UTC(date.year, date.month - 1, date.day + days));

  return {
    year: result.getUTCFullYear(),
    month: result.getUTCMonth() + 1,
    day: result.getUTCDate(),
  };
}

/** Liefert den ISO-Wochentag von Montag (1) bis Sonntag (7). */
function getIsoWeekday(date: CalendarDate): IsoWeekday {
  const utcWeekday = new Date(
    Date.UTC(date.year, date.month - 1, date.day),
  ).getUTCDay();

  return (utcWeekday === 0 ? 7 : utcWeekday) as IsoWeekday;
}

/** Berechnet den gregorianischen Ostersonntag nach der Meeus/Jones/Butcher-Methode. */
export function getEasterSunday(year: number): string {
  assertValidYear(year);

  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return formatDate({ year, month, day });
}

/** Liefert alle regelmäßigen gesetzlichen Feiertage Brandenburgs. */
function getBrandenburgHolidays(year: number): Holiday[] {
  const easterSunday = parseDate(getEasterSunday(year));

  return [
    { name: 'Neujahr', date: formatDate({ year, month: 1, day: 1 }) },
    { name: 'Karfreitag', date: formatDate(addDays(easterSunday, -2)) },
    { name: 'Ostersonntag', date: formatDate(easterSunday) },
    { name: 'Ostermontag', date: formatDate(addDays(easterSunday, 1)) },
    { name: 'Tag der Arbeit', date: formatDate({ year, month: 5, day: 1 }) },
    {
      name: 'Christi Himmelfahrt',
      date: formatDate(addDays(easterSunday, 39)),
    },
    {
      name: 'Pfingstsonntag',
      date: formatDate(addDays(easterSunday, 49)),
    },
    {
      name: 'Pfingstmontag',
      date: formatDate(addDays(easterSunday, 50)),
    },
    {
      name: 'Tag der Deutschen Einheit',
      date: formatDate({ year, month: 10, day: 3 }),
    },
    {
      name: 'Reformationstag',
      date: formatDate({ year, month: 10, day: 31 }),
    },
    {
      name: '1. Weihnachtsfeiertag',
      date: formatDate({ year, month: 12, day: 25 }),
    },
    {
      name: '2. Weihnachtsfeiertag',
      date: formatDate({ year, month: 12, day: 26 }),
    },
  ];
}

/** Gibt alle Feiertagsbezeichnungen eines Datums ohne gegenseitiges Überschreiben zurück. */
export function getBrandenburgHolidayNames(date: string): string[] {
  const { year } = parseDate(date);

  return getBrandenburgHolidays(year)
    .filter((holiday) => holiday.date === date)
    .map((holiday) => holiday.name);
}

/** Erzeugt alle chronologisch geordneten Kalendertage eines Monats. */
export function createMonthCalendar(
  year: number,
  month: number,
): CalendarDay[] {
  assertValidYear(year);
  assertValidMonth(month);

  return Array.from({ length: getDaysInMonth(year, month) }, (_, index) => {
    const calendarDate = { year, month, day: index + 1 };
    const date = formatDate(calendarDate);
    const weekday = getIsoWeekday(calendarDate);
    const isSaturday = weekday === 6;
    const isSunday = weekday === 7;
    const isWeekend = isSaturday || isSunday;
    const holidayNames = getBrandenburgHolidayNames(date);
    const isHoliday = holidayNames.length > 0;
    const schoolHolidays = getBrandenburgSchoolHolidays(date);

    return {
      date,
      weekday,
      isSaturday,
      isSunday,
      isWeekend,
      holidayNames,
      isHoliday,
      schoolHolidays,
      isSchoolHoliday: schoolHolidays.length > 0,
      isWorkingDay: !isWeekend && !isHoliday,
    };
  });
}

/** Zählt Montag bis Freitag, sofern der Tag kein Feiertag in Brandenburg ist. */
export function countWorkingDays(year: number, month: number): number {
  return createMonthCalendar(year, month).filter((day) => day.isWorkingDay)
    .length;
}
