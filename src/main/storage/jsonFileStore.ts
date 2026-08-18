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
  createDefault: () => T;
};

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

export class JsonFileStore<T> {
  private readonly fileName: string;
  private readonly schema: ZodType<T>;
  private readonly createDefault: () => T;

  constructor({ fileName, schema, createDefault }: JsonFileStoreOptions<T>) {
    this.fileName = fileName;
    this.schema = schema;
    this.createDefault = createDefault;
  }

  private get directoryPath(): string {
    return path.join(app.getPath('userData'), DATA_DIRECTORY_NAME);
  }

  private get filePath(): string {
    return path.join(this.directoryPath, this.fileName);
  }

  private get backupPath(): string {
    return `${this.filePath}.backup`;
  }

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

  async read(): Promise<T> {
    await mkdir(this.directoryPath, { recursive: true });

    const primaryResult = await this.readCandidate(this.filePath);

    if (primaryResult.status === 'valid') {
      return primaryResult.data;
    }

    const backupResult = await this.readCandidate(this.backupPath);

    if (backupResult.status === 'valid') {
      return backupResult.data;
    }

    if (
      primaryResult.status === 'missing' &&
      backupResult.status === 'missing'
    ) {
      return this.createDefault();
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

  async write(value: T): Promise<void> {
    const validatedValue = this.schema.parse(value);

    await mkdir(this.directoryPath, { recursive: true });

    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    const serializedValue = `${JSON.stringify(validatedValue, null, 2)}\n`;

    try {
      await writeFile(temporaryPath, serializedValue, 'utf8');

      const currentFile = await this.readCandidate(this.filePath);

      if (currentFile.status === 'valid') {
        await copyFile(this.filePath, this.backupPath);
      }

      await rm(this.filePath, { force: true });
      await rename(temporaryPath, this.filePath);
    } finally {
      await rm(temporaryPath, { force: true });
    }
  }
}
