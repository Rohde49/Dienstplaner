import {
  BrowserWindow,
  ipcMain,
  type BaseWindow,
  type IpcMainInvokeEvent,
  type PrintToPDFOptions,
  type WebContents,
} from 'electron';
import { writeFile } from 'node:fs/promises';

import { PDF_EXPORT_IPC_CHANNELS } from '../../shared/ipc';
import {
  pdfExportRequestSchema,
  pdfExportResultSchema,
  type PdfExportResult,
} from '../../shared/schemas';
import {
  createPdfExportDialog,
  type PdfExportDialog,
} from '../pdf/pdfExportDialog';

export const PDF_EXPORT_PRINT_OPTIONS = {
  pageSize: 'A4',
  landscape: false,
  displayHeaderFooter: false,
  printBackground: true,
  preferCSSPageSize: true,
  scale: 1,
  margins: { top: 0, right: 0, bottom: 0, left: 0 },
} satisfies PrintToPDFOptions;

type PdfExportHandlerDependencies = {
  exportDialog: Pick<
    PdfExportDialog,
    'selectTarget' | 'rememberSuccessfulExport'
  >;
  getParentWindow: (sender: WebContents) => BaseWindow | null;
  writePdfFile: (filePath: string, data: Uint8Array) => Promise<void>;
};

/** Erstellt den testbaren Kern des privilegierten PDF-Exports. */
export function createPdfExportHandler({
  exportDialog,
  getParentWindow,
  writePdfFile,
}: PdfExportHandlerDependencies) {
  return async (
    event: IpcMainInvokeEvent,
    requestValue: unknown,
  ): Promise<PdfExportResult> => {
    const request = pdfExportRequestSchema.parse(requestValue);
    const parentWindow = getParentWindow(event.sender);

    if (!parentWindow) {
      throw new Error('Das Anwendungsfenster für den PDF-Export fehlt.');
    }

    const filePath = await exportDialog.selectTarget(parentWindow, request);

    if (!filePath) {
      return pdfExportResultSchema.parse({ status: 'cancelled' });
    }

    const pdfData = await event.sender.printToPDF(PDF_EXPORT_PRINT_OPTIONS);
    await writePdfFile(filePath, pdfData);
    exportDialog.rememberSuccessfulExport(filePath);

    return pdfExportResultSchema.parse({ status: 'saved' });
  };
}

/** Registriert den vollständig im Main Process ausgeführten PDF-Export. */
export function registerPdfExportIpcHandlers(): void {
  const exportDialog = createPdfExportDialog();
  const handler = createPdfExportHandler({
    exportDialog,
    getParentWindow: (sender) => BrowserWindow.fromWebContents(sender),
    writePdfFile: (filePath, data) => writeFile(filePath, data),
  });

  ipcMain.handle(PDF_EXPORT_IPC_CHANNELS.export, handler);
}
