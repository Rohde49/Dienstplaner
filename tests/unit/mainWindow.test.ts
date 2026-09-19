import { beforeEach, describe, expect, it, vi } from 'vitest';

const electronMocks = vi.hoisted(() => {
  let readyCallback: (() => void) | undefined;
  let readyToShowCallback: (() => void) | undefined;
  let closeCallback:
    ((event: { preventDefault: () => void }) => void) | undefined;
  let confirmCloseCallback: (() => void) | undefined;

  const maximize = vi.fn();
  const show = vi.fn();
  const loadFile = vi.fn();
  const close = vi.fn();
  const send = vi.fn();

  return {
    app: {
      quit: vi.fn(),
      setAppUserModelId: vi.fn(),
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
      on: vi.fn(
        (
          event: string,
          callback: (event: { preventDefault: () => void }) => void,
        ) => {
          if (event === 'close') {
            closeCallback = callback;
          }
        },
      ),
      webContents: { send },
      maximize,
      show,
      close,
      loadFile,
      loadURL: vi.fn(),
    })),
    ipcMain: {
      on: vi.fn((event: string, callback: () => void) => {
        if (event === 'app:confirm-close') {
          confirmCloseCallback = callback;
        }
      }),
      removeListener: vi.fn(),
    },
    maximize,
    show,
    close,
    send,
    loadFile,
    runReadyCallback: () => readyCallback?.(),
    runReadyToShowCallback: () => readyToShowCallback?.(),
    runCloseCallback: (event: { preventDefault: () => void }) =>
      closeCallback?.(event),
    runConfirmCloseCallback: () => confirmCloseCallback?.(),
    resetCallbacks: () => {
      readyCallback = undefined;
      readyToShowCallback = undefined;
      closeCallback = undefined;
      confirmCloseCallback = undefined;
    },
  };
});

vi.mock('electron', () => ({
  app: electronMocks.app,
  BrowserWindow: electronMocks.browserWindow,
  ipcMain: electronMocks.ipcMain,
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
vi.mock('../../src/main/ipc/registerPdfExportIpcHandlers', () => ({
  registerPdfExportIpcHandlers: vi.fn(),
}));

describe('Electron-Hauptfenster', () => {
  beforeEach(() => {
    vi.resetModules();
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
    expect(electronMocks.app.setAppUserModelId).toHaveBeenCalledWith(
      'com.squirrel.Dienstplaner.Dienstplaner',
    );
    expect(electronMocks.maximize.mock.invocationCallOrder[0]).toBeLessThan(
      electronMocks.show.mock.invocationCallOrder[0],
    );
  });

  it('wartet beim Schließen auf die ausdrückliche Freigabe der Oberfläche', async () => {
    vi.stubGlobal('MAIN_WINDOW_VITE_DEV_SERVER_URL', undefined);
    vi.stubGlobal('MAIN_WINDOW_VITE_NAME', 'main_window');
    await import('../../src/main');
    electronMocks.runReadyCallback();
    const closeEvent = { preventDefault: vi.fn() };

    electronMocks.runCloseCallback(closeEvent);

    expect(closeEvent.preventDefault).toHaveBeenCalledOnce();
    expect(electronMocks.send).toHaveBeenCalledWith('app:close-requested');

    electronMocks.runConfirmCloseCallback();

    expect(electronMocks.close).toHaveBeenCalledOnce();
  });
});
