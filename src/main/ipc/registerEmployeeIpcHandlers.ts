import { ipcMain } from 'electron';

import { EMPLOYEE_IPC_CHANNELS } from '../../shared/ipc';
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from '../storage/employeesRepository';

export function registerEmployeeIpcHandlers(): void {
  ipcMain.handle(EMPLOYEE_IPC_CHANNELS.list, () => listEmployees());

  ipcMain.handle(EMPLOYEE_IPC_CHANNELS.create, (_event, input: unknown) =>
    createEmployee(input),
  );

  ipcMain.handle(
    EMPLOYEE_IPC_CHANNELS.update,
    (_event, id: unknown, input: unknown) => updateEmployee(id, input),
  );

  ipcMain.handle(EMPLOYEE_IPC_CHANNELS.remove, (_event, id: unknown) =>
    deleteEmployee(id),
  );
}
