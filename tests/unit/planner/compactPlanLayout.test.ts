import { describe, expect, it } from 'vitest';

import {
  A4_DOCUMENT_HEIGHT,
  A4_DOCUMENT_WIDTH,
  calculateCompactPlanLayoutMetrics,
} from '../../../src/renderer/features/planner/compactPlanLayout';

describe('Kompaktansichtslayout', () => {
  it('vergrößert die A4-Seite auf großen Flächen nicht über die Originalgröße', () => {
    expect(
      calculateCompactPlanLayoutMetrics(
        A4_DOCUMENT_WIDTH + 200,
        A4_DOCUMENT_WIDTH,
        A4_DOCUMENT_HEIGHT,
      ),
    ).toEqual({
      scale: 1,
      renderedHeight: A4_DOCUMENT_HEIGHT,
      doesOverflow: false,
    });
  });

  it('akzeptiert die für 1024 Pixel bestätigte Mindestskalierung', () => {
    const result = calculateCompactPlanLayoutMetrics(
      A4_DOCUMENT_WIDTH * 0.84,
      A4_DOCUMENT_WIDTH,
      A4_DOCUMENT_HEIGHT,
    );

    expect(result.scale).toBeCloseTo(0.84);
    expect(result.doesOverflow).toBe(false);
  });

  it('meldet eine unlesbare Skalierung oder tatsächlichen Inhaltsüberlauf', () => {
    expect(
      calculateCompactPlanLayoutMetrics(
        A4_DOCUMENT_WIDTH * 0.83,
        A4_DOCUMENT_WIDTH,
        A4_DOCUMENT_HEIGHT,
      ).doesOverflow,
    ).toBe(true);
    expect(
      calculateCompactPlanLayoutMetrics(
        A4_DOCUMENT_WIDTH,
        A4_DOCUMENT_WIDTH,
        A4_DOCUMENT_HEIGHT + 2,
      ).doesOverflow,
    ).toBe(true);
    expect(
      calculateCompactPlanLayoutMetrics(
        A4_DOCUMENT_WIDTH,
        A4_DOCUMENT_WIDTH + 2,
        A4_DOCUMENT_HEIGHT,
      ).doesOverflow,
    ).toBe(true);
    expect(
      calculateCompactPlanLayoutMetrics(
        A4_DOCUMENT_WIDTH,
        A4_DOCUMENT_WIDTH,
        A4_DOCUMENT_HEIGHT,
        true,
      ).doesOverflow,
    ).toBe(true);
  });

  it('bewahrt überlaufenden Inhalt in der berechneten Bildschirmhöhe', () => {
    const contentHeight = A4_DOCUMENT_HEIGHT + 100;
    const result = calculateCompactPlanLayoutMetrics(
      A4_DOCUMENT_WIDTH / 2,
      A4_DOCUMENT_WIDTH,
      contentHeight,
    );

    expect(result.renderedHeight).toBe(contentHeight / 2);
  });

  it('weist ungültige Messwerte zurück', () => {
    expect(() =>
      calculateCompactPlanLayoutMetrics(
        0,
        A4_DOCUMENT_WIDTH,
        A4_DOCUMENT_HEIGHT,
      ),
    ).toThrow(RangeError);
  });
});
