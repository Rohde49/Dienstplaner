import type { Employee, EmployeeInput } from '../schemas';

/** Beschreibt die verfügbaren Funktionen der Mitarbeiterverwaltung. */
export type EmployeesApi = {
  list: () => Promise<Employee[]>;
  create: (input: EmployeeInput) => Promise<Employee>;
  update: (id: string, input: EmployeeInput) => Promise<Employee>;
  remove: (id: string) => Promise<void>;
};

/** Beschreibt alle Funktionen, die der Oberfläche bereitgestellt werden. */
export type DienstplanerApi = {
  employees: EmployeesApi;
};
