import { describe, expect, it } from 'vitest';

import { EMPLOYEE_COLOR_STYLES } from '../../../src/renderer/styles/employeeColors';
import { EMPLOYEE_COLOR_KEYS } from '../../../src/shared/schemas';

describe('Darstellungsvarianten der Mitarbeiterfarben', () => {
  it('definiert jede zulässige Farbe genau einmal', () => {
    expect(Object.keys(EMPLOYEE_COLOR_STYLES)).toEqual(EMPLOYEE_COLOR_KEYS);
  });

  it.each(EMPLOYEE_COLOR_KEYS)(
    'stellt alle Varianten für %s statisch bereit',
    (colorKey) => {
      const style = EMPLOYEE_COLOR_STYLES[colorKey];

      expect(style).toMatchObject({
        label: expect.any(String),
        selectionDotClass: expect.stringMatching(/^bg-/),
      });
      expect(style.plannerHeaderClass).toMatch(/bg-/);
      expect(style.plannerHeaderClass).toMatch(/border-/);
      expect(style.plannerHeaderClass).toMatch(/text-/);
      expect(style.compactHeaderClass).toMatch(/bg-/);
      expect(style.compactHeaderClass).toMatch(/text-/);
      expect(style.compactHeaderClass).not.toMatch(/border-/);
      expect(style.plannerCellClass).toMatch(/bg-/);
      expect(style.plannerCellClass).toMatch(/border-/);
      expect(style.plannerCellClass).toMatch(/text-/);
    },
  );
});
