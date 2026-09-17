import { describe, expect, it } from 'vitest';

import {
  formatDuration,
  formatTimeDifference,
  normalizeClockTime,
  parseDuration,
  parseDurationInput,
  roundNonNegativeMinutes,
} from '../../../src/shared/calculations';

describe('Zeitdauern', () => {
  it.each([
    ['0:00', 0],
    ['8', 480],
    ['530', 330],
    ['030', 30],
    ['5:30', 330],
    ['5.30', 330],
    ['5,30', 330],
    ['12015', 7_215],
    ['39:00', 2_340],
    ['120:15', 7_215],
    ['150119987579016:31', Number.MAX_SAFE_INTEGER],
  ])('liest %s als %i Minuten', (input, expectedMinutes) => {
    expect(parseDuration(input)).toBe(expectedMinutes);
  });

  it.each([
    '',
    '5:3',
    '05:60',
    '-1:00',
    '+1:00',
    '1:00:00',
    '150119987579016:32',
  ])('lehnt die ungültige Dauer %j ab', (input) => {
    expect(parseDuration(input)).toBeNull();
  });

  it('normalisiert die Eingabe für ein Formular', () => {
    expect(parseDurationInput(' 5:30 ')).toEqual({
      minutes: 330,
      normalized: '05:30',
    });
  });

  it.each([
    [0, '00:00'],
    [330, '05:30'],
    [5_955, '99:15'],
    [7_215, '120:15'],
    [Number.MAX_SAFE_INTEGER, '150119987579016:31'],
  ])('formatiert %i Minuten als %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'lehnt den nicht speicherbaren Minutenwert %s ab',
    (minutes) => {
      expect(() => formatDuration(minutes)).toThrow(RangeError);
    },
  );
});

describe('Uhrzeiten', () => {
  it.each([
    ['00:00', '00:00'],
    ['08:05', '08:05'],
    ['23:59', '23:59'],
    ['8', '08:00'],
    ['20', '20:00'],
    ['530', '05:30'],
    ['1430', '14:30'],
    ['030', '00:30'],
    ['5:30', '05:30'],
    ['5.30', '05:30'],
    ['5,30', '05:30'],
  ])('normalisiert %s als %s', (clockTime, expected) => {
    expect(normalizeClockTime(clockTime)).toBe(expected);
  });

  it('entfernt äußere Leerzeichen', () => {
    expect(normalizeClockTime(' 08:05 ')).toBe('08:05');
  });

  it.each(['', '30', '5:3', '24:00', '12:60', '-1:00', '2400', '12345'])(
    'lehnt die ungültige Uhrzeit %j ab',
    (clockTime) => {
      expect(normalizeClockTime(clockTime)).toBeNull();
    },
  );
});

describe('Darstellung von Soll-/Ist-Differenzen', () => {
  it.each([
    [90, '+01:30'],
    [-90, '−01:30'],
    [0, '00:00'],
    [6_015, '+100:15'],
  ])('formatiert %i Minuten als %s', (minutes, expected) => {
    expect(formatTimeDifference(minutes)).toBe(expected);
  });

  it.each([0.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'lehnt die ungültige Differenz %s ab',
    (minutes) => {
      expect(() => formatTimeDifference(minutes)).toThrow(RangeError);
    },
  );
});

describe('Rundung berechneter Zeitdauern', () => {
  it.each([
    [480 + 29 / 60, 480],
    [480.499, 480],
    [480.5, 481],
    [480 + 45 / 60, 481],
    [0, 0],
  ])('rundet %s Minuten auf %i Minuten', (minutes, expected) => {
    expect(roundNonNegativeMinutes(minutes)).toBe(expected);
  });

  it.each([-0.1, Number.NaN, Number.NEGATIVE_INFINITY])(
    'lehnt den ungültigen Rundungswert %s ab',
    (minutes) => {
      expect(() => roundNonNegativeMinutes(minutes)).toThrow(RangeError);
    },
  );

  it('lehnt ein Ergebnis außerhalb sicherer ganzer Zahlen ab', () => {
    expect(() => roundNonNegativeMinutes(Number.MAX_SAFE_INTEGER + 1)).toThrow(
      RangeError,
    );
  });
});
