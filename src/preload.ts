import { contextBridge, ipcRenderer } from 'electron';

import {
  APP_IPC_CHANNELS,
  EMPLOYEE_IPC_CHANNELS,
  ENTRY_TYPE_IPC_CHANNELS,
  MONTHLY_PLAN_IPC_CHANNELS,
  PDF_EXPORT_IPC_CHANNELS,
  type DienstplanerApi,
} from './shared/ipc';

/** Stellt der Oberfläche nur die freigegebenen Mitarbeiterfunktionen bereit. */
const dienstplanerApi: DienstplanerApi = {
  app: {
    onCloseRequested: (listener) => {
      const wrappedListener = (): void => listener();
      ipcRenderer.on(APP_IPC_CHANNELS.closeRequested, wrappedListener);

      return () =>
        ipcRenderer.removeListener(
          APP_IPC_CHANNELS.closeRequested,
          wrappedListener,
        );
    },
    confirmClose: () => ipcRenderer.send(APP_IPC_CHANNELS.confirmClose),
  },
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
  monthlyPlans: {
    list: () => ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.list),
    get: (id) => ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.get, id),
    create: (input) =>
      ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.create, input),
    save: (plan) => ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.save, plan),
    remove: (id) => ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.remove, id),
  },
  pdfExport: {
    export: (request) =>
      ipcRenderer.invoke(PDF_EXPORT_IPC_CHANNELS.export, request),
  },
};

contextBridge.exposeInMainWorld('dienstplaner', dienstplanerApi);
