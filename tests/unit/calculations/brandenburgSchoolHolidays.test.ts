import { describe, expect, it } from 'vitest';

import {
  countWorkingDays,
  createMonthCalendar,
  formatSchoolHolidayBoundaryLabel,
  getBrandenburgSchoolHolidays,
  getSchoolHolidayCoverageStatus,
} from '../../../src/shared/calculations';

describe('Brandenburger Schulferien', () => {
  it('kennzeichnet Beginn, Verlauf und Ende eines Ferienzeitraums', () => {
    const firstDay = getBrandenburgSchoolHolidays('2026-07-09');
    const middleDay = getBrandenburgSchoolHolidays('2026-07-19');
    const lastDay = getBrandenburgSchoolHolidays('2026-08-22');

    expect(firstDay).toEqual([
      { name: 'Sommerferien', isFirstDay: true, isLastDay: false },
    ]);
    expect(middleDay).toEqual([
      { name: 'Sommerferien', isFirstDay: false, isLastDay: false },
    ]);
    expect(lastDay).toEqual([
      { name: 'Sommerferien', isFirstDay: false, isLastDay: true },
    ]);
    expect(formatSchoolHolidayBoundaryLabel(firstDay)).toBe(
      'Beginn Sommerferien',
    );
    expect(formatSchoolHolidayBoundaryLabel(middleDay)).toBeNull();
    expect(formatSchoolHolidayBoundaryLabel(lastDay)).toBe('Ende Sommerferien');
  });

  it('führt Weihnachtsferien korrekt über den Jahreswechsel', () => {
    expect(getBrandenburgSchoolHolidays('2026-12-23')).toEqual([
      { name: 'Weihnachtsferien', isFirstDay: true, isLastDay: false },
    ]);
    expect(getBrandenburgSchoolHolidays('2027-01-02')).toEqual([
      { name: 'Weihnachtsferien', isFirstDay: false, isLastDay: true },
    ]);
    expect(getBrandenburgSchoolHolidays('2027-01-03')).toEqual([]);
  });

  it('stellt eintägige Ferien nur einmal dar', () => {
    const schoolHolidays = getBrandenburgSchoolHolidays('2026-05-26');

    expect(schoolHolidays).toEqual([
      { name: 'Pfingstferien', isFirstDay: true, isLastDay: true },
    ]);
    expect(formatSchoolHolidayBoundaryLabel(schoolHolidays)).toBe(
      'Pfingstferien',
    );
  });

  it('schließt schulabhängige variable Ferientage aus', () => {
    expect(getBrandenburgSchoolHolidays('2026-05-15')).toEqual([]);
    expect(getBrandenburgSchoolHolidays('2027-05-07')).toEqual([]);
  });

  it('ordnet Monate dem veröffentlichten Datenzeitraum zu', () => {
    expect(getSchoolHolidayCoverageStatus(2022, 8)).toBe('unavailable');
    expect(getSchoolHolidayCoverageStatus(2022, 9)).toBe('covered');
    expect(getSchoolHolidayCoverageStatus(2026, 9)).toBe('covered');
    expect(getSchoolHolidayCoverageStatus(2029, 9)).toBe('expiring');
    expect(getSchoolHolidayCoverageStatus(2030, 8)).toBe('partial');
    expect(getSchoolHolidayCoverageStatus(2030, 9)).toBe('unavailable');
  });

  it('verändert weder gesetzliche Feiertage noch kalendarische Arbeitstage', () => {
    const february = createMonthCalendar(2026, 2);
    const firstSchoolHoliday = february.find(
      (day) => day.date === '2026-02-02',
    );

    expect(firstSchoolHoliday).toMatchObject({
      isSchoolHoliday: true,
      isHoliday: false,
      isWorkingDay: true,
    });
    expect(countWorkingDays(2026, 2)).toBe(20);
  });
});
