import type {
  Employee,
  EmployeeInput,
  EntryType,
  EntryTypeInput,
} from '../schemas';

/** Beschreibt die verfügbaren Funktionen der Mitarbeiterverwaltung. */
export type EmployeesApi = {
  list: () => Promise<Employee[]>;
  create: (input: EmployeeInput) => Promise<Employee>;
  update: (id: string, input: EmployeeInput) => Promise<Employee>;
  remove: (id: string) => Promise<void>;
};

/** Beschreibt die verfügbaren Funktionen der Eintragsartenverwaltung. */
export type EntryTypesApi = {
  list: () => Promise<EntryType[]>;
  create: (input: EntryTypeInput) => Promise<EntryType>;
  update: (id: string, input: EntryTypeInput) => Promise<EntryType>;
  remove: (id: string) => Promise<void>;
};

/** Beschreibt alle Funktionen, die der Oberfläche bereitgestellt werden. */
export type DienstplanerApi = {
  employees: EmployeesApi;
  entryTypes: EntryTypesApi;
};
