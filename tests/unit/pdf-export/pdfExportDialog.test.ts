import type {
  BaseWindow,
  SaveDialogOptions,
  SaveDialogReturnValue,
} from 'electron';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { PdfExportDialog } from '../../../src/main/pdf/pdfExportDialog';

const request = {
  year: 2026,
  month: 9,
  title: 'Dienstplan der Regelgruppe',
};

function createDialog(
  results: SaveDialogReturnValue[],
  documentsPath = path.join('C:', 'Users', 'Test', 'Documents'),
) {
  const showSaveDialog = vi.fn(
    async (
      parentWindow: BaseWindow,
      options: SaveDialogOptions,
    ): Promise<SaveDialogReturnValue> => {
      void parentWindow;
      void options;
      return results.shift() ?? { canceled: true, filePath: '' };
    },
  );

  return {
    dialog: new PdfExportDialog({
      getDocumentsPath: () => documentsPath,
      showSaveDialog,
    }),
    documentsPath,
    parentWindow: {} as BaseWindow,
    showSaveDialog,
  };
}

describe('PDF-Speicherdialog', () => {
  it('verwendet beim ersten Export Dokumente und den bestätigten Dateinamen', async () => {
    const testContext = createDialog([{ canceled: true, filePath: '' }]);

    await testContext.dialog.selectTarget(testContext.parentWindow, request);

    expect(testContext.showSaveDialog).toHaveBeenCalledWith(
      testContext.parentWindow,
      {
        title: 'Dienstplan als PDF exportieren',
        defaultPath: path.join(
          testContext.documentsPath,
          '2026-09 - Dienstplan der Regelgruppe.pdf',
        ),
        buttonLabel: 'PDF speichern',
        filters: [{ name: 'PDF-Dateien', extensions: ['pdf'] }],
        properties: ['showOverwriteConfirmation'],
      },
    );
  });

  it('behandelt einen Dialogabbruch als neutrales Ergebnis', async () => {
    const testContext = createDialog([{ canceled: true, filePath: '' }]);

    await expect(
      testContext.dialog.selectTarget(testContext.parentWindow, request),
    ).resolves.toBeNull();
  });

  it('ergänzt die Endung, ohne den Zielpfad an einen API-Vertrag zu hängen', async () => {
    const targetWithoutExtension = path.join('C:', 'Export', 'Septemberplan');
    const testContext = createDialog([
      { canceled: false, filePath: targetWithoutExtension },
    ]);

    await expect(
      testContext.dialog.selectTarget(testContext.parentWindow, request),
    ).resolves.toBe(`${targetWithoutExtension}.pdf`);
  });

  it('merkt erst nach bestätigtem Erfolg den gewählten Ordner', async () => {
    const firstTarget = path.join('D:', 'Dienstplaene', 'September.pdf');
    const testContext = createDialog([
      { canceled: false, filePath: firstTarget },
      { canceled: true, filePath: '' },
      { canceled: true, filePath: '' },
    ]);

    await testContext.dialog.selectTarget(testContext.parentWindow, request);
    await testContext.dialog.selectTarget(testContext.parentWindow, request);

    expect(testContext.showSaveDialog.mock.calls[1][1].defaultPath).toBe(
      path.join(
        testContext.documentsPath,
        '2026-09 - Dienstplan der Regelgruppe.pdf',
      ),
    );

    testContext.dialog.rememberSuccessfulExport(firstTarget);
    await testContext.dialog.selectTarget(testContext.parentWindow, request);

    expect(testContext.showSaveDialog.mock.calls[2][1].defaultPath).toBe(
      path.join(
        path.dirname(firstTarget),
        '2026-09 - Dienstplan der Regelgruppe.pdf',
      ),
    );
  });

  it('validiert die Anfrage vor dem Öffnen des Dialogs', async () => {
    const testContext = createDialog([{ canceled: true, filePath: '' }]);

    await expect(
      testContext.dialog.selectTarget(testContext.parentWindow, {
        ...request,
        month: 13,
      }),
    ).rejects.toThrow();
    expect(testContext.showSaveDialog).not.toHaveBeenCalled();
  });
});
