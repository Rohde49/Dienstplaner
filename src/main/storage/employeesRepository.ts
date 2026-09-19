import { randomUUID } from 'node:crypto';

import {
  employeeIdSchema,
  employeeInputSchema,
  employeeOrderSchema,
  employeesFileSchema,
  type Employee,
  type EmployeesFile,
} from '../../shared/schemas';
import { JsonFileStore } from './jsonFileStore';

const employeeStore = new JsonFileStore<EmployeesFile>({
  fileName: 'employees.json',
  schema: employeesFileSchema,
  createDefault: () => ({
    schemaVersion: 3,
    updatedAt: new Date().toISOString(),
    employees: [],
  }),
});

let accessQueue: Promise<void> = Promise.resolve();

/**
 * Führt Schreibvorgänge nacheinander aus.
 * Dadurch überschreiben sich gleichzeitige Änderungen nicht gegenseitig.
 */
function runAccess<T>(operation: () => Promise<T>): Promise<T> {
  const result = accessQueue.then(operation);

  accessQueue = result.then(
    (): void => undefined,
    (): void => undefined,
  );

  return result;
}

/** Lädt alle gespeicherten Mitarbeiter. */
export async function listEmployees(): Promise<Employee[]> {
  return runAccess(async () => {
    const file = await employeeStore.read();
    return file.employees;
  });
}

/** Prüft die Eingaben und speichert einen neuen Mitarbeiter. */
export function createEmployee(input: unknown): Promise<Employee> {
  return runAccess(async () => {
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

/** Prüft und aktualisiert einen vorhandenen Mitarbeiter. */
export function updateEmployee(id: unknown, input: unknown): Promise<Employee> {
  return runAccess(async () => {
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

/** Speichert die vollständige Reihenfolge aller vorhandenen Mitarbeiter. */
export function reorderEmployees(orderedIds: unknown): Promise<Employee[]> {
  return runAccess(async () => {
    const validatedIds = employeeOrderSchema.parse(orderedIds);
    const file = await employeeStore.read();

    if (validatedIds.length !== file.employees.length) {
      throw new Error(
        'Die Reihenfolge muss alle Mitarbeiter genau einmal enthalten.',
      );
    }

    const employeesById = new Map(
      file.employees.map((employee) => [employee.id, employee]),
    );
    const employees = validatedIds.map((id) => {
      const employee = employeesById.get(id);

      if (employee === undefined) {
        throw new Error(
          'Die Reihenfolge enthält einen unbekannten Mitarbeiter.',
        );
      }

      return employee;
    });

    const timestamp = new Date().toISOString();

    await employeeStore.write({
      ...file,
      updatedAt: timestamp,
      employees,
    });

    return employees;
  });
}

/** Entfernt einen Mitarbeiter dauerhaft aus der Datendatei. */
export function deleteEmployee(id: unknown): Promise<void> {
  return runAccess(async () => {
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
