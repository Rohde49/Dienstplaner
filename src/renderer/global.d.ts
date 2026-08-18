import type { DienstplanerApi } from '../shared/ipc';

declare global {
  interface Window {
    dienstplaner: DienstplanerApi;
  }
}

export {};
