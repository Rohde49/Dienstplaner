import type { DienstplanerApi } from '../shared/ipc';

declare global {
  interface Window {
    /** Bietet der Oberfläche einen sicheren Zugriff auf freigegebene Funktionen. */
    dienstplaner: DienstplanerApi;
  }
}

export {};
