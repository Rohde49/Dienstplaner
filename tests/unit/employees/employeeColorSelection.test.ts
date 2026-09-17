import { describe, expect, it } from 'vitest';

import { getFirstAvailableEmployeeColorKey } from '../../../src/renderer/features/team/employeeColorSelection';
import { EMPLOYEE_COLOR_KEYS } from '../../../src/shared/schemas';

describe('Vorauswahl der Mitarbeiterfarbe', () => {
  it('wählt die erste noch nicht verwendete Farbe', () => {
    expect(getFirstAvailableEmployeeColorKey(['blue', 'teal'])).toBe('green');
  });

  it('verwendet Blau, wenn alle Farben bereits vergeben sind', () => {
    expect(getFirstAvailableEmployeeColorKey(EMPLOYEE_COLOR_KEYS)).toBe('blue');
  });

  it('berücksichtigt jede Farbe nur als verwendet oder frei', () => {
    expect(getFirstAvailableEmployeeColorKey(['blue', 'blue'])).toBe('teal');
  });
});
