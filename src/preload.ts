import { contextBridge, ipcRenderer } from 'electron';

import {
  EMPLOYEE_IPC_CHANNELS,
  ENTRY_TYPE_IPC_CHANNELS,
  MONTHLY_PLAN_IPC_CHANNELS,
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
  monthlyPlans: {
    list: () => ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.list),
    get: (id) => ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.get, id),
    create: (input) =>
      ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.create, input),
    save: (plan) => ipcRenderer.invoke(MONTHLY_PLAN_IPC_CHANNELS.save, plan),
  },
};

contextBridge.exposeInMainWorld('dienstplaner', dienstplanerApi);
