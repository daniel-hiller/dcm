import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';

// Configure logging
autoUpdater.logger = log;
(autoUpdater.logger as typeof log).transports.file.level = 'info';

let updateCheckInterval: NodeJS.Timeout | null = null;

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  // Don't check for updates in development
  if (process.env.NODE_ENV === 'development') {
    log.info('Auto-updater disabled in development mode');
    return;
  }

  log.info('=== Auto-Updater Setup ===');
  log.info('Current app version:', require('../../package.json').version);
  log.info('Update feed URL:', autoUpdater.getFeedURL());

  // Configure auto-updater
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Update available
  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    mainWindow.webContents.send('update-status', {
      type: 'available',
      version: info.version,
    });
  });

  // Update not available
  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
    mainWindow.webContents.send('update-status', {
      type: 'not-available',
    });
  });

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update verfügbar',
      message: `Version ${info.version} wurde heruntergeladen`,
      detail: 'Die Anwendung wird beim nächsten Start aktualisiert. Möchten Sie jetzt neu starten?',
      buttons: ['Jetzt neu starten', 'Später'],
      defaultId: 0,
      cancelId: 1,
    }).then((result) => {
      if (result.response === 0) {
        // Quit and install
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  // Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    log.info('Download progress:', progressObj);
    mainWindow.webContents.send('update-status', {
      type: 'downloading',
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  // Error
  autoUpdater.on('error', (error) => {
    log.error('Update error:', error);
    mainWindow.webContents.send('update-status', {
      type: 'error',
      error: error.message,
    });
  });

  // Check for updates on startup
  log.info('Checking for updates on startup...');
  autoUpdater.checkForUpdates().catch((error) => {
    log.error('Failed to check for updates:', error);
  });

  // Check for updates every hour
  updateCheckInterval = setInterval(() => {
    log.info('Checking for updates (scheduled)...');
    autoUpdater.checkForUpdates().catch((error) => {
      log.error('Failed to check for updates:', error);
    });
  }, 60 * 60 * 1000); // 1 hour
}

export function stopAutoUpdater() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}
