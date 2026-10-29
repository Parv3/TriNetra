import { contextBridge, ipcRenderer } from 'electron';

export interface DisplayInfo {
  id: number;
  bounds: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  isPrimary: boolean;
}

const electronAPI = {
  isElectron: true,
  getDisplays: async (): Promise<DisplayInfo[]> => {
    return ipcRenderer.invoke('get-displays');
  },
  checkScreenSharing: async (): Promise<{ isCasting: boolean; reason?: string }> => {
    return ipcRenderer.invoke('check-screen-sharing');
  },
  setKiosk: async (enable: boolean): Promise<boolean> => {
    return ipcRenderer.invoke('set-kiosk', enable);
  },
  setFullscreen: async (enable: boolean): Promise<boolean> => {
    return ipcRenderer.invoke('set-fullscreen', enable);
  },
  openExternalUrl: async (url: string): Promise<void> => {
    return ipcRenderer.invoke('open-external-url', url);
  },
  onDisplayChange: (callback: (count: number) => void) => {
    const handler = (_: any, count: number) => callback(count);
    ipcRenderer.on('display-count-changed', handler);
    return () => ipcRenderer.removeListener('display-count-changed', handler);
  },
  onWindowBlur: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window-blur-detected', handler);
    return () => ipcRenderer.removeListener('window-blur-detected', handler);
  },
  onWindowFocus: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window-focus-detected', handler);
    return () => ipcRenderer.removeListener('window-focus-detected', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

