import type { BaseWindow, IpcMainInvokeEvent, WebContents } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PDF_EXPORT_PRINT_OPTIONS,
  createPdfExportHandler,
} from '../../../src/main/ipc/registerPdfExportIpcHandlers';

const request = {
  year: 2026,
  month: 9,
  title: 'Dienstplan der Regelgruppe',
};

describe('PDF-Export-Handler', () => {
  const parentWindow = {} as BaseWindow;
  const pdfData = Buffer.from('PDF-Testdaten');
  const printToPDF = vi.fn(async () => pdfData);
  const selectTarget = vi.fn();
  const rememberSuccessfulExport = vi.fn();
  const writePdfFile = vi.fn(async () => undefined);
  const getParentWindow = vi.fn(() => parentWindow);
  const event = {
    sender: { printToPDF } as unknown as WebContents,
  } as IpcMainInvokeEvent;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createHandler() {
    return createPdfExportHandler({
      exportDialog: { selectTarget, rememberSuccessfulExport },
      getParentWindow,
      writePdfFile,
    });
  }

  it('behandelt einen abgebrochenen Speicherdialog ohne PDF-Erzeugung', async () => {
    selectTarget.mockResolvedValueOnce(null);

    await expect(createHandler()(event, request)).resolves.toEqual({
      status: 'cancelled',
    });
    expect(printToPDF).not.toHaveBeenCalled();
    expect(writePdfFile).not.toHaveBeenCalled();
    expect(rememberSuccessfulExport).not.toHaveBeenCalled();
  });

  it('erzeugt und schreibt die PDF mit den verbindlichen A4-Optionen', async () => {
    const filePath = 'C:\\Export\\2026-09 - Dienstplan.pdf';
    selectTarget.mockResolvedValueOnce(filePath);

    await expect(createHandler()(event, request)).resolves.toEqual({
      status: 'saved',
    });
    expect(printToPDF).toHaveBeenCalledWith(PDF_EXPORT_PRINT_OPTIONS);
    expect(writePdfFile).toHaveBeenCalledWith(filePath, pdfData);
    expect(rememberSuccessfulExport).toHaveBeenCalledWith(filePath);
  });

  it('merkt den Ordner nicht, wenn das Schreiben fehlschlägt', async () => {
    selectTarget.mockResolvedValueOnce('C:\\Export\\Dienstplan.pdf');
    writePdfFile.mockRejectedValueOnce(new Error('Schreiben fehlgeschlagen'));

    await expect(createHandler()(event, request)).rejects.toThrow(
      'Schreiben fehlgeschlagen',
    );
    expect(rememberSuccessfulExport).not.toHaveBeenCalled();
  });

  it('validiert die Anfrage vor Dialog und Erzeugung', async () => {
    await expect(
      createHandler()(event, { ...request, month: 13 }),
    ).rejects.toThrow();
    expect(selectTarget).not.toHaveBeenCalled();
    expect(printToPDF).not.toHaveBeenCalled();
  });

  it('bricht ohne zugeordnetes Anwendungsfenster verständlich ab', async () => {
    getParentWindow.mockReturnValueOnce(null);

    await expect(createHandler()(event, request)).rejects.toThrow(
      'Das Anwendungsfenster für den PDF-Export fehlt.',
    );
    expect(selectTarget).not.toHaveBeenCalled();
  });
});
