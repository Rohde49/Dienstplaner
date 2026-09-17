import { describe, expect, it } from 'vitest';

import {
  getPdfExportActionTitle,
  getPdfExportErrorMessage,
  isPdfExportActionDisabled,
  isPdfExportActionVisible,
  needsSavedPlanExportConfirmation,
} from '../../../src/renderer/features/planner/plannerPdfExport';

describe('PDF-Export-Oberflächenzustand', () => {
  it('zeigt die Aktion ausschließlich in der Kompaktansicht', () => {
    expect(isPdfExportActionVisible(false)).toBe(false);
    expect(isPdfExportActionVisible(true)).toBe(true);
  });

  it('sperrt die Aktion während Messung, Überlauf und Erzeugung', () => {
    expect(isPdfExportActionDisabled('measuring', 'idle')).toBe(true);
    expect(isPdfExportActionDisabled('overflow', 'idle')).toBe(true);
    expect(isPdfExportActionDisabled('fits', 'exporting')).toBe(true);
    expect(isPdfExportActionDisabled('fits', 'idle')).toBe(false);
  });

  it('beschreibt jeden Sperr- und Bereitschaftszustand verständlich', () => {
    expect(getPdfExportActionTitle('measuring', 'idle')).toBe(
      'A4-Passung wird geprüft.',
    );
    expect(getPdfExportActionTitle('overflow', 'idle')).toBe(
      'Der Dienstplan passt nicht auf eine A4-Seite.',
    );
    expect(getPdfExportActionTitle('fits', 'exporting')).toBe(
      'PDF wird erstellt …',
    );
    expect(getPdfExportActionTitle('fits', 'idle')).toBe(
      'Dienstplan als PDF exportieren',
    );
  });

  it('fordert die Bestätigung ausschließlich bei einem abweichenden Entwurf', () => {
    expect(needsSavedPlanExportConfirmation(false)).toBe(false);
    expect(needsSavedPlanExportConfirmation(true)).toBe(true);
  });

  it('übersetzt bekannte und unbekannte Dateifehler verständlich', () => {
    expect(getPdfExportErrorMessage(new Error('write EACCES'))).toContain(
      'nicht zugegriffen',
    );
    expect(getPdfExportErrorMessage(new Error('write ENOSPC'))).toContain(
      'Speicherplatz',
    );
    expect(getPdfExportErrorMessage(new Error('write ENOENT'))).toContain(
      'nicht mehr verfügbar',
    );
    expect(getPdfExportErrorMessage(new Error('Unbekannt'))).toContain(
      'nicht erstellt',
    );
  });
});
