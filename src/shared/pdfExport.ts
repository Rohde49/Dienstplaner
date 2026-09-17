import type { PdfExportRequest } from './schemas';
import { pdfExportRequestSchema } from './schemas';

export const MAX_PDF_EXPORT_FILE_NAME_LENGTH = 120;

const PDF_FILE_EXTENSION = '.pdf';
const INVALID_WINDOWS_FILE_NAME_CHARACTERS = new Set([
  '<',
  '>',
  ':',
  '"',
  '/',
  '\\',
  '|',
  '?',
  '*',
]);

function replaceInvalidWindowsFileNameCharacters(value: string): string {
  let result = '';
  let previousCharacterWasInvalid = false;

  for (const character of value) {
    const codePoint = character.codePointAt(0)!;
    const isInvalid =
      codePoint < 32 || INVALID_WINDOWS_FILE_NAME_CHARACTERS.has(character);

    if (isInvalid) {
      if (!previousCharacterWasInvalid) {
        result += '-';
      }
    } else {
      result += character;
    }

    previousCharacterWasInvalid = isInvalid;
  }

  return result;
}

function sanitizeTitleForFileName(title: string): string {
  const sanitizedTitle = replaceInvalidWindowsFileNameCharacters(title)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[-. ]+$/g, '');

  return sanitizedTitle.length > 0 ? sanitizedTitle : 'Dienstplan';
}

function truncateWithoutSplittingCodePoint(
  value: string,
  maximumLength: number,
): string {
  let result = '';

  for (const character of value) {
    if (result.length + character.length > maximumLength) {
      break;
    }

    result += character;
  }

  return result;
}

/** Erstellt den bestätigten, sortierbaren Vorschlag für den PDF-Dateinamen. */
export function createPdfExportFileName(
  requestValue: PdfExportRequest,
): string {
  const request = pdfExportRequestSchema.parse(requestValue);
  const month = String(request.month).padStart(2, '0');
  const prefix = `${request.year}-${month} - `;
  const maximumTitleLength =
    MAX_PDF_EXPORT_FILE_NAME_LENGTH - prefix.length - PDF_FILE_EXTENSION.length;
  const sanitizedTitle = sanitizeTitleForFileName(request.title);
  const shortenedTitle = truncateWithoutSplittingCodePoint(
    sanitizedTitle,
    maximumTitleLength,
  )
    .trimEnd()
    .replace(/[-. ]+$/g, '');

  return `${prefix}${shortenedTitle || 'Dienstplan'}${PDF_FILE_EXTENSION}`;
}

/** Stellt nach einer manuellen Namensänderung weiterhin die PDF-Endung sicher. */
export function ensurePdfFileExtension(filePathValue: string): string {
  const filePath = filePathValue.trimEnd().replace(/[. ]+$/g, '');

  if (filePath.length === 0) {
    throw new RangeError('Der PDF-Zielpfad darf nicht leer sein.');
  }

  return filePath.toLocaleLowerCase('de-DE').endsWith(PDF_FILE_EXTENSION)
    ? filePath
    : `${filePath}${PDF_FILE_EXTENSION}`;
}
