import { randomUUID } from 'node:crypto';

import {
  entryTypeIdSchema,
  entryTypeInputSchema,
  entryTypeOrderSchema,
  entryTypesFileSchema,
  type EntryType,
  type EntryTypesFile,
} from '../../shared/schemas';
import { JsonFileStore } from './jsonFileStore';

type EntryTypesRepositoryOptions = {
  dataDirectoryPath?: string;
};

/** Verwaltet Eintragsarten in einer validierten und gesicherten JSON-Datei. */
export class EntryTypesRepository {
  private readonly store: JsonFileStore<EntryTypesFile>;
  private accessQueue: Promise<void> = Promise.resolve();

  constructor({ dataDirectoryPath }: EntryTypesRepositoryOptions = {}) {
    this.store = new JsonFileStore<EntryTypesFile>({
      fileName: 'entry-types.json',
      schema: entryTypesFileSchema,
      createDefault: () => ({
        schemaVersion: 3,
        updatedAt: new Date().toISOString(),
        entryTypes: [],
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

  /** Lädt alle gespeicherten Eintragsarten. */
  list(): Promise<EntryType[]> {
    return this.runAccess(async () => {
      const file = await this.store.read();
      return file.entryTypes;
    });
  }

  /** Prüft die Eingaben und speichert eine neue Eintragsart. */
  create(input: unknown): Promise<EntryType> {
    return this.runAccess(async () => {
      const validatedInput = entryTypeInputSchema.parse(input);
      const file = await this.store.read();
      const timestamp = new Date().toISOString();

      const entryType: EntryType = {
        ...validatedInput,
        id: randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await this.store.write({
        ...file,
        updatedAt: timestamp,
        entryTypes: [...file.entryTypes, entryType],
      });

      return entryType;
    });
  }

  /** Prüft und aktualisiert eine vorhandene Eintragsart. */
  update(id: unknown, input: unknown): Promise<EntryType> {
    return this.runAccess(async () => {
      const validatedId = entryTypeIdSchema.parse(id);
      const validatedInput = entryTypeInputSchema.parse(input);
      const file = await this.store.read();
      const entryTypeIndex = file.entryTypes.findIndex(
        (entryType) => entryType.id === validatedId,
      );

      if (entryTypeIndex === -1) {
        throw new Error('Der Planungseintrag wurde nicht gefunden.');
      }

      const timestamp = new Date().toISOString();
      const existingEntryType = file.entryTypes[entryTypeIndex];
      const updatedEntryType: EntryType = {
        ...existingEntryType,
        ...validatedInput,
        id: validatedId,
        updatedAt: timestamp,
      };
      const entryTypes = [...file.entryTypes];
      entryTypes[entryTypeIndex] = updatedEntryType;

      await this.store.write({
        ...file,
        updatedAt: timestamp,
        entryTypes,
      });

      return updatedEntryType;
    });
  }

  /** Speichert die vollständige Reihenfolge aller vorhandenen Eintragsarten. */
  reorder(orderedIds: unknown): Promise<EntryType[]> {
    return this.runAccess(async () => {
      const validatedIds = entryTypeOrderSchema.parse(orderedIds);
      const file = await this.store.read();

      if (validatedIds.length !== file.entryTypes.length) {
        throw new Error(
          'Die Reihenfolge muss alle Planungseinträge genau einmal enthalten.',
        );
      }

      const entryTypesById = new Map(
        file.entryTypes.map((entryType) => [entryType.id, entryType]),
      );
      const entryTypes = validatedIds.map((id) => {
        const entryType = entryTypesById.get(id);

        if (entryType === undefined) {
          throw new Error(
            'Die Reihenfolge enthält einen unbekannten Planungseintrag.',
          );
        }

        return entryType;
      });

      const timestamp = new Date().toISOString();

      await this.store.write({
        ...file,
        updatedAt: timestamp,
        entryTypes,
      });

      return entryTypes;
    });
  }

  /** Entfernt eine Eintragsart dauerhaft aus der Datendatei. */
  remove(id: unknown): Promise<void> {
    return this.runAccess(async () => {
      const validatedId = entryTypeIdSchema.parse(id);
      const file = await this.store.read();
      const entryTypes = file.entryTypes.filter(
        (entryType) => entryType.id !== validatedId,
      );

      if (entryTypes.length === file.entryTypes.length) {
        throw new Error('Der Planungseintrag wurde nicht gefunden.');
      }

      await this.store.write({
        ...file,
        updatedAt: new Date().toISOString(),
        entryTypes,
      });
    });
  }
}

const entryTypesRepository = new EntryTypesRepository();

export const listEntryTypes = (): Promise<EntryType[]> =>
  entryTypesRepository.list();

export const createEntryType = (input: unknown): Promise<EntryType> =>
  entryTypesRepository.create(input);

export const updateEntryType = (
  id: unknown,
  input: unknown,
): Promise<EntryType> => entryTypesRepository.update(id, input);

export const reorderEntryTypes = (orderedIds: unknown): Promise<EntryType[]> =>
  entryTypesRepository.reorder(orderedIds);

export const deleteEntryType = (id: unknown): Promise<void> =>
  entryTypesRepository.remove(id);
