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

/** Enthält die eindeutigen Kanäle für gespeicherte Monatspläne. */
export const MONTHLY_PLAN_IPC_CHANNELS = {
  list: 'monthly-plans:list',
  get: 'monthly-plans:get',
  create: 'monthly-plans:create',
  save: 'monthly-plans:save',
  remove: 'monthly-plans:remove',
} as const;

/** Enthält die Kanäle für den geschützten Abschluss des Hauptfensters. */
export const APP_IPC_CHANNELS = {
  closeRequested: 'app:close-requested',
  confirmClose: 'app:confirm-close',
} as const;
