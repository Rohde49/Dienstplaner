/** Enthält die eindeutigen Kanalnamen für Anfragen zur Mitarbeiterverwaltung. */
export const EMPLOYEE_IPC_CHANNELS = {
  list: 'employees:list',
  create: 'employees:create',
  update: 'employees:update',
  remove: 'employees:remove',
} as const;

/** Enthält die eindeutigen Kanäle für die Eintragsartenverwaltung. */
export const ENTRY_TYPE_IPC_CHANNELS = {
  list: 'entry-types:list',
  create: 'entry-types:create',
  update: 'entry-types:update',
  remove: 'entry-types:remove',
} as const;
