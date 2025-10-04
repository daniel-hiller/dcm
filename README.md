# DCM - Daniel's Connection Manager

![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Desktop application for managing remote connections (SSH, RDP, VNC, AnyDesk, TeamViewer) with encrypted password storage.

## Features

✅ **Multi-Protocol Support**
- SSH (with SSH key file support)
- RDP (Remote Desktop Protocol)
- VNC (Virtual Network Computing)
- AnyDesk
- TeamViewer

✅ **Security**
- AES-256 encryption for all passwords
- Master password protected
- PBKDF2 key derivation (10,000 iterations)
- Encrypted local data storage
- No password recovery - secure by design

✅ **Organization**
- Folder structure for connections
- Tag system
- Favorites
- Fuzzy search
- Sorting & filtering

✅ **User Experience**
- Modern React UI with TailwindCSS
- Dark/Light/System theme
- Auto-lock after inactivity
- System tray support (minimize/close to tray)
- Auto-start with Windows
- Quick launch via double-click

✅ **Auto-Update**
- Automatic update checks on startup
- Hourly background update checks
- Automatic download and installation
- User notification on update availability

## Tech Stack

- **Framework**: Electron 28 + React 18 + TypeScript 5
- **UI**: TailwindCSS 3
- **State Management**: Zustand
- **Encryption**: crypto-js (AES-256-CBC)
- **Auto-Update**: electron-updater
- **Build**: Electron Builder

## Installation

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Setup

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Create production build
npm run build
npm run package:win
```

## Usage

### First Launch

1. On first start, you'll be prompted to create a **master password**
2. This password encrypts ALL connection data
3. **IMPORTANT**: Don't forget this password - data cannot be recovered without it!
4. Read and accept the security disclaimer
5. Select a location for your encrypted database file

### Creating a Connection

1. Click "New Connection" (+ button)
2. Select connection type
3. Enter connection details (host, username, password, etc.)
4. Assign folder & tags (optional)
5. Add notes (optional)
6. Save

### Starting a Connection

- **Double-click** on connection
- Or press **Enter** with connection selected
- Or **Right-click → Connect**

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New connection |
| `Ctrl+F` | Focus search |
| `Enter` | Start selected connection |
| `Delete` | Delete connection |
| `Ctrl+S` | Save changes |
| `Ctrl+L` | Lock application |

## Data Storage

All data is stored locally at:
```
Windows: %APPDATA%\dcm\dcm-data\data.encrypted
```

The file is **AES-256 encrypted** and can only be decrypted with the master password.

### Database File

- User can choose custom location on first start
- Recent file paths are remembered (up to 20)
- Can be moved/backed up manually
- **Make regular backups!**

## Security Features

- ✅ Master password never stored in plaintext
- ✅ All passwords AES-256 encrypted
- ✅ PBKDF2 with 10,000 iterations
- ✅ Random salt per encryption
- ✅ No passwords in logs
- ✅ Secure local storage
- ✅ No cloud/remote storage
- ✅ Full user control over data location

## Client Requirements

Depending on connection type, the following clients are required:

- **SSH**: Windows Terminal (`wt.exe`) - recommended
- **RDP**: `mstsc.exe` (integrated in Windows)
- **VNC**: VNC Viewer (path configurable in settings)
- **AnyDesk**: AnyDesk Client
- **TeamViewer**: TeamViewer Client

## Settings

Access via sidebar settings button:

- **Auto-lock**: Lock app after X minutes of inactivity (0 = disabled)
- **VNC Client Path**: Custom path to VNC viewer executable
- **Theme**: Dark / Light / System
- **Remember Database**: Remember recent database file paths
- **Minimize to Tray**: Hide to system tray when minimizing
- **Close to Tray**: Hide to system tray instead of exiting when closing
- **Start with Windows**: Launch DCM on Windows startup

## System Tray

DCM runs in the system tray when minimized or closed (if enabled in settings):

- **Double-click tray icon**: Show/hide window
- **Right-click tray icon**: Context menu with Show/Hide/Quit options

## Auto-Update

DCM checks for updates:
- On application startup
- Every hour in the background (when running)

Update process:
1. Check for new version on update server
2. Download automatically in background
3. Show notification when ready
4. Prompt to restart and install
5. Update installed on next launch

**Note**: Auto-update only works in production builds, not in development mode.

## Development

```bash
# Start dev server (React)
npm run dev:renderer

# Compile main process
npm run dev:main

# Start both simultaneously
npm run dev

# Build icon from SVG
npm run build:icon
```

## Build

```bash
# Compile renderer + main
npm run build

# Create Windows installer
npm run package:win
```

The installer will be created in the `release/` folder with the following features:
- Custom installation directory selection
- Desktop shortcut creation
- Start menu shortcut
- Uninstaller
- Auto-update support

## Project Structure

```
dcm/
├── src/
│   ├── main/              # Electron Main Process
│   │   ├── index.ts       # Entry point & IPC handlers
│   │   ├── crypto.ts      # AES-256 encryption
│   │   ├── storage.ts     # File management & data persistence
│   │   ├── launcher.ts    # Connection launcher logic
│   │   ├── tray.ts        # System tray & autostart
│   │   ├── updater.ts     # Auto-update functionality
│   │   ├── preload.ts     # IPC bridge (sandbox safe)
│   │   └── types.ts       # TypeScript types (main)
│   ├── renderer/          # React Application
│   │   ├── components/    # React components
│   │   │   ├── Auth/      # Login & disclaimer dialogs
│   │   │   ├── Sidebar/   # Navigation & settings
│   │   │   ├── ConnectionList/
│   │   │   └── ConnectionDetail/
│   │   ├── store/         # Zustand state management
│   │   ├── assets/        # Images & logos
│   │   └── App.tsx        # Main app component
│   └── shared/
│       └── types.ts       # Shared TypeScript types
├── resources/             # App resources
│   ├── icon.ico           # Windows app icon
│   └── icon.svg           # Source SVG logo
├── scripts/
│   └── build-icon.js      # Icon generation script
├── package.json
└── README.md
```

## Implemented Features

- ✅ Multi-protocol connection support (SSH, RDP, VNC, AnyDesk, TeamViewer)
- ✅ AES-256 encryption with master password
- ✅ Folder organization with nested paths
- ✅ Tag system with rename/delete
- ✅ Favorites system
- ✅ Fuzzy search
- ✅ SSH key file selection
- ✅ Auto-lock after inactivity
- ✅ System tray integration
- ✅ Auto-start with Windows
- ✅ Theme support (Dark/Light/System)
- ✅ Auto-update functionality
- ✅ Database file location selection
- ✅ Recent files list
- ✅ Security disclaimer
- ✅ Settings management
- ✅ Custom VNC client path

## Roadmap

- [ ] PuTTY session import
- [ ] Export as CSV/JSON
- [ ] Connection history/statistics
- [ ] Connection groups/profiles
- [ ] Custom themes
- [ ] Backup/restore functionality
- [ ] Connection testing before launch
- [ ] Multi-language support

## Security Notice

**IMPORTANT**: If you lose your master password, your data **cannot be recovered**. There is no backdoor, no password reset, and no way to decrypt the database without the correct password. This is by design to ensure maximum security.

**Recommendations**:
- Choose a strong but memorable master password
- Write down your password in a secure location
- Consider using a password manager
- Create regular backups of your database file

## Update Server Setup

For auto-update functionality, you need to set up an update server. See `UPDATE_SERVER_SETUP.md` for detailed instructions.

Quick setup:
1. Update `package.json` with your update server URL
2. Build the application: `npm run package:win`
3. Upload files from `release/` to your update server:
   - `latest.yml`
   - `DCM - Daniel's Connection Manager Setup X.X.X.exe`
   - `DCM - Daniel's Connection Manager Setup X.X.X.exe.blockmap`

## License

GPL-3.0-only

## Links

- **Homepage**: https://dcm.hillerdaniel.de
- **GitHub**: https://github.com/daniel-hiller/dcm

## Support

For questions or issues, please create an issue on GitHub.

---

**Made with ❤️ by Daniel Hiller**
