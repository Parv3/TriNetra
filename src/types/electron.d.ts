export interface DisplayInfo {
  id: number;
  bounds: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  isPrimary: boolean;
}

export interface ElectronAPI {
  isElectron: boolean;
  getDisplays: () => Promise<DisplayInfo[]>;
  checkScreenSharing: () => Promise<{ isCasting: boolean; reason?: string }>;
  setKiosk: (enable: boolean) => Promise<boolean>;
  setFullscreen: (enable: boolean) => Promise<boolean>;
  openExternalUrl: (url: string) => Promise<void>;
  onDisplayChange: (callback: (displayCount: number) => void) => () => void;
  onWindowBlur: (callback: () => void) => () => void;
  onWindowFocus: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

