import { contextBridge, ipcRenderer } from 'electron';

// Types defined inline to avoid module resolution issues in sandbox
type ConnectionType = 'ssh' | 'rdp' | 'vnc' | 'anydesk' | 'teamviewer';

interface Connection {
  id: string;
  name: string;
  type: ConnectionType;
  folder: string;
  tags: string[];
  host: string;
  port?: number;
  username?: string;
  password?: string;
  keyFile?: string;
  customCommand?: string;
  notes?: string;
  lastUsed?: Date;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Folder {
  path: string;
  name: string;
  expanded?: boolean;
}

interface AppData {
  connections: Connection[];
  folders: Folder[];
  tags: string[];
}

interface AppSettings {
  defaultFolder?: string;
  vncClient?: string;
  autoLockMinutes?: number;
  theme?: 'light' | 'dark' | 'system';
  rememberDatabase?: boolean;
  lastDatabasePath?: string;
  minimizeToTray?: boolean;
  closeToTray?: boolean;
  startWithWindows?: boolean;
}

const IPC_CHANNELS = {
  SAVE_CONNECTIONS: 'save-connections',
  LOAD_CONNECTIONS: 'load-connections',
  VERIFY_PASSWORD: 'verify-password',
  LAUNCH_CONNECTION: 'launch-connection',
  UPDATE_LAST_USED: 'update-last-used',
  CHANGE_MASTER_PASSWORD: 'change-master-password',
} as const;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Master Password
  hasMasterPassword: () => ipcRenderer.invoke('has-master-password'),
  setMasterPassword: (password: string) => ipcRenderer.invoke('set-master-password', password),
  verifyMasterPassword: (password: string) => ipcRenderer.invoke(IPC_CHANNELS.VERIFY_PASSWORD, password),
  changeMasterPassword: (oldPassword: string, newPassword: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.CHANGE_MASTER_PASSWORD, oldPassword, newPassword),

  // Data
  loadConnections: (password: string) => ipcRenderer.invoke(IPC_CHANNELS.LOAD_CONNECTIONS, password),
  saveConnections: (data: AppData, password: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_CONNECTIONS, data, password),

  // Launch
  launchConnection: (connection: Connection) => 
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_CONNECTION, connection),

  // Settings
  getSettings: () =>
    ipcRenderer.invoke('get-settings'),
  updateSettings: (settings: AppSettings) => 
    ipcRenderer.invoke('update-settings', settings),
  getAutostartStatus: () => 
    ipcRenderer.invoke('get-autostart-status'),

  // Database path
  getDefaultDatabasePath: () => 
    ipcRenderer.invoke('get-default-database-path'),

  // External links
  openExternal: (url: string) => 
    ipcRenderer.invoke('open-external', url),

  // Update events
  onUpdateStatus: (callback: (status: any) => void) => {
    const subscription = (_event: any, status: any) => callback(status);
    ipcRenderer.on('update-status', subscription);
    return () => ipcRenderer.removeListener('update-status', subscription);
  },
});

// Type declaration for TypeScript
export interface ElectronAPI {
  hasMasterPassword: () => Promise<boolean>;
  setMasterPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  verifyMasterPassword: (password: string) => Promise<boolean>;
  changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean }>;
  loadConnections: (password: string) => Promise<{ success: boolean; data?: AppData; error?: string }>;
  saveConnections: (data: AppData, password: string) => Promise<{ success: boolean; error?: string }>;
  launchConnection: (connection: Connection) => Promise<{ success: boolean; error?: string }>;
  getSettings: () => Promise<{ success: boolean; settings?: AppSettings; error?: string }>;
  updateSettings: (settings: AppSettings) => Promise<{ success: boolean; error?: string }>;
  getAutostartStatus: () => Promise<boolean>;
  getDefaultDatabasePath: () => Promise<string>;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus: (callback: (status: any) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
