import { describe, expect, it } from 'vitest';

import type { EntryType } from '../../../src/shared/schemas';
import {
  moveEntryType,
  swapEntryType,
} from '../../../src/renderer/features/entry-types/entryTypeOrder';

function createEntryType(id: string, code: string): EntryType {
  return {
    id,
    code,
    name: code,
    calculationType: 'freeDay',
    startTime: null,
    endTime: null,
    timeValues: {
      attendanceMinutes: 0,
      pauseMinutes: 0,
      workingMinutes: 0,
      workingWithoutNightReadinessMinutes: 0,
      nightReadinessMinutes: 0,
      nightWorkMinutes: 0,
    },
    active: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  };
}

const entryTypes = [
  createEntryType('11111111-1111-4111-8111-111111111111', 'A'),
  createEntryType('22222222-2222-4222-8222-222222222222', 'B'),
  createEntryType('33333333-3333-4333-8333-333333333333', 'C'),
];

function codes(items: EntryType[]): string[] {
  return items.map((entryType) => entryType.code);
}

describe('Reihenfolge der Eintragsarten', () => {
  it('verschiebt einen Eintrag vor eine Zielzeile', () => {
    expect(
      codes(
        moveEntryType(entryTypes, entryTypes[2].id, entryTypes[0].id, 'before'),
      ),
    ).toEqual(['C', 'A', 'B']);
  });

  it('verschiebt einen Eintrag hinter eine Zielzeile', () => {
    expect(
      codes(
        moveEntryType(entryTypes, entryTypes[0].id, entryTypes[2].id, 'after'),
      ),
    ).toEqual(['B', 'C', 'A']);
  });

  it('verändert die Liste beim Ablegen an derselben Position nicht', () => {
    expect(
      moveEntryType(entryTypes, entryTypes[0].id, entryTypes[1].id, 'before'),
    ).toEqual(entryTypes);
  });

  it('verschiebt einen Eintrag per Tastatur um genau eine Position', () => {
    expect(codes(swapEntryType(entryTypes, entryTypes[1].id, -1))).toEqual([
      'B',
      'A',
      'C',
    ]);
  });

  it('überschreitet bei der Tastaturbedienung keine Listengrenze', () => {
    expect(swapEntryType(entryTypes, entryTypes[0].id, -1)).toBe(entryTypes);
    expect(swapEntryType(entryTypes, entryTypes[2].id, 1)).toBe(entryTypes);
  });
});
