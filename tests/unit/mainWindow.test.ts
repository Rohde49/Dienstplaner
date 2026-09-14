import { beforeEach, describe, expect, it, vi } from 'vitest';

const electronMocks = vi.hoisted(() => {
  let readyCallback: (() => void) | undefined;
  let readyToShowCallback: (() => void) | undefined;

  const maximize = vi.fn();
  const show = vi.fn();
  const loadFile = vi.fn();

  return {
    app: {
      quit: vi.fn(),
      whenReady: vi.fn(() => ({
        then: vi.fn((callback: () => void) => {
          readyCallback = callback;
        }),
      })),
      on: vi.fn(),
    },
    browserWindow: vi.fn(() => ({
      once: vi.fn((event: string, callback: () => void) => {
        if (event === 'ready-to-show') {
          readyToShowCallback = callback;
        }
      }),
      maximize,
      show,
      loadFile,
      loadURL: vi.fn(),
    })),
    maximize,
    show,
    loadFile,
    runReadyCallback: () => readyCallback?.(),
    runReadyToShowCallback: () => readyToShowCallback?.(),
    resetCallbacks: () => {
      readyCallback = undefined;
      readyToShowCallback = undefined;
    },
  };
});

vi.mock('electron', () => ({
  app: electronMocks.app,
  BrowserWindow: electronMocks.browserWindow,
}));

vi.mock('electron-squirrel-startup', () => ({ default: false }));
vi.mock('../../src/main/ipc/registerEmployeeIpcHandlers', () => ({
  registerEmployeeIpcHandlers: vi.fn(),
}));
vi.mock('../../src/main/ipc/registerEntryTypeIpcHandlers', () => ({
  registerEntryTypeIpcHandlers: vi.fn(),
}));
vi.mock('../../src/main/ipc/registerMonthlyPlanIpcHandlers', () => ({
  registerMonthlyPlanIpcHandlers: vi.fn(),
}));

describe('Electron-Hauptfenster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    electronMocks.resetCallbacks();
  });

  it('wird beim ersten Anzeigen maximiert und bleibt ein normales Fenster', async () => {
    vi.stubGlobal('MAIN_WINDOW_VITE_DEV_SERVER_URL', undefined);
    vi.stubGlobal('MAIN_WINDOW_VITE_NAME', 'main_window');

    await import('../../src/main');
    electronMocks.runReadyCallback();
    electronMocks.runReadyToShowCallback();

    expect(electronMocks.browserWindow).toHaveBeenCalledWith(
      expect.not.objectContaining({ fullscreen: true }),
    );
    expect(electronMocks.browserWindow).toHaveBeenCalledWith(
      expect.not.objectContaining({ kiosk: true }),
    );
    expect(electronMocks.maximize).toHaveBeenCalledOnce();
    expect(electronMocks.show).toHaveBeenCalledOnce();
    expect(electronMocks.maximize.mock.invocationCallOrder[0]).toBeLessThan(
      electronMocks.show.mock.invocationCallOrder[0],
    );
  });
});
