import type { Employee, EmployeeInput } from '../schemas';

export type EmployeesApi = {
  list: () => Promise<Employee[]>;
  create: (input: EmployeeInput) => Promise<Employee>;
  update: (id: string, input: EmployeeInput) => Promise<Employee>;
  remove: (id: string) => Promise<void>;
};

export type DienstplanerApi = {
  employees: EmployeesApi;
};
