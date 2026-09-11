import { describe, expect, it } from 'vitest';

import {
  countWorkingDays,
  createMonthCalendar,
  getBrandenburgHolidayNames,
  getEasterSunday,
} from '../../../src/shared/calculations/calendar';

describe('Monatskalender', () => {
  it('erzeugt einen vollständigen Monat chronologisch im ISO-Datumsformat', () => {
    const january = createMonthCalendar(2026, 1);

    expect(january).toHaveLength(31);
    expect(january.map((day) => day.date)).toEqual(
      Array.from(
        { length: 31 },
        (_, index) => `2026-01-${(index + 1).toString().padStart(2, '0')}`,
      ),
    );
  });

  it.each([
    [2000, 29],
    [2024, 29],
    [2100, 28],
  ])('berücksichtigt die Schaltjahrregel für Februar %i', (year, dayCount) => {
    expect(createMonthCalendar(year, 2)).toHaveLength(dayCount);
  });

  it('kennzeichnet Wochentag, Samstag, Sonntag und Wochenende eindeutig', () => {
    const days = createMonthCalendar(2026, 9);

    expect(days.find((day) => day.date === '2026-09-11')).toMatchObject({
      weekday: 5,
      isSaturday: false,
      isSunday: false,
      isWeekend: false,
    });
    expect(days.find((day) => day.date === '2026-09-12')).toMatchObject({
      weekday: 6,
      isSaturday: true,
      isSunday: false,
      isWeekend: true,
    });
    expect(days.find((day) => day.date === '2026-09-13')).toMatchObject({
      weekday: 7,
      isSaturday: false,
      isSunday: true,
      isWeekend: true,
    });
  });

  it('funktioniert an den Grenzen des unterstützten Jahresbereichs', () => {
    expect(createMonthCalendar(2000, 1)[0].date).toBe('2000-01-01');
    expect(createMonthCalendar(2100, 12).at(-1)?.date).toBe('2100-12-31');
  });
});

describe('Brandenburger Feiertage', () => {
  it.each([
    [2000, '2000-04-23'],
    [2024, '2024-03-31'],
    [2026, '2026-04-05'],
    [2100, '2100-03-28'],
  ])('berechnet Ostersonntag %i gregorianisch', (year, expectedDate) => {
    expect(getEasterSunday(year)).toBe(expectedDate);
  });

  it('liefert Ostersonntag für jedes unterstützte Jahr als Sonntag und Feiertag', () => {
    for (let year = 2000; year <= 2100; year += 1) {
      const easterSunday = getEasterSunday(year);
      const month = Number(easterSunday.slice(5, 7));
      const day = createMonthCalendar(year, month).find(
        (calendarDay) => calendarDay.date === easterSunday,
      );

      expect(day?.weekday).toBe(7);
      expect(day?.holidayNames).toContain('Ostersonntag');
    }
  });

  it('berechnet die beweglichen Feiertage aus Ostersonntag', () => {
    expect(getBrandenburgHolidayNames('2026-04-03')).toEqual(['Karfreitag']);
    expect(getBrandenburgHolidayNames('2026-04-05')).toEqual(['Ostersonntag']);
    expect(getBrandenburgHolidayNames('2026-04-06')).toEqual(['Ostermontag']);
    expect(getBrandenburgHolidayNames('2026-05-14')).toEqual([
      'Christi Himmelfahrt',
    ]);
    expect(getBrandenburgHolidayNames('2026-05-24')).toEqual([
      'Pfingstsonntag',
    ]);
    expect(getBrandenburgHolidayNames('2026-05-25')).toEqual(['Pfingstmontag']);
  });

  it('liefert die fest datierten Feiertage und keine sonstigen Tage', () => {
    expect(getBrandenburgHolidayNames('2026-01-01')).toEqual(['Neujahr']);
    expect(getBrandenburgHolidayNames('2026-10-03')).toEqual([
      'Tag der Deutschen Einheit',
    ]);
    expect(getBrandenburgHolidayNames('2026-10-31')).toEqual([
      'Reformationstag',
    ]);
    expect(getBrandenburgHolidayNames('2026-12-25')).toEqual([
      '1. Weihnachtsfeiertag',
    ]);
    expect(getBrandenburgHolidayNames('2026-12-26')).toEqual([
      '2. Weihnachtsfeiertag',
    ]);
    expect(getBrandenburgHolidayNames('2026-11-18')).toEqual([]);
  });

  it('bewahrt mehrere Feiertagsnamen am selben Datum', () => {
    expect(getBrandenburgHolidayNames('2008-05-01')).toEqual([
      'Tag der Arbeit',
      'Christi Himmelfahrt',
    ]);
  });
});

describe('kalendarische Arbeitstage', () => {
  it('schließt einen Feiertag an einem Wochentag aus', () => {
    const may2026 = createMonthCalendar(2026, 5);
    const labourDay = may2026.find((day) => day.date === '2026-05-01');

    expect(labourDay).toMatchObject({
      weekday: 5,
      isWeekend: false,
      isHoliday: true,
      isWorkingDay: false,
    });
    expect(countWorkingDays(2026, 5)).toBe(18);
  });

  it('zieht einen Feiertag am Wochenende nicht zusätzlich ab', () => {
    const october2026 = createMonthCalendar(2026, 10);
    const unityDay = october2026.find((day) => day.date === '2026-10-03');

    expect(unityDay).toMatchObject({
      isSaturday: true,
      isWeekend: true,
      isHoliday: true,
      isWorkingDay: false,
    });
    expect(countWorkingDays(2026, 10)).toBe(22);
  });

  it('schließt ein Datum mit mehreren Feiertagsnamen höchstens einmal aus', () => {
    const may2008 = createMonthCalendar(2008, 5);
    const firstOfMay = may2008.find((day) => day.date === '2008-05-01');

    expect(firstOfMay?.holidayNames).toHaveLength(2);
    expect(firstOfMay?.isWorkingDay).toBe(false);
    expect(countWorkingDays(2008, 5)).toBe(20);
  });
});

describe('ungültige Kalenderwerte', () => {
  it.each([1999, 2101, 2026.5, Number.NaN])('lehnt das Jahr %s ab', (year) => {
    expect(() => createMonthCalendar(year, 1)).toThrow(RangeError);
    expect(() => getEasterSunday(year)).toThrow(RangeError);
  });

  it.each([0, 13, 1.5, Number.NaN])('lehnt den Monat %s ab', (month) => {
    expect(() => createMonthCalendar(2026, month)).toThrow(RangeError);
  });

  it.each([
    '2026-2-01',
    '2026-02-30',
    '2023-02-29',
    '1999-12-31',
    '2101-01-01',
  ])('lehnt das Datum %s ab', (date) => {
    expect(() => getBrandenburgHolidayNames(date)).toThrow(RangeError);
  });
});
