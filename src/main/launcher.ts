import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Connection } from './types';

/**
 * Startet eine SSH-Verbindung
 * @param connection - Die Verbindungsdaten
 */
export function launchSSH(connection: Connection): void {
  try {
    let command: string;

    if (connection.customCommand) {
      command = connection.customCommand;
    } else {
      const port = connection.port || 22;
      const username = connection.username || '';
      const host = connection.host;

      if (connection.keyFile) {
        // SSH mit Key-File
        command = `wt.exe ssh -i "${connection.keyFile}" ${username}@${host} -p ${port}`;
      } else {
        // SSH mit Passwort (wird interaktiv abgefragt)
        command = `wt.exe ssh ${username}@${host} -p ${port}`;
      }
    }

    console.log('Launching SSH:', command);
    exec(command, (error) => {
      if (error) {
        console.error('SSH launch error:', error);
      }
    });
  } catch (error) {
    throw new Error(`Failed to launch SSH: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Startet eine RDP-Verbindung
 * @param connection - Die Verbindungsdaten
 */
export function launchRDP(connection: Connection): void {
  try {
    const port = connection.port || 3389;
    const host = connection.host;

    // Erstelle temporäre .rdp Datei
    const tempDir = os.tmpdir();
    const rdpFile = path.join(tempDir, `dcm-${connection.id}.rdp`);

    let rdpContent = `full address:s:${host}:${port}\n`;
    
    if (connection.username) {
      rdpContent += `username:s:${connection.username}\n`;
    }

    // Standard-Einstellungen
    rdpContent += `screen mode id:i:2\n`; // Fullscreen
    rdpContent += `desktopwidth:i:1920\n`;
    rdpContent += `desktopheight:i:1080\n`;
    rdpContent += `session bpp:i:32\n`;
    rdpContent += `compression:i:1\n`;
    rdpContent += `keyboardhook:i:2\n`;
    rdpContent += `audiocapturemode:i:0\n`;
    rdpContent += `videoplaybackmode:i:1\n`;
    rdpContent += `connection type:i:7\n`;
    rdpContent += `displayconnectionbar:i:1\n`;
    rdpContent += `disable wallpaper:i:0\n`;
    rdpContent += `allow font smoothing:i:1\n`;
    rdpContent += `allow desktop composition:i:1\n`;
    rdpContent += `redirectclipboard:i:1\n`;
    rdpContent += `redirectprinters:i:0\n`;
    rdpContent += `redirectsmartcards:i:1\n`;
    rdpContent += `authentication level:i:0\n`;
    rdpContent += `prompt for credentials:i:1\n`;
    rdpContent += `negotiate security layer:i:1\n`;

    fs.writeFileSync(rdpFile, rdpContent, 'utf-8');

    const command = `mstsc.exe "${rdpFile}"`;
    console.log('Launching RDP:', command);

    exec(command, (error) => {
      if (error) {
        console.error('RDP launch error:', error);
      }

      // Lösche temporäre Datei nach 5 Sekunden
      setTimeout(() => {
        try {
          if (fs.existsSync(rdpFile)) {
            fs.unlinkSync(rdpFile);
          }
        } catch (e) {
          console.error('Failed to delete temp RDP file:', e);
        }
      }, 5000);
    });
  } catch (error) {
    throw new Error(`Failed to launch RDP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Startet eine VNC-Verbindung
 * @param connection - Die Verbindungsdaten
 */
export function launchVNC(connection: Connection, vncClient?: string): void {
  try {
    const port = connection.port || 5900;
    const host = connection.host;
    const client = vncClient || 'vncviewer.exe';

    const command = `"${client}" ${host}:${port}`;
    console.log('Launching VNC:', command);

    exec(command, (error) => {
      if (error) {
        console.error('VNC launch error:', error);
      }
    });
  } catch (error) {
    throw new Error(`Failed to launch VNC: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Startet eine AnyDesk-Verbindung
 * @param connection - Die Verbindungsdaten
 */
export function launchAnyDesk(connection: Connection): void {
  try {
    const command = `anydesk.exe ${connection.host}`;
    console.log('Launching AnyDesk:', command);

    exec(command, (error) => {
      if (error) {
        console.error('AnyDesk launch error:', error);
      }
    });
  } catch (error) {
    throw new Error(`Failed to launch AnyDesk: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Startet eine TeamViewer-Verbindung
 * @param connection - Die Verbindungsdaten
 */
export function launchTeamViewer(connection: Connection): void {
  try {
    const command = `teamviewer.exe -i ${connection.host}`;
    console.log('Launching TeamViewer:', command);

    exec(command, (error) => {
      if (error) {
        console.error('TeamViewer launch error:', error);
      }
    });
  } catch (error) {
    throw new Error(`Failed to launch TeamViewer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Startet eine Verbindung basierend auf dem Typ
 * @param connection - Die Verbindungsdaten
 * @param vncClient - Optional: Custom VNC Client Pfad
 */
export function launchConnection(connection: Connection, vncClient?: string): void {
  switch (connection.type) {
    case 'ssh':
      launchSSH(connection);
      break;
    case 'rdp':
      launchRDP(connection);
      break;
    case 'vnc':
      launchVNC(connection, vncClient);
      break;
    case 'anydesk':
      launchAnyDesk(connection);
      break;
    case 'teamviewer':
      launchTeamViewer(connection);
      break;
    default:
      throw new Error(`Unknown connection type: ${connection.type}`);
  }
}
