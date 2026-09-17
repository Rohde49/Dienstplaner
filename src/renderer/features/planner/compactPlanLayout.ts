export const A4_DOCUMENT_WIDTH = 794;
export const A4_DOCUMENT_HEIGHT = 1123;
export const MIN_READABLE_COMPACT_PLAN_SCALE = 0.84;

export type CompactPlanFitStatus = 'measuring' | 'fits' | 'overflow';

export type CompactPlanLayoutMetrics = {
  scale: number;
  renderedHeight: number;
  doesOverflow: boolean;
};

/** Übersetzt die laufende DOM-Messung in einen stabilen Exportstatus. */
export function getCompactPlanFitStatus(
  hasCurrentMeasurement: boolean,
  doesOverflow: boolean,
): CompactPlanFitStatus {
  if (!hasCurrentMeasurement) {
    return 'measuring';
  }

  return doesOverflow ? 'overflow' : 'fits';
}

/** Bewertet Bildschirmmaßstab und tatsächlichen Inhalt gegen die bestätigte A4-Seite. */
export function calculateCompactPlanLayoutMetrics(
  availableWidth: number,
  contentWidth: number,
  contentHeight: number,
  violatesContentLimits = false,
): CompactPlanLayoutMetrics {
  if (
    !Number.isFinite(availableWidth) ||
    availableWidth <= 0 ||
    !Number.isFinite(contentWidth) ||
    contentWidth < 0 ||
    !Number.isFinite(contentHeight) ||
    contentHeight < 0
  ) {
    throw new RangeError('Die gemessenen Dokumentmaße müssen gültig sein.');
  }

  const scale = Math.min(1, availableWidth / A4_DOCUMENT_WIDTH);
  const renderedHeight = Math.max(A4_DOCUMENT_HEIGHT, contentHeight) * scale;
  const doesOverflow =
    contentWidth > A4_DOCUMENT_WIDTH + 1 ||
    contentHeight > A4_DOCUMENT_HEIGHT + 1 ||
    scale < MIN_READABLE_COMPACT_PLAN_SCALE - 0.0001 ||
    violatesContentLimits;

  return { scale, renderedHeight, doesOverflow };
}
