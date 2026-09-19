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

type EmployeesRepositoryOptions = {
  dataDirectoryPath?: string;
};

/** Verwaltet Mitarbeiter in einer validierten und gesicherten JSON-Datei. */
export class EmployeesRepository {
  private readonly store: JsonFileStore<EmployeesFile>;
  private accessQueue: Promise<void> = Promise.resolve();

  constructor({ dataDirectoryPath }: EmployeesRepositoryOptions = {}) {
    this.store = new JsonFileStore<EmployeesFile>({
      fileName: 'employees.json',
      schema: employeesFileSchema,
      createDefault: () => ({
        schemaVersion: 3,
        updatedAt: new Date().toISOString(),
        employees: [],
      }),
      dataDirectoryPath,
    });
  }

  /** Führt Zugriffe nacheinander aus, damit sie sich nicht überschreiben. */
  private runAccess<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.accessQueue.then(operation);

    this.accessQueue = result.then(
      (): void => undefined,
      (): void => undefined,
    );

    return result;
  }

  /** Lädt alle gespeicherten Mitarbeiter. */
  list(): Promise<Employee[]> {
    return this.runAccess(async () => {
      const file = await this.store.read();
      return file.employees;
    });
  }

  /** Prüft die Eingaben und speichert einen neuen Mitarbeiter. */
  create(input: unknown): Promise<Employee> {
    return this.runAccess(async () => {
      const validatedInput = employeeInputSchema.parse(input);
      const file = await this.store.read();
      const timestamp = new Date().toISOString();

      const employee: Employee = {
        ...validatedInput,
        id: randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await this.store.write({
        ...file,
        updatedAt: timestamp,
        employees: [...file.employees, employee],
      });

      return employee;
    });
  }

  /** Prüft und aktualisiert einen vorhandenen Mitarbeiter. */
  update(id: unknown, input: unknown): Promise<Employee> {
    return this.runAccess(async () => {
      const validatedId = employeeIdSchema.parse(id);
      const validatedInput = employeeInputSchema.parse(input);
      const file = await this.store.read();

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

      await this.store.write({
        ...file,
        updatedAt: timestamp,
        employees,
      });

      return updatedEmployee;
    });
  }

  /** Speichert die vollständige Reihenfolge aller vorhandenen Mitarbeiter. */
  reorder(orderedIds: unknown): Promise<Employee[]> {
    return this.runAccess(async () => {
      const validatedIds = employeeOrderSchema.parse(orderedIds);
      const file = await this.store.read();

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

      await this.store.write({
        ...file,
        updatedAt: timestamp,
        employees,
      });

      return employees;
    });
  }

  /** Entfernt einen Mitarbeiter dauerhaft aus der Datendatei. */
  remove(id: unknown): Promise<void> {
    return this.runAccess(async () => {
      const validatedId = employeeIdSchema.parse(id);
      const file = await this.store.read();

      const employees = file.employees.filter(
        (employee) => employee.id !== validatedId,
      );

      if (employees.length === file.employees.length) {
        throw new Error('Der Mitarbeiter wurde nicht gefunden.');
      }

      await this.store.write({
        ...file,
        updatedAt: new Date().toISOString(),
        employees,
      });
    });
  }
}

const employeesRepository = new EmployeesRepository();

export const listEmployees = (): Promise<Employee[]> =>
  employeesRepository.list();

export const createEmployee = (input: unknown): Promise<Employee> =>
  employeesRepository.create(input);

export const updateEmployee = (
  id: unknown,
  input: unknown,
): Promise<Employee> => employeesRepository.update(id, input);

export const reorderEmployees = (orderedIds: unknown): Promise<Employee[]> =>
  employeesRepository.reorder(orderedIds);

export const deleteEmployee = (id: unknown): Promise<void> =>
  employeesRepository.remove(id);
