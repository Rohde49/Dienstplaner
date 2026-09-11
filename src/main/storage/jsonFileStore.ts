import { randomUUID } from 'node:crypto';
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { app } from 'electron';
import type { ZodType } from 'zod';

const DATA_DIRECTORY_NAME = 'dienstplaner-data';

type JsonFileStoreOptions<T> = {
  fileName: string;
  schema: ZodType<T>;
  createDefault?: () => T;
  dataDirectoryPath?: string;
};

export type JsonFileReadResult<T> =
  | { status: 'found'; data: T; source: 'primary' | 'backup' }
  | { status: 'missing' };

type ReadResult<T> =
  | { status: 'valid'; data: T }
  | { status: 'missing' }
  | { status: 'invalid'; error: unknown };

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}

function isFileNotFound(error: unknown): boolean {
  return isNodeError(error) && error.code === 'ENOENT';
}

/** Speichert geprüfte JSON-Daten und verwaltet eine Sicherungsdatei. */
export class JsonFileStore<T> {
  private readonly fileName: string;
  private readonly schema: ZodType<T>;
  private readonly createDefault?: () => T;
  private readonly configuredDataDirectoryPath?: string;

  constructor({
    fileName,
    schema,
    createDefault,
    dataDirectoryPath,
  }: JsonFileStoreOptions<T>) {
    this.fileName = fileName;
    this.schema = schema;
    this.createDefault = createDefault;
    this.configuredDataDirectoryPath = dataDirectoryPath;
  }

  private get directoryPath(): string {
    return (
      this.configuredDataDirectoryPath ??
      path.join(app.getPath('userData'), DATA_DIRECTORY_NAME)
    );
  }

  private get filePath(): string {
    return path.join(this.directoryPath, this.fileName);
  }

  private get backupPath(): string {
    return `${this.filePath}.backup`;
  }

  /**
   * Liest und prüft eine einzelne JSON-Datei.
   * Das Ergebnis unterscheidet gültige, fehlende und fehlerhafte Daten.
   */
  private async readCandidate(filePath: string): Promise<ReadResult<T>> {
    try {
      const content = await readFile(filePath, 'utf8');
      const parsedData: unknown = JSON.parse(content);
      const validationResult = this.schema.safeParse(parsedData);

      if (!validationResult.success) {
        return {
          status: 'invalid',
          error: validationResult.error,
        };
      }

      return {
        status: 'valid',
        data: validationResult.data,
      };
    } catch (error) {
      if (isFileNotFound(error)) {
        return { status: 'missing' };
      }

      return {
        status: 'invalid',
        error,
      };
    }
  }

  /**
   * Liest die gespeicherten Daten.
   * Falls die Hauptdatei beschädigt ist, wird die Sicherung verwendet.
   */
  async readWithSource(): Promise<JsonFileReadResult<T>> {
    await mkdir(path.dirname(this.filePath), { recursive: true });

    const primaryResult = await this.readCandidate(this.filePath);

    if (primaryResult.status === 'valid') {
      return {
        status: 'found',
        data: primaryResult.data,
        source: 'primary',
      };
    }

    const backupResult = await this.readCandidate(this.backupPath);

    if (backupResult.status === 'valid') {
      return {
        status: 'found',
        data: backupResult.data,
        source: 'backup',
      };
    }

    if (
      primaryResult.status === 'missing' &&
      backupResult.status === 'missing'
    ) {
      return { status: 'missing' };
    }

    const cause =
      primaryResult.status === 'invalid'
        ? primaryResult.error
        : backupResult.status === 'invalid'
          ? backupResult.error
          : undefined;

    throw new Error(
      `Die Datendatei "${this.fileName}" konnte nicht gelesen werden.`,
      { cause },
    );
  }

  /** Liest Daten mit dem bereichsspezifischen Standardwert als Fallback. */
  async read(): Promise<T> {
    const result = await this.readWithSource();

    if (result.status === 'found') {
      return result.data;
    }

    if (this.createDefault) {
      return this.createDefault();
    }

    throw new Error(`Die Datendatei "${this.fileName}" ist nicht vorhanden.`);
  }

  /**
   * Prüft und speichert die Daten über eine temporäre Datei.
   * Die bisherige gültige Datei wird vorher gesichert.
   */
  async write(value: T): Promise<void> {
    const validatedValue = this.schema.parse(value);

    await mkdir(path.dirname(this.filePath), { recursive: true });

    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    const serializedValue = `${JSON.stringify(validatedValue, null, 2)}\n`;

    try {
      await writeFile(temporaryPath, serializedValue, 'utf8');

      const currentFile = await this.readCandidate(this.filePath);
      const currentBackup = await this.readCandidate(this.backupPath);

      if (currentFile.status === 'valid') {
        await copyFile(this.filePath, this.backupPath);
      } else if (
        currentBackup.status !== 'valid' &&
        (currentFile.status === 'invalid' || currentBackup.status === 'invalid')
      ) {
        throw new Error(
          `Die Datendatei "${this.fileName}" ist beschädigt und kann nicht sicher überschrieben werden.`,
        );
      }

      if (currentFile.status !== 'missing') {
        await rm(this.filePath, { force: true });
      }
      await rename(temporaryPath, this.filePath);
    } finally {
      await rm(temporaryPath, { force: true });
    }
  }
}
