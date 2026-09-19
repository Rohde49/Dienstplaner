import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const lockPath = path.join(projectDirectory, 'package-lock.json');
const outputPath = path.join(projectDirectory, 'THIRD_PARTY_NOTICES.txt');
const checkOnly = process.argv.includes('--check');

const mitFallback = (copyright) => `MIT License

Copyright (c) ${copyright}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function toPosixPath(...parts) {
  return path.posix.join(...parts.map((part) => part.replaceAll('\\', '/')));
}

function resolveDependencyLocation(packages, parentLocation, packageName) {
  let currentLocation = parentLocation;

  while (true) {
    const candidate = currentLocation
      ? toPosixPath(currentLocation, 'node_modules', packageName)
      : toPosixPath('node_modules', packageName);

    if (packages[candidate]) {
      return candidate;
    }

    if (!currentLocation) {
      break;
    }

    const parent = path.posix.dirname(currentLocation);
    currentLocation = parent === '.' ? '' : parent;
  }

  throw new Error(
    `Die Laufzeitabhängigkeit "${packageName}" von "${parentLocation || 'package.json'}" fehlt in package-lock.json.`,
  );
}

function collectProductionPackageLocations(lock) {
  const packages = lock.packages;
  const root = packages[''];
  const queue = Object.keys(root.dependencies ?? {}).map((packageName) => ({
    parentLocation: '',
    packageName,
  }));
  const visited = new Set();

  while (queue.length > 0) {
    const dependency = queue.shift();
    const location = resolveDependencyLocation(
      packages,
      dependency.parentLocation,
      dependency.packageName,
    );

    if (visited.has(location)) {
      continue;
    }

    visited.add(location);
    const packageEntry = packages[location];
    const childDependencies = {
      ...(packageEntry.dependencies ?? {}),
      ...(packageEntry.optionalDependencies ?? {}),
    };

    for (const packageName of Object.keys(childDependencies)) {
      queue.push({ parentLocation: location, packageName });
    }
  }

  return [...visited];
}

function formatAuthor(author) {
  if (typeof author === 'string') {
    return author.trim();
  }

  if (author && typeof author === 'object' && typeof author.name === 'string') {
    return author.name.trim();
  }

  return '';
}

function normalizeDocument(content) {
  return content
    .replaceAll('\r\n', '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function findLicenseDocuments(packageDirectory, packageJson, license) {
  const fileNames = readdirSync(packageDirectory)
    .filter((fileName) =>
      /^(?:licen[cs]e|copying|notice)(?:\.|$)/i.test(fileName),
    )
    .sort((first, second) => first.localeCompare(second, 'en'));

  if (fileNames.length > 0) {
    return fileNames.map((fileName) => ({
      fileName,
      content: normalizeDocument(
        readFileSync(path.join(packageDirectory, fileName), 'utf8'),
      ),
      generated: false,
    }));
  }

  const author = formatAuthor(packageJson.author);

  if (license === 'MIT' && author) {
    return [
      {
        fileName: 'GENERATED-MIT-FALLBACK',
        content: mitFallback(author),
        generated: true,
      },
    ];
  }

  throw new Error(
    `${packageJson.name}@${packageJson.version} enthält keine lokale Lizenzdatei. Für "${license || 'unbekannt'}" ist kein sicherer Fallback definiert.`,
  );
}

function normalizeRepository(repository) {
  if (typeof repository === 'string') {
    return repository;
  }

  return repository?.url ?? '';
}

function collectPackages(lock) {
  const packagesByIdentity = new Map();

  for (const location of collectProductionPackageLocations(lock)) {
    const packageDirectory = path.join(
      projectDirectory,
      ...location.split('/'),
    );
    const packageJsonPath = path.join(packageDirectory, 'package.json');

    if (!existsSync(packageJsonPath)) {
      throw new Error(`Installierte Paketmetadaten fehlen: ${packageJsonPath}`);
    }

    const packageJson = readJson(packageJsonPath);
    const lockEntry = lock.packages[location];
    const identity = `${packageJson.name}@${packageJson.version}`;

    if (packagesByIdentity.has(identity)) {
      continue;
    }

    const license = packageJson.license ?? lockEntry.license;

    if (!license) {
      throw new Error(`${identity} enthält keine Lizenzangabe.`);
    }

    packagesByIdentity.set(identity, {
      identity,
      name: packageJson.name,
      version: packageJson.version,
      license,
      author: formatAuthor(packageJson.author),
      repository: normalizeRepository(packageJson.repository),
      documents: findLicenseDocuments(packageDirectory, packageJson, license),
    });
  }

  return [...packagesByIdentity.values()].sort(
    (first, second) =>
      first.name.localeCompare(second.name, 'en') ||
      first.version.localeCompare(second.version, 'en'),
  );
}

function createNotice(packages) {
  const documentsByHash = new Map();

  for (const packageInfo of packages) {
    packageInfo.documentReferences = packageInfo.documents.map((document) => {
      const hash = createHash('sha256').update(document.content).digest('hex');
      let sharedDocument = documentsByHash.get(hash);

      if (!sharedDocument) {
        sharedDocument = {
          id: `L${String(documentsByHash.size + 1).padStart(3, '0')}`,
          content: document.content,
          users: [],
          generated: document.generated,
        };
        documentsByHash.set(hash, sharedDocument);
      }

      sharedDocument.users.push(
        `${packageInfo.identity} (${document.fileName})`,
      );
      return sharedDocument.id;
    });
  }

  const lines = [
    'THIRD-PARTY SOFTWARE NOTICES',
    '',
    'Dienstplaner 1.0.0',
    '',
    'This file lists the production dependency graph declared by package-lock.json.',
    'It may conservatively include packages that are removed by bundling or tree shaking.',
    'The notices do not change the license terms of the listed software.',
    '',
    `Packages: ${packages.length}`,
    `Distinct license documents: ${documentsByHash.size}`,
    '',
    'PACKAGE INVENTORY',
    '=================',
    '',
  ];

  for (const packageInfo of packages) {
    lines.push(packageInfo.identity);
    lines.push(`  Declared license: ${packageInfo.license}`);

    if (packageInfo.author) {
      lines.push(`  Author metadata: ${packageInfo.author}`);
    }

    if (packageInfo.repository) {
      lines.push(`  Repository: ${packageInfo.repository}`);
    }

    lines.push(
      `  License documents: ${[...new Set(packageInfo.documentReferences)].join(', ')}`,
      '',
    );
  }

  lines.push('LICENSE DOCUMENTS', '=================', '');

  for (const document of documentsByHash.values()) {
    lines.push('-'.repeat(80));
    lines.push(document.id);
    lines.push(`Used by: ${document.users.join('; ')}`);

    if (document.generated) {
      lines.push(
        'Note: The installed npm package contained no separate license file.',
        'This MIT text was generated from the package license and author metadata.',
      );
    }

    lines.push('', document.content, '');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

const lock = readJson(lockPath);
const notice = createNotice(collectPackages(lock));

if (checkOnly) {
  if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== notice) {
    throw new Error(
      'THIRD_PARTY_NOTICES.txt ist nicht aktuell. Führe "npm run licenses:generate" aus.',
    );
  }

  console.log('THIRD_PARTY_NOTICES.txt ist aktuell.');
} else {
  writeFileSync(outputPath, notice, 'utf8');
  console.log('THIRD_PARTY_NOTICES.txt wurde aktualisiert.');
}
