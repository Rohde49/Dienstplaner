import { contextBridge, ipcRenderer } from 'electron';

import {
  EMPLOYEE_IPC_CHANNELS,
  ENTRY_TYPE_IPC_CHANNELS,
  type DienstplanerApi,
} from './shared/ipc';

/** Stellt der Oberfläche nur die freigegebenen Mitarbeiterfunktionen bereit. */
const dienstplanerApi: DienstplanerApi = {
  employees: {
    list: () => ipcRenderer.invoke(EMPLOYEE_IPC_CHANNELS.list),
    create: (input) => ipcRenderer.invoke(EMPLOYEE_IPC_CHANNELS.create, input),
    update: (id, input) =>
      ipcRenderer.invoke(EMPLOYEE_IPC_CHANNELS.update, id, input),
    remove: (id) => ipcRenderer.invoke(EMPLOYEE_IPC_CHANNELS.remove, id),
  },
  entryTypes: {
    list: () => ipcRenderer.invoke(ENTRY_TYPE_IPC_CHANNELS.list),
    create: (input) =>
      ipcRenderer.invoke(ENTRY_TYPE_IPC_CHANNELS.create, input),
    update: (id, input) =>
      ipcRenderer.invoke(ENTRY_TYPE_IPC_CHANNELS.update, id, input),
    remove: (id) => ipcRenderer.invoke(ENTRY_TYPE_IPC_CHANNELS.remove, id),
  },
};

contextBridge.exposeInMainWorld('dienstplaner', dienstplanerApi);
