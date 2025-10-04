# DCM - Daniel's Connection Manager

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Desktop-Anwendung für die Verwaltung von Remote-Verbindungen (SSH, RDP, VNC, AnyDesk, TeamViewer) mit verschlüsselter Passwort-Speicherung.

## Features

✅ **Multi-Protocol Support**
- SSH (mit Key-File Support)
- RDP (Remote Desktop Protocol)
- VNC (Virtual Network Computing)
- AnyDesk
- TeamViewer

✅ **Sicherheit**
- AES-256 Verschlüsselung für alle Passwörter
- Master-Passwort geschützt
- PBKDF2 Key-Derivation
- Verschlüsselte lokale Datenspeicherung

✅ **Organisation**
- Ordnerstruktur für Verbindungen
- Tag-System
- Favoriten
- Fuzzy-Search
- Sortierung & Filterung

✅ **Benutzerfreundlichkeit**
- Moderne React UI mit TailwindCSS
- Dark/Light Mode
- Keyboard Shortcuts
- Drag & Drop
- Schnellstart per Doppelklick

## Tech Stack

- **Framework**: Electron + React + TypeScript
- **UI**: TailwindCSS
- **State**: Zustand
- **Encryption**: crypto-js (AES-256)
- **Build**: Electron Builder

## Installation

### Voraussetzungen
- Node.js >= 18.x
- npm >= 9.x

### Setup

```bash
# Dependencies installieren
npm install

# Development Mode starten
npm run dev

# Production Build erstellen
npm run build
npm run package
```

## Verwendung

### Erster Start

1. Beim ersten Start wird ein **Master-Passwort** abgefragt
2. Dieses Passwort verschlüsselt ALLE Verbindungsdaten
3. **WICHTIG**: Passwort nicht vergessen - Daten können nicht wiederhergestellt werden!

### Verbindung erstellen

1. Klick auf "Neue Verbindung"
2. Verbindungstyp auswählen
3. Daten eingeben (Host, Username, Passwort, etc.)
4. Ordner & Tags zuweisen
5. Speichern

### Verbindung starten

- **Doppelklick** auf Verbindung
- Oder **Enter** bei ausgewählter Verbindung
- Oder **Rechtsklick → Verbinden**

## Keyboard Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `Ctrl+N` | Neue Verbindung |
| `Ctrl+F` | Suche fokussieren |
| `Enter` | Ausgewählte Verbindung starten |
| `Delete` | Verbindung löschen |
| `Ctrl+S` | Änderungen speichern |

## Datenspeicherung

Alle Daten werden lokal gespeichert unter:
```
Windows: %APPDATA%\dcm-data\data.encrypted
```

Die Datei ist **AES-256 verschlüsselt** und kann nur mit dem Master-Passwort entschlüsselt werden.

## Sicherheits-Features

- ✅ Master-Passwort niemals im Klartext gespeichert
- ✅ Alle Passwörter AES-256 verschlüsselt
- ✅ PBKDF2 mit 10.000 Iterationen
- ✅ Zufälliger Salt pro Verschlüsselung
- ✅ Keine Passwörter in Logs
- ✅ Sichere Speicherung

## Client-Anforderungen

Je nach Verbindungstyp werden folgende Clients benötigt:

- **SSH**: Windows Terminal (`wt.exe`) - empfohlen
- **RDP**: `mstsc.exe` (in Windows integriert)
- **VNC**: VNC Viewer (konfigurierbar)
- **AnyDesk**: AnyDesk Client
- **TeamViewer**: TeamViewer Client

## Development

```bash
# Dev Server starten (React)
npm run dev:renderer

# Main Process kompilieren
npm run dev:main

# Beide gleichzeitig
npm run dev
```

## Build

```bash
# Renderer + Main kompilieren
npm run build

# Windows Installer erstellen
npm run package:win
```

## Projektstruktur

```
dcm/
├── src/
│   ├── main/           # Electron Main Process
│   │   ├── index.ts    # Entry Point
│   │   ├── crypto.ts   # AES-256 Encryption
│   │   ├── storage.ts  # File Management
│   │   ├── launcher.ts # Connection Launcher
│   │   └── preload.ts  # IPC Bridge
│   ├── renderer/       # React App
│   │   ├── components/
│   │   ├── store/
│   │   └── App.tsx
│   └── shared/
│       └── types.ts    # Shared TypeScript Types
├── package.json
└── README.md
```

## Roadmap

- [ ] Import von PuTTY Sessions
- [ ] Export als CSV/JSON
- [ ] Auto-Lock nach Inaktivität
- [ ] Verbindungshistorie
- [ ] Verbindungs-Gruppen
- [ ] Custom Themes

## Lizenz

MIT License - siehe LICENSE Datei

## Support

Bei Fragen oder Problemen bitte ein Issue erstellen.

---

**Made with ❤️ by Daniel**
