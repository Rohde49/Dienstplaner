import { app } from 'electron';
import { describe, expect, it } from 'vitest';

describe('Unit-Test-Umgebung', () => {
  it('verhindert Zugriffe auf den echten Electron-Benutzerdatenordner', () => {
    expect(() => app.getPath('userData')).toThrowError(
      'Unit-Tests dürfen nicht auf den Electron-Pfad "userData" zugreifen.',
    );
  });
});
