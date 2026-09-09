import { ipcMain } from 'electron';

import { ENTRY_TYPE_IPC_CHANNELS } from '../../shared/ipc';
import {
  createEntryType,
  deleteEntryType,
  listEntryTypes,
  updateEntryType,
} from '../storage/entryTypesRepository';

/** Registriert alle Anfragen der Oberfläche zur Eintragsartenverwaltung. */
export function registerEntryTypeIpcHandlers(): void {
  ipcMain.handle(ENTRY_TYPE_IPC_CHANNELS.list, () => listEntryTypes());

  ipcMain.handle(ENTRY_TYPE_IPC_CHANNELS.create, (_event, input: unknown) =>
    createEntryType(input),
  );

  ipcMain.handle(
    ENTRY_TYPE_IPC_CHANNELS.update,
    (_event, id: unknown, input: unknown) => updateEntryType(id, input),
  );

  ipcMain.handle(ENTRY_TYPE_IPC_CHANNELS.remove, (_event, id: unknown) =>
    deleteEntryType(id),
  );
}
