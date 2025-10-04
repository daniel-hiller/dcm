import { app, BrowserWindow, ipcMain, Tray, shell } from 'electron';
import * as path from 'path';
import { 
  loadData, 
  saveData, 
  verifyMasterPassword, 
  setMasterPassword, 
  hasMasterPassword,
  changeMasterPassword,
  loadSettings,
  saveSettings,
} from './storage';
import { launchConnection } from './launcher';
import { setupAutoUpdater, stopAutoUpdater } from './updater';
import { createTray, setAutostart, getAutostartStatus } from './tray';
import { IPC_CHANNELS } from './types';
import type { AppData, Connection, AppSettings } from './types';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let appSettings: AppSettings | null = null;
let isQuitting = false;

function createWindow() {
  const iconPath = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../resources/icon.ico')
    : path.join(process.resourcesPath, 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "DCM - Daniel's Connection Manager",
    backgroundColor: '#1f2937',
    icon: iconPath,
    autoHideMenuBar: true,
  });

  // Hide menu in production
  if (process.env.NODE_ENV !== 'development') {
    mainWindow.setMenu(null);
  }

  // Load Vite dev server in development or built files in production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle minimize to tray
  mainWindow.on('minimize', () => {
    if (appSettings?.minimizeToTray) {
      mainWindow?.hide();
    }
  });

  // Handle close to tray
  mainWindow.on('close', (event: any) => {
    if (appSettings?.closeToTray && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  return mainWindow;
}

// Single instance lock - prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running, quit this one
  app.quit();
} else {
  // This is the first instance
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Load settings on startup
    appSettings = loadSettings();
    console.log('Loaded settings:', appSettings);
    
    setupIPC();
    const window = createWindow();
    
    // Create system tray
    tray = createTray(window);
    
    // Setup auto-updater
    setupAutoUpdater(window);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('before-quit', () => {
    isQuitting = true;
  });

  app.on('window-all-closed', () => {
    stopAutoUpdater();
    if (process.platform !== 'darwin') {
      isQuitting = true;
      app.quit();
  }
});

// IPC Handlers
function setupIPC() {
  // Prüfe ob Master-Passwort existiert
  ipcMain.handle('has-master-password', () => {
    return hasMasterPassword();
  });

  // Get current settings
  ipcMain.handle('get-settings', async () => {
    try {
      if (!appSettings) {
        appSettings = loadSettings();
      }
      return { success: true, settings: appSettings };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Verifiziere Master-Passwort
  ipcMain.handle(IPC_CHANNELS.VERIFY_PASSWORD, async (_, password: string) => {
    return verifyMasterPassword(password);
  });

  // Setze neues Master-Passwort (beim ersten Start)
  ipcMain.handle('set-master-password', async (_, password: string) => {
    try {
      setMasterPassword(password);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Lade Verbindungen
  ipcMain.handle(IPC_CHANNELS.LOAD_CONNECTIONS, async (_, password: string) => {
    try {
      const data = loadData(password);
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Speichere Verbindungen
  ipcMain.handle(IPC_CHANNELS.SAVE_CONNECTIONS, async (_, data: AppData, password: string) => {
    try {
      saveData(data, password);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Starte Verbindung
  ipcMain.handle(IPC_CHANNELS.LAUNCH_CONNECTION, async (_, connection: Connection) => {
    try {
      launchConnection(connection);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Ändere Master-Passwort
  ipcMain.handle(IPC_CHANNELS.CHANGE_MASTER_PASSWORD, async (_, oldPassword: string, newPassword: string) => {
    try {
      const success = changeMasterPassword(oldPassword, newPassword);
      return { success };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Get default database path
  ipcMain.handle('get-default-database-path', async () => {
    const appData = app.getPath('appData');
    return path.join(appData, 'dcm', 'dcm-data', 'data.encrypted');
  });

  // Update settings (für Tray und Autostart)
  ipcMain.handle('update-settings', async (_, settings: AppSettings) => {
    try {
      appSettings = settings;
      
      // Save settings to disk
      saveSettings(settings);
      
      // Update autostart
      if (settings.startWithWindows !== undefined) {
        setAutostart(settings.startWithWindows);
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Get autostart status
  ipcMain.handle('get-autostart-status', async () => {
    return getAutostartStatus();
  });

  // Open external URL
  ipcMain.handle('open-external', async (_, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });
}
} // End of else block for single instance lock
