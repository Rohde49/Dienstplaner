import { isDeepStrictEqual } from 'node:util';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

import { app } from 'electron';

import { createMonthlyPlan as createMonthlyPlanAggregate } from '../domain/monthlyPlanFactory';
import {
  monthlyPlanFileSchema,
  monthlyPlanIdSchema,
  monthlyPlanInputSchema,
  monthlyPlanSchema,
  type Employee,
  type MonthlyPlan,
  type MonthlyPlanFile,
  type MonthlyPlanLoadResult,
  type MonthlyPlanSummary,
} from '../../shared/schemas';
import { listEmployees } from './employeesRepository';
import { JsonFileStore } from './jsonFileStore';

const DATA_DIRECTORY_NAME = 'dienstplaner-data';
const BACKUP_RECOVERY_WARNING =
  'Der Monatsplan wurde aus der Sicherungsdatei geladen. Möglicherweise wird ein älterer Stand angezeigt.';

type MonthlyPlansRepositoryOptions = {
  dataDirectoryPath?: string;
  loadEmployees?: () => Promise<Employee[]>;
};

function isFileNotFound(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function nextTimestamp(previousTimestamp: string): string {
  const now = Date.now();
  const previous = Date.parse(previousTimestamp);
  return new Date(Math.max(now, previous + 1)).toISOString();
}

function immutableDayStructure(plan: MonthlyPlan) {
  return plan.days.map((day) => ({ id: day.id, date: day.date }));
}

/** Verwaltet Monatspläne in jeweils einer eigenen, validierten JSON-Datei. */
export class MonthlyPlansRepository {
  private readonly configuredDataDirectoryPath?: string;
  private readonly loadEmployees: () => Promise<Employee[]>;
  private accessQueue: Promise<void> = Promise.resolve();

  constructor({
    dataDirectoryPath,
    loadEmployees = listEmployees,
  }: MonthlyPlansRepositoryOptions = {}) {
    this.configuredDataDirectoryPath = dataDirectoryPath;
    this.loadEmployees = loadEmployees;
  }

  private get dataDirectoryPath(): string {
    return (
      this.configuredDataDirectoryPath ??
      path.join(app.getPath('userData'), DATA_DIRECTORY_NAME)
    );
  }

  private runAccess<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.accessQueue.then(operation);

    this.accessQueue = result.then(
      (): void => undefined,
      (): void => undefined,
    );

    return result;
  }

  private createStore(id: string): JsonFileStore<MonthlyPlanFile> {
    const fileSchema = monthlyPlanFileSchema.refine(
      (file) => file.plan.id === id,
      {
        path: ['plan', 'id'],
        message: 'Die Plan-ID muss mit dem Dateinamen übereinstimmen.',
      },
    );

    return new JsonFileStore({
      fileName: path.join('plans', `${id}.json`),
      schema: fileSchema,
      dataDirectoryPath: this.dataDirectoryPath,
    });
  }

  private async getWithoutQueue(id: string): Promise<MonthlyPlanLoadResult> {
    const result = await this.createStore(id).readWithSource();

    if (result.status === 'missing') {
      return { plan: null, recoveryWarning: null };
    }

    if (result.data.plan.id !== id) {
      throw new Error(
        'Die Plan-ID in der Datendatei stimmt nicht mit ihrem Dateinamen überein.',
      );
    }

    return {
      plan: result.data.plan,
      recoveryWarning:
        result.source === 'backup' ? BACKUP_RECOVERY_WARNING : null,
    };
  }

  private async listPlanIds(): Promise<string[]> {
    const plansDirectory = path.join(this.dataDirectoryPath, 'plans');
    let entries;

    try {
      entries = await readdir(plansDirectory, { withFileTypes: true });
    } catch (error) {
      if (isFileNotFound(error)) {
        return [];
      }

      throw error;
    }

    const ids = new Set<string>();

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const match = /^(.+)\.json(?:\.backup)?$/.exec(entry.name);
      const parsedId = monthlyPlanIdSchema.safeParse(match?.[1]);

      if (parsedId.success) {
        ids.add(parsedId.data);
      }
    }

    return [...ids];
  }

  /** Liefert alle gespeicherten Monatspläne als kleine Auswahlansichten. */
  list(): Promise<MonthlyPlanSummary[]> {
    return this.runAccess(async () => {
      const summaries: MonthlyPlanSummary[] = [];

      for (const id of await this.listPlanIds()) {
        const { plan } = await this.getWithoutQueue(id);

        if (plan) {
          summaries.push({
            id: plan.id,
            year: plan.year,
            month: plan.month,
            title: plan.title,
            updatedAt: plan.updatedAt,
          });
        }
      }

      return summaries.sort(
        (first, second) =>
          second.year - first.year ||
          second.month - first.month ||
          first.title.localeCompare(second.title, 'de') ||
          first.id.localeCompare(second.id),
      );
    });
  }

  /** Lädt einen Monatsplan über seine validierte Plan-ID. */
  get(id: unknown): Promise<MonthlyPlanLoadResult> {
    return this.runAccess(() =>
      this.getWithoutQueue(monthlyPlanIdSchema.parse(id)),
    );
  }

  /** Erzeugt und speichert einen neuen Monatsplan mit Mitarbeiter-Snapshots. */
  create(input: unknown): Promise<MonthlyPlan> {
    return this.runAccess(async () => {
      const validatedInput = monthlyPlanInputSchema.parse(input);
      const employees = await this.loadEmployees();
      let plan: MonthlyPlan;

      do {
        plan = createMonthlyPlanAggregate({
          ...validatedInput,
          employees,
        });
      } while ((await this.getWithoutQueue(plan.id)).plan !== null);

      await this.createStore(plan.id).write({ schemaVersion: 1, plan });
      return plan;
    });
  }

  /** Speichert erlaubte Planänderungen und schützt unveränderliche Snapshots. */
  save(input: unknown): Promise<MonthlyPlan> {
    return this.runAccess(async () => {
      const submittedPlan = monthlyPlanSchema.parse(input);
      const { plan: storedPlan } = await this.getWithoutQueue(submittedPlan.id);

      if (!storedPlan) {
        throw new Error('Der Monatsplan wurde nicht gefunden.');
      }

      const immutableValuesMatch =
        submittedPlan.id === storedPlan.id &&
        submittedPlan.year === storedPlan.year &&
        submittedPlan.month === storedPlan.month &&
        submittedPlan.createdAt === storedPlan.createdAt &&
        isDeepStrictEqual(submittedPlan.employees, storedPlan.employees) &&
        isDeepStrictEqual(
          immutableDayStructure(submittedPlan),
          immutableDayStructure(storedPlan),
        );

      if (!immutableValuesMatch) {
        throw new Error(
          'Unveränderliche Grunddaten oder Snapshots des Monatsplans wurden verändert.',
        );
      }

      const savedPlan = monthlyPlanSchema.parse({
        ...submittedPlan,
        updatedAt: nextTimestamp(storedPlan.updatedAt),
      });

      await this.createStore(savedPlan.id).write({
        schemaVersion: 1,
        plan: savedPlan,
      });

      return savedPlan;
    });
  }
}

const monthlyPlansRepository = new MonthlyPlansRepository();

export const listMonthlyPlans = (): Promise<MonthlyPlanSummary[]> =>
  monthlyPlansRepository.list();

export const getMonthlyPlan = (id: unknown): Promise<MonthlyPlanLoadResult> =>
  monthlyPlansRepository.get(id);

export const createMonthlyPlan = (input: unknown): Promise<MonthlyPlan> =>
  monthlyPlansRepository.create(input);

export const saveMonthlyPlan = (plan: unknown): Promise<MonthlyPlan> =>
  monthlyPlansRepository.save(plan);
