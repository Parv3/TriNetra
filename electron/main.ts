import { app, BrowserWindow, ipcMain, screen, globalShortcut, shell } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const url = isDev && process.env.VITE_DEV_SERVER_URL 
    ? process.env.VITE_DEV_SERVER_URL 
    : `http://localhost:5173`;

  if (isDev) {
    mainWindow.loadURL(url);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('window-blur-detected');
  });

  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('window-focus-detected');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Listen for display changes (e.g. plugging in an external monitor)
  screen.on('display-added', () => {
    mainWindow?.webContents.send('display-count-changed', screen.getAllDisplays().length);
  });
  screen.on('display-removed', () => {
    mainWindow?.webContents.send('display-count-changed', screen.getAllDisplays().length);
  });
}

// IPC Handlers
ipcMain.handle('get-displays', () => {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  return displays.map((d) => ({
    id: d.id,
    bounds: d.bounds,
    scaleFactor: d.scaleFactor,
    isPrimary: d.id === primaryDisplay.id,
  }));
});

ipcMain.handle('check-screen-sharing', async () => {
  // PLACEHOLDER: Hardware/OS-level display capture & wireless casting detection requires native C++ bindings (e.g. Windows DXGI Desktop Duplication API / Mac CoreGraphics) not exposed in Chromium web APIs.
  return { isCasting: false, reason: 'No active hardware mirroring detected via virtual display inspection' };
});

ipcMain.handle('set-kiosk', (_event, enable: boolean) => {
  if (mainWindow) {
    mainWindow.setKiosk(enable);
    return true;
  }
  return false;
});

ipcMain.handle('set-fullscreen', (_event, enable: boolean) => {
  if (mainWindow) {
    mainWindow.setFullScreen(enable);
    return true;
  }
  return false;
});

ipcMain.handle('open-external-url', async (_event, url: string) => {
  await shell.openExternal(url);
});

app.whenReady().then(() => {
  createWindow();

  // Block basic shortcuts in production
  if (!isDev) {
    globalShortcut.register('CommandOrControl+R', () => {});
    globalShortcut.register('CommandOrControl+Shift+I', () => {});
    globalShortcut.register('F12', () => {});
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

