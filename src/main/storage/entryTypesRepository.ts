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

const entryTypeStore = new JsonFileStore<EntryTypesFile>({
  fileName: 'entry-types.json',
  schema: entryTypesFileSchema,
  createDefault: () => ({
    schemaVersion: 3,
    updatedAt: new Date().toISOString(),
    entryTypes: [],
  }),
});

let accessQueue: Promise<void> = Promise.resolve();

/** Führt Änderungen nacheinander aus, damit sie sich nicht überschreiben. */
function runAccess<T>(operation: () => Promise<T>): Promise<T> {
  const result = accessQueue.then(operation);

  accessQueue = result.then(
    (): void => undefined,
    (): void => undefined,
  );

  return result;
}

/** Lädt alle gespeicherten Eintragsarten. */
export async function listEntryTypes(): Promise<EntryType[]> {
  return runAccess(async () => {
    const file = await entryTypeStore.read();
    return file.entryTypes;
  });
}

/** Prüft die Eingaben und speichert eine neue Eintragsart. */
export function createEntryType(input: unknown): Promise<EntryType> {
  return runAccess(async () => {
    const validatedInput = entryTypeInputSchema.parse(input);
    const file = await entryTypeStore.read();
    const timestamp = new Date().toISOString();

    const entryType: EntryType = {
      ...validatedInput,
      id: randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await entryTypeStore.write({
      ...file,
      updatedAt: timestamp,
      entryTypes: [...file.entryTypes, entryType],
    });

    return entryType;
  });
}

/** Prüft und aktualisiert eine vorhandene Eintragsart. */
export function updateEntryType(
  id: unknown,
  input: unknown,
): Promise<EntryType> {
  return runAccess(async () => {
    const validatedId = entryTypeIdSchema.parse(id);
    const validatedInput = entryTypeInputSchema.parse(input);
    const file = await entryTypeStore.read();
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

    await entryTypeStore.write({
      ...file,
      updatedAt: timestamp,
      entryTypes,
    });

    return updatedEntryType;
  });
}

/** Speichert die vollständige Reihenfolge aller vorhandenen Eintragsarten. */
export function reorderEntryTypes(orderedIds: unknown): Promise<EntryType[]> {
  return runAccess(async () => {
    const validatedIds = entryTypeOrderSchema.parse(orderedIds);
    const file = await entryTypeStore.read();

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

    await entryTypeStore.write({
      ...file,
      updatedAt: timestamp,
      entryTypes,
    });

    return entryTypes;
  });
}

/** Entfernt eine Eintragsart dauerhaft aus der Datendatei. */
export function deleteEntryType(id: unknown): Promise<void> {
  return runAccess(async () => {
    const validatedId = entryTypeIdSchema.parse(id);
    const file = await entryTypeStore.read();
    const entryTypes = file.entryTypes.filter(
      (entryType) => entryType.id !== validatedId,
    );

    if (entryTypes.length === file.entryTypes.length) {
      throw new Error('Der Planungseintrag wurde nicht gefunden.');
    }

    await entryTypeStore.write({
      ...file,
      updatedAt: new Date().toISOString(),
      entryTypes,
    });
  });
}
