/** Enthält die eindeutigen Kanalnamen für Anfragen zur Mitarbeiterverwaltung. */
export const EMPLOYEE_IPC_CHANNELS = {
  list: 'employees:list',
  create: 'employees:create',
  update: 'employees:update',
  remove: 'employees:remove',
} as const;
