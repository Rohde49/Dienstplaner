import {
  app,
  dialog,
  type BaseWindow,
  type SaveDialogOptions,
  type SaveDialogReturnValue,
} from 'electron';
import path from 'node:path';

import {
  createPdfExportFileName,
  ensurePdfFileExtension,
} from '../../shared/pdfExport';
import {
  pdfExportRequestSchema,
  type PdfExportRequest,
} from '../../shared/schemas';

type PdfExportDialogDependencies = {
  getDocumentsPath: () => string;
  showSaveDialog: (
    parentWindow: BaseWindow,
    options: SaveDialogOptions,
  ) => Promise<SaveDialogReturnValue>;
};

/** Kapselt Zielauswahl und den nur sitzungsweit gemerkten Exportordner. */
export class PdfExportDialog {
  private lastSuccessfulDirectory: string | null = null;

  constructor(private readonly dependencies: PdfExportDialogDependencies) {}

  async selectTarget(
    parentWindow: BaseWindow,
    requestValue: unknown,
  ): Promise<string | null> {
    const request: PdfExportRequest =
      pdfExportRequestSchema.parse(requestValue);
    const initialDirectory =
      this.lastSuccessfulDirectory ?? this.dependencies.getDocumentsPath();
    const result = await this.dependencies.showSaveDialog(parentWindow, {
      title: 'Dienstplan als PDF exportieren',
      defaultPath: path.join(
        initialDirectory,
        createPdfExportFileName(request),
      ),
      buttonLabel: 'PDF speichern',
      filters: [{ name: 'PDF-Dateien', extensions: ['pdf'] }],
      properties: ['showOverwriteConfirmation'],
    });

    if (result.canceled || result.filePath.length === 0) {
      return null;
    }

    return ensurePdfFileExtension(result.filePath);
  }

  /** Übernimmt den Ordner erst nach einer tatsächlich gespeicherten PDF. */
  rememberSuccessfulExport(filePath: string): void {
    this.lastSuccessfulDirectory = path.dirname(
      ensurePdfFileExtension(filePath),
    );
  }
}

/** Erstellt die produktive Dialoginstanz mit den geschützten Electron-APIs. */
export function createPdfExportDialog(): PdfExportDialog {
  return new PdfExportDialog({
    getDocumentsPath: () => app.getPath('documents'),
    showSaveDialog: (parentWindow, options) =>
      dialog.showSaveDialog(parentWindow, options),
  });
}
