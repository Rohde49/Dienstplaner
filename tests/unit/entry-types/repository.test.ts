import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { EntryTypesRepository } from '../../../src/main/storage/entryTypesRepository';
import type { EntryTypeInput } from '../../../src/shared/schemas';

const temporaryDirectories: string[] = [];

function entryTypeInput(
  code: string,
  overrides: Partial<EntryTypeInput> = {},
): EntryTypeInput {
  return {
    code,
    name: `Eintragsart ${code}`,
    calculationType: 'fixed',
    startTime: '08:00',
    endTime: '16:30',
    timeValues: {
      attendanceMinutes: 510,
      pauseMinutes: 30,
      workingMinutes: 480,
      workingWithoutNightReadinessMinutes: 480,
      nightReadinessMinutes: 0,
      nightWorkMinutes: 0,
    },
    active: true,
    ...overrides,
  };
}

async function createTestRepository(): Promise<{
  directory: string;
  repository: EntryTypesRepository;
}> {
  const directory = await mkdtemp(
    path.join(tmpdir(), 'dienstplaner-entry-types-'),
  );
  temporaryDirectories.push(directory);

  return {
    directory,
    repository: new EntryTypesRepository({ dataDirectoryPath: directory }),
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('Eintragsarten-Repository', () => {
  it('speichert Änderungen und Reihenfolge über einen Neustart hinweg', async () => {
    const { directory, repository } = await createTestRepository();
    const früh = await repository.create(entryTypeInput('F'));
    const spät = await repository.create(entryTypeInput('S'));
    const updatedFrüh = await repository.update(
      früh.id,
      entryTypeInput('F', { name: 'Frühdienst', active: false }),
    );

    await expect(repository.reorder([spät.id, früh.id])).resolves.toEqual([
      spät,
      updatedFrüh,
    ]);
    await repository.remove(früh.id);

    const restartedRepository = new EntryTypesRepository({
      dataDirectoryPath: directory,
    });
    await expect(restartedRepository.list()).resolves.toEqual([spät]);
  });

  it('verarbeitet gleichzeitig angestoßene Schreibvorgänge ohne Datenverlust', async () => {
    const { repository } = await createTestRepository();

    const [früh, spät] = await Promise.all([
      repository.create(entryTypeInput('F')),
      repository.create(entryTypeInput('S')),
    ]);

    await expect(repository.list()).resolves.toEqual([früh, spät]);
  });

  it('lädt bei einer beschädigten Hauptdatei den letzten gültigen Sicherungsstand', async () => {
    const { directory, repository } = await createTestRepository();
    const früh = await repository.create(entryTypeInput('F'));
    await repository.create(entryTypeInput('S'));
    await writeFile(
      path.join(directory, 'entry-types.json'),
      '{ beschädigte Hauptdatei',
      'utf8',
    );

    const restartedRepository = new EntryTypesRepository({
      dataDirectoryPath: directory,
    });
    await expect(restartedRepository.list()).resolves.toEqual([früh]);
  });
});
