type UserFacingIpcErrorOptions = {
  fallback: string;
  context: string;
};

const ELECTRON_REMOTE_ERROR_PREFIX =
  /^Error invoking remote method '[^']+':\s*(?:Error:\s*)?/i;

const TECHNICAL_ERROR_PATTERNS = [
  /\b(?:EACCES|EBUSY|EEXIST|EISDIR|EMFILE|ENOENT|ENOSPC|ENOTDIR|EPERM)\b/i,
  /\b(?:Error|RangeError|ReferenceError|SyntaxError|TypeError|ZodError)\b/,
  /\b(?:cannot|could not|failed to|invalid argument|is not a function|no handler registered|operation not permitted|permission denied|unexpected token)\b/i,
  /\b(?:null|undefined)\b/i,
  /\b(?:IPC|node:|squirrel)\b/i,
  /[A-Za-z]:\\/,
  /\/(?:home|tmp|Users|var)\//,
  /"(?:code|expected|path)"\s*:/,
  /^\s*(?:\[|\{)/,
  /Datendatei/i,
] as const;

function unwrapElectronRemoteError(message: string): string {
  return message.replace(ELECTRON_REMOTE_ERROR_PREFIX, '').trim();
}

function isUnderstandableApplicationMessage(message: string): boolean {
  return (
    message.length > 0 &&
    message.length <= 240 &&
    !message.includes('\n') &&
    !TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))
  );
}

/**
 * Bewahrt verständliche Fachmeldungen und ersetzt technische IPC-Details durch
 * einen handlungsbezogenen Kontext. Das Original bleibt in der Konsole erhalten.
 */
export function getUserFacingIpcErrorMessage(
  error: unknown,
  { fallback, context }: UserFacingIpcErrorOptions,
): string {
  const message =
    error instanceof Error ? unwrapElectronRemoteError(error.message) : '';

  if (isUnderstandableApplicationMessage(message)) {
    return message;
  }

  console.error(`[Dienstplaner] ${context}`, error);
  return fallback;
}
