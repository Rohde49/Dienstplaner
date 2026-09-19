import { afterEach, describe, expect, it, vi } from 'vitest';

import { getUserFacingIpcErrorMessage } from '../../../src/renderer/errors/userFacingIpcError';

const options = {
  fallback: 'Der Vorgang konnte nicht abgeschlossen werden.',
  context: 'Testvorgang fehlgeschlagen',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('verständliche IPC-Fehlermeldungen', () => {
  it('bewahrt eine verständliche fachliche Meldung', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(
      getUserFacingIpcErrorMessage(
        new Error('Der Monatsplan wurde nicht gefunden.'),
        options,
      ),
    ).toBe('Der Monatsplan wurde nicht gefunden.');
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('entfernt die technische Electron-Hülle einer fachlichen Meldung', () => {
    expect(
      getUserFacingIpcErrorMessage(
        new Error(
          "Error invoking remote method 'monthly-plans:get': Error: Der Monatsplan wurde nicht gefunden.",
        ),
        options,
      ),
    ).toBe('Der Monatsplan wurde nicht gefunden.');
  });

  it.each([
    "EACCES: permission denied, open 'C:\\Daten\\employees.json'",
    'Die Datendatei "employees.json" konnte nicht gelesen werden.',
    '[{"code":"invalid_type","path":["employees"]}]',
    "Cannot read properties of undefined (reading 'employees')",
  ])(
    'ersetzt technische Details durch den vorgesehenen Kontext: %s',
    (message) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error(message);

      expect(getUserFacingIpcErrorMessage(error, options)).toBe(
        options.fallback,
      );
      expect(consoleError).toHaveBeenCalledWith(
        '[Dienstplaner] Testvorgang fehlgeschlagen',
        error,
      );
    },
  );

  it('verwendet bei einem unbekannten Fehler den vorgesehenen Kontext', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const error = { reason: 'unbekannt' };

    expect(getUserFacingIpcErrorMessage(error, options)).toBe(options.fallback);
    expect(consoleError).toHaveBeenCalledWith(
      '[Dienstplaner] Testvorgang fehlgeschlagen',
      error,
    );
  });
});
