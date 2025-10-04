import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import * as path from 'path';

export function createTray(window: BrowserWindow): Tray {
  const iconPath = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../resources/icon.ico')
    : path.join(process.resourcesPath, 'icon.ico');

  const trayIcon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'DCM - Connection Manager',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Show',
      click: () => {
        window.show();
        window.focus();
      },
    },
    {
      label: 'Hide',
      click: () => {
        window.hide();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('DCM - Daniel\'s Connection Manager');
  tray.setContextMenu(contextMenu);

  // Double-click to show/hide
  tray.on('double-click', () => {
    if (window.isVisible()) {
      window.hide();
    } else {
      window.show();
      window.focus();
    }
  });

  return tray;
}

export function setAutostart(enable: boolean): void {
  if (process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: process.execPath,
      args: [],
    });
  }
}

export function getAutostartStatus(): boolean {
  if (process.platform === 'win32') {
    return app.getLoginItemSettings().openAtLogin;
  }
  return false;
}
