import type { CompactPlanFitStatus } from './compactPlanLayout';

export type PlannerPdfExportStatus = 'idle' | 'exporting';

/** Der Export gehört ausschließlich zur aktiven Kompaktansicht. */
export function isPdfExportActionVisible(isCompactView: boolean): boolean {
  return isCompactView;
}

/** Verhindert den Export bis zur bestätigten A4-Passung und während der Erzeugung. */
export function isPdfExportActionDisabled(
  fitStatus: CompactPlanFitStatus,
  exportStatus: PlannerPdfExportStatus,
): boolean {
  return fitStatus !== 'fits' || exportStatus === 'exporting';
}

/** Erklärt den jeweils aktuellen Zustand der Exportaktion. */
export function getPdfExportActionTitle(
  fitStatus: CompactPlanFitStatus,
  exportStatus: PlannerPdfExportStatus,
): string {
  if (exportStatus === 'exporting') {
    return 'PDF wird erstellt …';
  }

  if (fitStatus === 'measuring') {
    return 'A4-Passung wird geprüft.';
  }

  if (fitStatus === 'overflow') {
    return 'Der Dienstplan passt nicht auf eine A4-Seite.';
  }

  return 'Dienstplan als PDF exportieren';
}

/** Ein abweichender Entwurf benötigt vor dem gespeicherten Exportstand eine Bestätigung. */
export function needsSavedPlanExportConfirmation(
  hasUnsavedChanges: boolean,
): boolean {
  return hasUnsavedChanges;
}

/** Übersetzt technische Schreibfehler in eine knappe, handlungsorientierte Meldung. */
export function getPdfExportErrorMessage(error: unknown): string {
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : '';

  if (
    errorMessage.includes('eacces') ||
    errorMessage.includes('eperm') ||
    errorMessage.includes('permission') ||
    errorMessage.includes('zugriff')
  ) {
    return 'Auf die gewählte Datei konnte nicht zugegriffen werden. Bitte wähle einen anderen Speicherort oder schließe die bereits geöffnete Datei.';
  }

  if (errorMessage.includes('enospc') || errorMessage.includes('no space')) {
    return 'Am gewählten Speicherort ist nicht genügend freier Speicherplatz vorhanden.';
  }

  if (errorMessage.includes('enoent') || errorMessage.includes('not found')) {
    return 'Der gewählte Speicherort ist nicht mehr verfügbar. Bitte wähle einen anderen Ordner.';
  }

  return 'Die Datei konnte am gewählten Speicherort nicht erstellt werden. Bitte versuche es erneut oder wähle einen anderen Ordner.';
}
