import { create } from 'zustand';
import type { AppData, Connection, Folder, AppSettings } from '@shared/types';

interface ConnectionStore {
  // State
  connections: Connection[];
  folders: Folder[];
  tags: string[];
  selectedConnection: Connection | null;
  searchQuery: string;
  selectedTags: string[];
  selectedFolder: string | null;
  showFavoritesOnly: boolean;
  sortBy: 'name' | 'lastUsed' | 'type';
  masterPassword: string | null;
  isAuthenticated: boolean;
  settings: AppSettings;

  // Actions
  setData: (data: AppData) => void;
  setMasterPassword: (password: string) => void;
  logout: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Connections
  addConnection: (connection: Connection) => void;
  updateConnection: (connection: Connection) => void;
  deleteConnection: (id: string) => void;
  selectConnection: (connection: Connection | null) => void;
  toggleFavorite: (id: string) => void;
  updateLastUsed: (id: string) => void;

  // Folders
  addFolder: (folder: Folder) => void;
  updateFolder: (path: string, updates: Partial<Folder>) => void;
  deleteFolder: (path: string) => void;
  toggleFolderExpanded: (path: string) => void;

  // Tags
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  renameTag: (oldTag: string, newTag: string) => void;

  // Filters
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedFolder: (folder: string | null) => void;
  toggleShowFavoritesOnly: () => void;
  setSortBy: (sortBy: 'name' | 'lastUsed' | 'type') => void;

  // Computed
  getFilteredConnections: () => Connection[];
  saveToBackend: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  // Initial State
  connections: [],
  folders: [{ path: '/', name: 'Root', expanded: true }],
  tags: [],
  selectedConnection: null,
  searchQuery: '',
  selectedTags: [],
  selectedFolder: null,
  showFavoritesOnly: false,
  sortBy: 'name',
  masterPassword: null,
  isAuthenticated: false,
  settings: {
    defaultFolder: '/',
    theme: 'dark',
    autoLockMinutes: 15,
    rememberDatabase: true,
  },

  // Set data from backend
  setData: (data: AppData) => set({
    connections: data.connections,
    folders: data.folders,
    tags: data.tags,
  }),

  // Authentication
  setMasterPassword: (password: string) => set({
    masterPassword: password,
    isAuthenticated: true,
  }),

  logout: () => set({
    masterPassword: null,
    isAuthenticated: false,
    connections: [],
    folders: [{ path: '/', name: 'Root', expanded: true }],
    tags: [],
    selectedConnection: null,
  }),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),

  // Connection Management
  addConnection: (connection: Connection) => set((state) => ({
    connections: [...state.connections, connection],
    tags: Array.from(new Set([...state.tags, ...connection.tags])),
  })),

  updateConnection: (connection: Connection) => set((state) => ({
    connections: state.connections.map((c) =>
      c.id === connection.id ? connection : c
    ),
    tags: Array.from(new Set([...state.tags, ...connection.tags])),
  })),

  deleteConnection: (id: string) => set((state) => ({
    connections: state.connections.filter((c) => c.id !== id),
    selectedConnection: state.selectedConnection?.id === id ? null : state.selectedConnection,
  })),

  selectConnection: (connection: Connection | null) => set({
    selectedConnection: connection,
  }),

  toggleFavorite: (id: string) => set((state) => ({
    connections: state.connections.map((c) =>
      c.id === id ? { ...c, favorite: !c.favorite } : c
    ),
  })),

  updateLastUsed: (id: string) => set((state) => ({
    connections: state.connections.map((c) =>
      c.id === id ? { ...c, lastUsed: new Date() } : c
    ),
  })),

  // Folder Management
  addFolder: (folder: Folder) => set((state) => ({
    folders: [...state.folders, folder],
  })),

  updateFolder: (path: string, updates: Partial<Folder>) => set((state) => ({
    folders: state.folders.map((f) =>
      f.path === path ? { ...f, ...updates } : f
    ),
  })),

  deleteFolder: (path: string) => set((state) => ({
    folders: state.folders.filter((f) => f.path !== path),
    connections: state.connections.map((c) =>
      c.folder === path ? { ...c, folder: '/' } : c
    ),
  })),

  toggleFolderExpanded: (path: string) => set((state) => ({
    folders: state.folders.map((f) =>
      f.path === path ? { ...f, expanded: !f.expanded } : f
    ),
  })),

  // Tag Management
  addTag: (tag: string) => set((state) => ({
    tags: Array.from(new Set([...state.tags, tag])),
  })),

  removeTag: (tag: string) => set((state) => ({
    tags: state.tags.filter((t) => t !== tag),
    connections: state.connections.map((c) => ({
      ...c,
      tags: c.tags.filter((t) => t !== tag),
    })),
  })),

  renameTag: (oldTag: string, newTag: string) => set((state) => ({
    tags: state.tags.map((t) => (t === oldTag ? newTag : t)),
    connections: state.connections.map((c) => ({
      ...c,
      tags: c.tags.map((t) => (t === oldTag ? newTag : t)),
    })),
  })),

  // Filters
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  setSelectedTags: (tags: string[]) => set({ selectedTags: tags }),
  
  setSelectedFolder: (folder: string | null) => set({ selectedFolder: folder }),
  
  toggleShowFavoritesOnly: () => set((state) => ({
    showFavoritesOnly: !state.showFavoritesOnly,
  })),
  
  setSortBy: (sortBy: 'name' | 'lastUsed' | 'type') => set({ sortBy }),

  // Get filtered connections
  getFilteredConnections: () => {
    const state = get();
    let filtered = [...state.connections];

    // Filter by folder
    if (state.selectedFolder) {
      filtered = filtered.filter((c) => c.folder === state.selectedFolder);
    }

    // Filter by tags
    if (state.selectedTags.length > 0) {
      filtered = filtered.filter((c) =>
        state.selectedTags.every((tag) => c.tags.includes(tag))
      );
    }

    // Filter by favorites
    if (state.showFavoritesOnly) {
      filtered = filtered.filter((c) => c.favorite);
    }

    // Filter by search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.host.toLowerCase().includes(query) ||
          c.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          (c.username && c.username.toLowerCase().includes(query)) ||
          (c.notes && c.notes.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastUsed':
          if (!a.lastUsed && !b.lastUsed) return 0;
          if (!a.lastUsed) return 1;
          if (!b.lastUsed) return -1;
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  },

  // Save to backend
  saveToBackend: async () => {
    const state = get();
    if (!state.masterPassword) {
      throw new Error('Not authenticated');
    }

    const data: AppData = {
      connections: state.connections,
      folders: state.folders,
      tags: state.tags,
    };

    const result = await window.electronAPI.saveConnections(data, state.masterPassword);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save');
    }
  },
}));
