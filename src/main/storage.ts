import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { encryptData, decryptData, hashPassword } from './crypto';
import type { AppData, AppSettings } from './types';

const APP_DATA_DIR = path.join(app.getPath('userData'), 'dcm-data');
const DATA_FILE = path.join(APP_DATA_DIR, 'data.encrypted');
const PASSWORD_HASH_FILE = path.join(APP_DATA_DIR, 'auth.hash');
const SETTINGS_FILE = path.join(APP_DATA_DIR, 'settings.json');

// Stelle sicher, dass das Datenverzeichnis existiert
export function ensureDataDirectory(): void {
  if (!fs.existsSync(APP_DATA_DIR)) {
    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
  }
}

/**
 * Speichert AppData verschlüsselt
 * @param data - Die zu speichernden Daten
 * @param masterPassword - Das Master-Passwort
 */
export function saveData(data: AppData, masterPassword: string): void {
  try {
    ensureDataDirectory();

    // Konvertiere zu JSON
    const jsonData = JSON.stringify(data, null, 2);

    // Verschlüssele
    const encrypted = encryptData(jsonData, masterPassword);

    // Speichere verschlüsselte Datei
    fs.writeFileSync(DATA_FILE, encrypted, 'utf-8');

    console.log('Data saved successfully to:', DATA_FILE);
  } catch (error) {
    throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lädt und entschlüsselt AppData
 * @param masterPassword - Das Master-Passwort
 * @returns Die entschlüsselten Daten oder null bei Fehler
 */
export function loadData(masterPassword: string): AppData | null {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log('No data file found, returning default data');
      return getDefaultData();
    }

    // Lese verschlüsselte Datei
    const encrypted = fs.readFileSync(DATA_FILE, 'utf-8');

    // Entschlüssele
    const decrypted = decryptData(encrypted, masterPassword);

    // Parse JSON
    const data = JSON.parse(decrypted) as AppData;

    console.log('Data loaded successfully');
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    return null;
  }
}

/**
 * Verifiziert das Master-Passwort
 * @param password - Das zu überprüfende Passwort
 * @returns true wenn korrekt, false sonst
 */
export function verifyMasterPassword(password: string): boolean {
  try {
    // Beim ersten Start gibt es noch keinen Hash
    if (!fs.existsSync(PASSWORD_HASH_FILE)) {
      return false;
    }

    const storedHash = fs.readFileSync(PASSWORD_HASH_FILE, 'utf-8');
    const passwordHash = hashPassword(password);

    return storedHash === passwordHash;
  } catch (error) {
    console.error('Failed to verify password:', error);
    return false;
  }
}

/**
 * Setzt ein neues Master-Passwort (beim ersten Start)
 * @param password - Das neue Passwort
 */
export function setMasterPassword(password: string): void {
  try {
    ensureDataDirectory();

    const passwordHash = hashPassword(password);
    fs.writeFileSync(PASSWORD_HASH_FILE, passwordHash, 'utf-8');

    console.log('Master password set successfully');
  } catch (error) {
    throw new Error(`Failed to set master password: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Ändert das Master-Passwort (re-encrypt aller Daten)
 * @param oldPassword - Das alte Passwort
 * @param newPassword - Das neue Passwort
 */
export function changeMasterPassword(oldPassword: string, newPassword: string): boolean {
  try {
    // Lade Daten mit altem Passwort
    const data = loadData(oldPassword);
    
    if (!data) {
      return false;
    }

    // Speichere mit neuem Passwort
    saveData(data, newPassword);
    setMasterPassword(newPassword);

    return true;
  } catch (error) {
    console.error('Failed to change master password:', error);
    return false;
  }
}

/**
 * Prüft ob bereits ein Master-Passwort existiert
 * @returns true wenn ein Passwort gesetzt ist
 */
export function hasMasterPassword(): boolean {
  return fs.existsSync(PASSWORD_HASH_FILE);
}

/**
 * Gibt Standard-Daten zurück
 */
function getDefaultData(): AppData {
  return {
    connections: [],
    folders: [
      { path: '/', name: 'Root', expanded: true },
    ],
    tags: [],
  };
}

/**
 * Loads app settings from unencrypted settings file
 */
export function loadSettings(): AppSettings {
  try {
    ensureDataDirectory();
    
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    
    // Return default settings
    return {
      autoLockMinutes: 15,
      theme: 'dark',
      vncClient: 'RealVNC',
      minimizeToTray: false,
      closeToTray: false,
      startWithWindows: false,
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      autoLockMinutes: 15,
      theme: 'dark',
      vncClient: 'RealVNC',
      minimizeToTray: false,
      closeToTray: false,
      startWithWindows: false,
    };
  }
}

/**
 * Saves app settings to unencrypted settings file
 */
export function saveSettings(settings: AppSettings): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

