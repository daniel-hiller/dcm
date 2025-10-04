// Main process types
export type ConnectionType = 'ssh' | 'rdp' | 'vnc' | 'anydesk' | 'teamviewer';

export interface Connection {
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

export interface Folder {
  path: string;
  name: string;
  expanded?: boolean;
}

export interface AppData {
  connections: Connection[];
  folders: Folder[];
  tags: string[];
}

export interface AppSettings {
  defaultFolder?: string;
  vncClient?: string;
  autoLockMinutes?: number;
  theme?: 'light' | 'dark' | 'system';
  rememberDatabase?: boolean;
  minimizeToTray?: boolean;
  closeToTray?: boolean;
  startWithWindows?: boolean;
}

export const IPC_CHANNELS = {
  SAVE_CONNECTIONS: 'save-connections',
  LOAD_CONNECTIONS: 'load-connections',
  VERIFY_PASSWORD: 'verify-password',
  LAUNCH_CONNECTION: 'launch-connection',
  UPDATE_LAST_USED: 'update-last-used',
  CHANGE_MASTER_PASSWORD: 'change-master-password',
} as const;
