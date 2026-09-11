import { vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getPath: (name: string): never => {
      throw new Error(
        `Unit-Tests dürfen nicht auf den Electron-Pfad "${name}" zugreifen.`,
      );
    },
  },
}));
