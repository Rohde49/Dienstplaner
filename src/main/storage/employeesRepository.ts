import { randomUUID } from 'node:crypto';

import {
  employeeIdSchema,
  employeeInputSchema,
  employeesFileSchema,
  type Employee,
  type EmployeesFile,
} from '../../shared/schemas';
import { JsonFileStore } from './jsonFileStore';

const employeeStore = new JsonFileStore<EmployeesFile>({
  fileName: 'employees.json',
  schema: employeesFileSchema,
  createDefault: () => ({
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    employees: [],
  }),
});

let mutationQueue: Promise<void> = Promise.resolve();

function runMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(operation);

  mutationQueue = result.then(
    (): void => undefined,
    (): void => undefined,
  );

  return result;
}

export async function listEmployees(): Promise<Employee[]> {
  const file = await employeeStore.read();
  return file.employees;
}

export function createEmployee(input: unknown): Promise<Employee> {
  return runMutation(async () => {
    const validatedInput = employeeInputSchema.parse(input);
    const file = await employeeStore.read();
    const timestamp = new Date().toISOString();

    const employee: Employee = {
      ...validatedInput,
      id: randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await employeeStore.write({
      ...file,
      updatedAt: timestamp,
      employees: [...file.employees, employee],
    });

    return employee;
  });
}

export function updateEmployee(id: unknown, input: unknown): Promise<Employee> {
  return runMutation(async () => {
    const validatedId = employeeIdSchema.parse(id);
    const validatedInput = employeeInputSchema.parse(input);
    const file = await employeeStore.read();

    const employeeIndex = file.employees.findIndex(
      (employee) => employee.id === validatedId,
    );

    if (employeeIndex === -1) {
      throw new Error('Der Mitarbeiter wurde nicht gefunden.');
    }

    const timestamp = new Date().toISOString();
    const existingEmployee = file.employees[employeeIndex];

    const updatedEmployee: Employee = {
      ...existingEmployee,
      ...validatedInput,
      id: validatedId,
      updatedAt: timestamp,
    };

    const employees = [...file.employees];
    employees[employeeIndex] = updatedEmployee;

    await employeeStore.write({
      ...file,
      updatedAt: timestamp,
      employees,
    });

    return updatedEmployee;
  });
}

export function deleteEmployee(id: unknown): Promise<void> {
  return runMutation(async () => {
    const validatedId = employeeIdSchema.parse(id);
    const file = await employeeStore.read();

    const employees = file.employees.filter(
      (employee) => employee.id !== validatedId,
    );

    if (employees.length === file.employees.length) {
      throw new Error('Der Mitarbeiter wurde nicht gefunden.');
    }

    await employeeStore.write({
      ...file,
      updatedAt: new Date().toISOString(),
      employees,
    });
  });
}
