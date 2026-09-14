import { ipcMain } from 'electron';

import { MONTHLY_PLAN_IPC_CHANNELS } from '../../shared/ipc';
import {
  createMonthlyPlan,
  getMonthlyPlan,
  listMonthlyPlans,
  removeMonthlyPlan,
  saveMonthlyPlan,
} from '../storage/monthlyPlansRepository';

/** Registriert alle Anfragen der Oberfläche zu gespeicherten Monatsplänen. */
export function registerMonthlyPlanIpcHandlers(): void {
  ipcMain.handle(MONTHLY_PLAN_IPC_CHANNELS.list, () => listMonthlyPlans());

  ipcMain.handle(MONTHLY_PLAN_IPC_CHANNELS.get, (_event, id: unknown) =>
    getMonthlyPlan(id),
  );

  ipcMain.handle(MONTHLY_PLAN_IPC_CHANNELS.create, (_event, input: unknown) =>
    createMonthlyPlan(input),
  );

  ipcMain.handle(MONTHLY_PLAN_IPC_CHANNELS.save, (_event, plan: unknown) =>
    saveMonthlyPlan(plan),
  );

  ipcMain.handle(MONTHLY_PLAN_IPC_CHANNELS.remove, (_event, id: unknown) =>
    removeMonthlyPlan(id),
  );
}
