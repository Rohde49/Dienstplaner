import { describe, expect, it } from 'vitest';

import {
  MAX_PDF_EXPORT_FILE_NAME_LENGTH,
  createPdfExportFileName,
  ensurePdfFileExtension,
} from '../../../src/shared/pdfExport';
import {
  pdfExportRequestSchema,
  pdfExportResultSchema,
} from '../../../src/shared/schemas';

describe('PDF-Exportvertrag', () => {
  it('akzeptiert nur die benötigten Planangaben und begrenzten Ergebnisse', () => {
    expect(
      pdfExportRequestSchema.parse({
        year: 2026,
        month: 9,
        title: 'Dienstplan der Regelgruppe',
      }),
    ).toEqual({
      year: 2026,
      month: 9,
      title: 'Dienstplan der Regelgruppe',
    });
    expect(pdfExportResultSchema.parse({ status: 'saved' })).toEqual({
      status: 'saved',
    });
    expect(pdfExportResultSchema.parse({ status: 'cancelled' })).toEqual({
      status: 'cancelled',
    });
  });

  it('lehnt unbekannte Felder und ungültige Monatsangaben ab', () => {
    expect(
      pdfExportRequestSchema.safeParse({
        year: 2026,
        month: 13,
        title: 'Dienstplan',
      }).success,
    ).toBe(false);
    expect(
      pdfExportRequestSchema.safeParse({
        year: 2026,
        month: 9,
        title: 'Dienstplan',
        filePath: 'C:\\fremd.pdf',
      }).success,
    ).toBe(false);
    expect(
      pdfExportResultSchema.safeParse({
        status: 'saved',
        filePath: 'C:\\fremd.pdf',
      }).success,
    ).toBe(false);
  });
});

describe('PDF-Dateiname', () => {
  it('bildet Jahr, Monat und Plantitel im bestätigten Format ab', () => {
    expect(
      createPdfExportFileName({
        year: 2026,
        month: 9,
        title: 'Dienstplan der Regelgruppe',
      }),
    ).toBe('2026-09 - Dienstplan der Regelgruppe.pdf');
  });

  it('ersetzt unzulässige Windows-Zeichen und normalisiert Leerraum', () => {
    expect(
      createPdfExportFileName({
        year: 2026,
        month: 12,
        title: '  Regelgruppe: Nord/West?  ',
      }),
    ).toBe('2026-12 - Regelgruppe- Nord-West.pdf');
  });

  it('begrenzt lange Vorschläge und schneidet Unicode-Zeichen nicht entzwei', () => {
    const fileName = createPdfExportFileName({
      year: 2026,
      month: 9,
      title: `${'x'.repeat(104)}🙂${'x'.repeat(50)}`,
    });

    expect(fileName).toHaveLength(MAX_PDF_EXPORT_FILE_NAME_LENGTH);
    expect(fileName.endsWith('.pdf')).toBe(true);
    expect(fileName).toContain('🙂');
  });

  it('ergänzt eine fehlende Endung und akzeptiert vorhandene Großschreibung', () => {
    expect(ensurePdfFileExtension('C:\\Export\\Dienstplan')).toBe(
      'C:\\Export\\Dienstplan.pdf',
    );
    expect(ensurePdfFileExtension('C:\\Export\\Dienstplan.PDF')).toBe(
      'C:\\Export\\Dienstplan.PDF',
    );
  });

  it('weist einen leeren Zielpfad zurück', () => {
    expect(() => ensurePdfFileExtension('   ')).toThrow(RangeError);
  });
});
