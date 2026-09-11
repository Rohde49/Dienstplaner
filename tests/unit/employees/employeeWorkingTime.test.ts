import { describe, expect, it } from 'vitest';

import {
  formatEmployeeWorkingDuration,
  formatWeeklyWorkingTime,
  parseEmployeeWorkingDuration,
} from '../../../src/renderer/features/team/employeeWorkingTime';

describe('Wochenarbeitszeit im Mitarbeiterformular', () => {
  it.each([
    ['0:00', 0],
    ['39:05', 2_345],
    ['168:00', 10_080],
  ])('wandelt %s ohne Rundung in Minuten um', (input, expectedMinutes) => {
    expect(parseEmployeeWorkingDuration(input)).toBe(expectedMinutes);
  });

  it.each(['39', '39:5', '39:60', '-1:00', '39,05'])('lehnt %s ab', (input) => {
    expect(parseEmployeeWorkingDuration(input)).toBeNull();
  });

  it('normalisiert die Eingabe 5:30 für das Formular', () => {
    expect(formatEmployeeWorkingDuration(330)).toBe('05:30');
  });
});

describe('Wochenarbeitszeit in der Teamübersicht', () => {
  it.each([
    [0, '00:00 Std./Woche'],
    [2_345, '39:05 Std./Woche'],
    [10_080, '168:00 Std./Woche'],
  ])('stellt %i Minuten als %s dar', (minutes, expected) => {
    expect(formatWeeklyWorkingTime(minutes)).toBe(expected);
  });
});
