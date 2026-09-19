import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { EmployeesRepository } from '../../../src/main/storage/employeesRepository';
import type { EmployeeInput } from '../../../src/shared/schemas';

const temporaryDirectories: string[] = [];

function employeeInput(
  firstName: string,
  overrides: Partial<EmployeeInput> = {},
): EmployeeInput {
  return {
    firstName,
    lastName: 'Beispiel',
    role: 'Erzieher',
    weeklyWorkingMinutes: 2_340,
    colorKey: 'blue',
    active: true,
    ...overrides,
  };
}

async function createTestRepository(): Promise<{
  directory: string;
  repository: EmployeesRepository;
}> {
  const directory = await mkdtemp(
    path.join(tmpdir(), 'dienstplaner-employees-'),
  );
  temporaryDirectories.push(directory);

  return {
    directory,
    repository: new EmployeesRepository({ dataDirectoryPath: directory }),
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('Mitarbeiter-Repository', () => {
  it('speichert Änderungen und Reihenfolge über einen Neustart hinweg', async () => {
    const { directory, repository } = await createTestRepository();
    const anna = await repository.create(employeeInput('Anna'));
    const ben = await repository.create(
      employeeInput('Ben', { colorKey: 'green' }),
    );
    const updatedAnna = await repository.update(
      anna.id,
      employeeInput('Anja', { active: false }),
    );

    await expect(repository.reorder([ben.id, anna.id])).resolves.toEqual([
      ben,
      updatedAnna,
    ]);
    await repository.remove(anna.id);

    const restartedRepository = new EmployeesRepository({
      dataDirectoryPath: directory,
    });
    await expect(restartedRepository.list()).resolves.toEqual([ben]);
  });

  it('verarbeitet gleichzeitig angestoßene Schreibvorgänge ohne Datenverlust', async () => {
    const { repository } = await createTestRepository();

    const [anna, ben] = await Promise.all([
      repository.create(employeeInput('Anna')),
      repository.create(employeeInput('Ben', { colorKey: 'green' })),
    ]);

    await expect(repository.list()).resolves.toEqual([anna, ben]);
  });

  it('lädt bei einer beschädigten Hauptdatei den letzten gültigen Sicherungsstand', async () => {
    const { directory, repository } = await createTestRepository();
    const anna = await repository.create(employeeInput('Anna'));
    await repository.create(employeeInput('Ben', { colorKey: 'green' }));
    await writeFile(
      path.join(directory, 'employees.json'),
      '{ beschädigte Hauptdatei',
      'utf8',
    );

    const restartedRepository = new EmployeesRepository({
      dataDirectoryPath: directory,
    });
    await expect(restartedRepository.list()).resolves.toEqual([anna]);
  });
});
