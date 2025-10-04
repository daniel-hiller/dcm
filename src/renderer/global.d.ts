import type { ElectronAPI } from '../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

declare module '*.svg' {
  const content: string;
  export default content;
}

export {};
