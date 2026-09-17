import { describe, expect, it } from 'vitest';

import {
  calculateAttendanceMinutes,
  calculateWorkingMinutes,
  entryTypeInputSchema,
  entryTypesFileSchema,
  timeValuesSchema,
  type EntryTypesFile,
} from '../../../src/shared/schemas/entryType';

const zeroTimeValues = {
  attendanceMinutes: 0,
  pauseMinutes: 0,
  workingMinutes: 0,
  workingWithoutNightReadinessMinutes: 0,
  nightReadinessMinutes: 0,
  nightWorkMinutes: 0,
};

function createFixedEntryTypeInput() {
  return {
    code: 'SN',
    name: 'Spät-Nacht-Dienst',
    calculationType: 'fixed' as const,
    startTime: '14:00',
    endTime: '08:00',
    timeValues: {
      attendanceMinutes: 1_080,
      pauseMinutes: 480,
      workingMinutes: 600,
      workingWithoutNightReadinessMinutes: 480,
      nightReadinessMinutes: 120,
      nightWorkMinutes: 60,
    },
    active: true,
  };
}

const validStoredEntryType = {
  ...createFixedEntryTypeInput(),
  id: '5f3567d3-e035-4111-b69f-27783078c9d3',
  createdAt: '2026-09-11T10:00:00.000Z',
  updatedAt: '2026-09-11T10:00:00.000Z',
};

describe('Zeitwerte einer Eintragsart', () => {
  it('berechnet die Arbeitszeit mit NB aus beiden Bestandteilen', () => {
    expect(calculateWorkingMinutes(480, 120)).toBe(600);
  });

  it('berechnet die Anwesenheitszeit aus Arbeitszeit mit NB und Pause', () => {
    expect(calculateAttendanceMinutes(600, 480)).toBe(1_080);
  });

  it('akzeptiert die berechnete Arbeitszeit aus reiner Arbeitszeit und Nachtbereitschaft', () => {
    expect(
      timeValuesSchema.parse(createFixedEntryTypeInput().timeValues),
    ).toEqual(createFixedEntryTypeInput().timeValues);
  });

  it('lehnt eine widersprüchlich gespeicherte Arbeitszeit ab', () => {
    const result = timeValuesSchema.safeParse({
      ...createFixedEntryTypeInput().timeValues,
      workingMinutes: 599,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['workingMinutes'],
            message:
              'Die Arbeitszeit (mit NB) muss der Summe aus reiner Arbeitszeit und Nachtbereitschaft entsprechen.',
          }),
        ]),
      );
    }
  });

  it('lehnt eine widersprüchlich gespeicherte Anwesenheitszeit ab', () => {
    const result = timeValuesSchema.safeParse({
      ...createFixedEntryTypeInput().timeValues,
      attendanceMinutes: 1_079,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['attendanceMinutes'],
            message:
              'Die Anwesenheitszeit muss der Summe aus Arbeitszeit (mit NB) und Pause entsprechen.',
          }),
        ]),
      );
    }
  });

  it('lehnt einen Summenüberlauf ab', () => {
    const result = timeValuesSchema.safeParse({
      ...zeroTimeValues,
      workingMinutes: Number.MAX_SAFE_INTEGER,
      workingWithoutNightReadinessMinutes: Number.MAX_SAFE_INTEGER,
      nightReadinessMinutes: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['workingMinutes'],
            message:
              'Die Summe aus reiner Arbeitszeit und Nachtbereitschaft ist zu groß, um zuverlässig gespeichert zu werden.',
          }),
        ]),
      );
    }
  });

  it('lehnt nicht sichere einzelne Minutenwerte ab', () => {
    expect(
      timeValuesSchema.safeParse({
        ...zeroTimeValues,
        attendanceMinutes: Number.MAX_SAFE_INTEGER + 1,
      }).success,
    ).toBe(false);
  });
});

describe('Berechnungsarten', () => {
  it('entfernt äußere Leerzeichen aus Texten und Uhrzeiten', () => {
    const input = {
      ...createFixedEntryTypeInput(),
      code: ' SN/F ',
      name: ' Spät-Nacht-Dienst ',
      startTime: ' 14:00 ',
      endTime: ' 08:00 ',
    };

    expect(entryTypeInputSchema.parse(input)).toMatchObject({
      code: 'SN/F',
      name: 'Spät-Nacht-Dienst',
      startTime: '14:00',
      endTime: '08:00',
    });
  });

  it('lehnt ein ausschließlich aus Leerzeichen bestehendes Kürzel ab', () => {
    expect(
      entryTypeInputSchema.safeParse({
        ...createFixedEntryTypeInput(),
        code: '   ',
      }).success,
    ).toBe(false);
  });

  it('akzeptiert bei Wochenarbeitszeit null-Uhrzeiten und ausschließlich Nullwerte', () => {
    expect(
      entryTypeInputSchema.parse({
        ...createFixedEntryTypeInput(),
        calculationType: 'weeklyWorkingTime',
        startTime: null,
        endTime: null,
        timeValues: zeroTimeValues,
      }),
    ).toMatchObject({
      calculationType: 'weeklyWorkingTime',
      startTime: null,
      endTime: null,
      timeValues: zeroTimeValues,
    });
  });

  it('lehnt bei Wochenarbeitszeit feste Zeitwerte ab', () => {
    const result = entryTypeInputSchema.safeParse({
      ...createFixedEntryTypeInput(),
      calculationType: 'weeklyWorkingTime',
      startTime: null,
      endTime: null,
    });

    expect(result.success).toBe(false);
  });

  it('lehnt bei Wochenarbeitszeit feste Uhrzeiten ab', () => {
    const result = entryTypeInputSchema.safeParse({
      ...createFixedEntryTypeInput(),
      calculationType: 'weeklyWorkingTime',
      timeValues: zeroTimeValues,
    });

    expect(result.success).toBe(false);
  });

  it('akzeptiert freie Tage ohne Uhrzeiten und ausschließlich mit Nullwerten', () => {
    expect(
      entryTypeInputSchema.parse({
        ...createFixedEntryTypeInput(),
        code: 'WF',
        calculationType: 'freeDay',
        startTime: null,
        endTime: null,
        timeValues: zeroTimeValues,
      }),
    ).toMatchObject({
      code: 'WF',
      calculationType: 'freeDay',
      startTime: null,
      endTime: null,
      timeValues: zeroTimeValues,
    });
  });

  it('lehnt bei freien Tagen feste Zeitwerte ab', () => {
    expect(
      entryTypeInputSchema.safeParse({
        ...createFixedEntryTypeInput(),
        calculationType: 'freeDay',
        startTime: null,
        endTime: null,
      }).success,
    ).toBe(false);
  });

  it('lehnt bei freien Tagen feste Uhrzeiten ab', () => {
    expect(
      entryTypeInputSchema.safeParse({
        ...createFixedEntryTypeInput(),
        calculationType: 'freeDay',
        timeValues: zeroTimeValues,
      }).success,
    ).toBe(false);
  });
});

describe('Eintragsartendatei', () => {
  it('verwendet Schema-Version 3', () => {
    const file: EntryTypesFile = {
      schemaVersion: 3,
      updatedAt: '2026-09-11T10:00:00.000Z',
      entryTypes: [],
    };

    expect(entryTypesFileSchema.parse(file)).toEqual(file);
  });

  it('lehnt die vorherige Schema-Version ab', () => {
    expect(
      entryTypesFileSchema.safeParse({
        schemaVersion: 2,
        updatedAt: '2026-09-11T10:00:00.000Z',
        entryTypes: [],
      }).success,
    ).toBe(false);
  });

  it('lehnt doppelte Eintragsarten-IDs ab', () => {
    expect(
      entryTypesFileSchema.safeParse({
        schemaVersion: 3,
        updatedAt: validStoredEntryType.updatedAt,
        entryTypes: [
          validStoredEntryType,
          {
            ...validStoredEntryType,
            name: 'Zweite Eintragsart',
          },
        ],
      }).success,
    ).toBe(false);
  });
});
