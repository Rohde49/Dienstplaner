import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { JsonFileStore } from '../../../src/main/storage/jsonFileStore';

const testSchema = z.object({ value: z.number().int() }).strict();
const temporaryDirectories: string[] = [];

async function createTestDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'dienstplaner-store-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('JsonFileStore mit echten temporären Dateien', () => {
  it('unterscheidet eine fehlende optionale Datei von gespeicherten Daten', async () => {
    const directory = await createTestDirectory();
    const store = new JsonFileStore({
      fileName: path.join('plans', 'plan.json'),
      schema: testSchema,
      dataDirectoryPath: directory,
    });

    await expect(store.readWithSource()).resolves.toEqual({
      status: 'missing',
    });
  });

  it('legt Unterordner an und liest den geschriebenen Wert vollständig zurück', async () => {
    const directory = await createTestDirectory();
    const store = new JsonFileStore({
      fileName: path.join('plans', 'plan.json'),
      schema: testSchema,
      dataDirectoryPath: directory,
    });

    await store.write({ value: 1 });

    await expect(store.readWithSource()).resolves.toEqual({
      status: 'found',
      data: { value: 1 },
      source: 'primary',
    });
    await expect(
      readFile(path.join(directory, 'plans', 'plan.json'), 'utf8'),
    ).resolves.toContain('"value": 1');
  });

  it('erhält die letzte gültige Fassung als Sicherung', async () => {
    const directory = await createTestDirectory();
    const filePath = path.join(directory, 'plans', 'plan.json');
    const store = new JsonFileStore({
      fileName: path.join('plans', 'plan.json'),
      schema: testSchema,
      dataDirectoryPath: directory,
    });

    await store.write({ value: 1 });
    await store.write({ value: 2 });
    await rm(filePath);

    await expect(store.readWithSource()).resolves.toEqual({
      status: 'found',
      data: { value: 1 },
      source: 'backup',
    });
  });

  it('verwendet eine gültige Sicherung bei beschädigter Hauptdatei', async () => {
    const directory = await createTestDirectory();
    const filePath = path.join(directory, 'plans', 'plan.json');
    const store = new JsonFileStore({
      fileName: path.join('plans', 'plan.json'),
      schema: testSchema,
      dataDirectoryPath: directory,
    });

    await store.write({ value: 1 });
    await store.write({ value: 2 });
    await writeFile(filePath, '{ beschädigt', 'utf8');

    await expect(store.readWithSource()).resolves.toMatchObject({
      status: 'found',
      data: { value: 1 },
      source: 'backup',
    });
  });

  it('blockiert, wenn Haupt- und Sicherungsdatei ungültig sind', async () => {
    const directory = await createTestDirectory();
    const filePath = path.join(directory, 'plans', 'plan.json');
    const store = new JsonFileStore({
      fileName: path.join('plans', 'plan.json'),
      schema: testSchema,
      dataDirectoryPath: directory,
    });

    await store.write({ value: 1 });
    await writeFile(filePath, '{}', 'utf8');
    await writeFile(`${filePath}.backup`, '{}', 'utf8');

    await expect(store.readWithSource()).rejects.toThrow(
      'konnte nicht gelesen werden',
    );
  });

  it('überschreibt beschädigte Haupt- und Sicherungsdaten nicht', async () => {
    const directory = await createTestDirectory();
    const filePath = path.join(directory, 'plans', 'plan.json');
    const backupPath = `${filePath}.backup`;
    const store = new JsonFileStore({
      fileName: path.join('plans', 'plan.json'),
      schema: testSchema,
      dataDirectoryPath: directory,
    });
    await store.write({ value: 1 });
    await writeFile(filePath, '{ beschädigte Hauptdatei', 'utf8');
    await writeFile(backupPath, '{ beschädigte Sicherung', 'utf8');

    await expect(store.write({ value: 2 })).rejects.toThrow(
      'kann nicht sicher überschrieben werden',
    );
    await expect(readFile(filePath, 'utf8')).resolves.toBe(
      '{ beschädigte Hauptdatei',
    );
    await expect(readFile(backupPath, 'utf8')).resolves.toBe(
      '{ beschädigte Sicherung',
    );
  });
});
