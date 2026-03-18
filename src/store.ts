import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaItem } from './types';
import { v4 as uuidv4 } from 'uuid';

interface MediaStore {
  items: MediaItem[];
  addItem: (item: Omit<MediaItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteItem: (id: string) => void;
  
  // Plugin states
  activeBackends: string[];
  toggleBackend: (id: string) => void;
  
  activeScrobblers: string[];
  toggleScrobbler: (id: string) => void;
  
  activeSyncs: string[];
  toggleSync: (id: string) => void;
  
  autoBackupEnabled: boolean;
  toggleAutoBackup: () => void;
  
  settingsLastModified: number;
  settingsLastExported: number;
  markSettingsExported: () => void;
  
  categories: string[];
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  
  importSettings: (settings: { activeBackends: string[], activeScrobblers: string[], activeSyncs: string[], autoBackupEnabled?: boolean, categories?: string[] }) => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ 
        items: [{ ...item, id: uuidv4() }, ...state.items] 
      })),
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      
      settingsLastModified: Date.now(),
      settingsLastExported: Date.now(),
      markSettingsExported: () => set({ settingsLastExported: Date.now() }),

      activeBackends: ['manual'],
      toggleBackend: (id) => set((state) => ({
        activeBackends: state.activeBackends.includes(id) 
          ? state.activeBackends.filter(b => b !== id)
          : [...state.activeBackends, id],
        settingsLastModified: Date.now()
      })),
      
      activeScrobblers: [],
      toggleScrobbler: (id) => set((state) => ({
        activeScrobblers: state.activeScrobblers.includes(id)
          ? state.activeScrobblers.filter(s => s !== id)
          : [...state.activeScrobblers, id],
        settingsLastModified: Date.now()
      })),
      
      activeSyncs: [],
      toggleSync: (id) => set((state) => ({
        activeSyncs: state.activeSyncs.includes(id)
          ? state.activeSyncs.filter(s => s !== id)
          : [...state.activeSyncs, id],
        settingsLastModified: Date.now()
      })),
      
      autoBackupEnabled: false,
      toggleAutoBackup: () => set((state) => ({
        autoBackupEnabled: !state.autoBackupEnabled,
        settingsLastModified: Date.now()
      })),
      
      categories: ['Favorites', 'Wishlist', 'Completed'],
      addCategory: (name) => set((state) => ({
        categories: state.categories.includes(name) ? state.categories : [...state.categories, name],
        settingsLastModified: Date.now()
      })),
      removeCategory: (name) => set((state) => ({
        categories: state.categories.filter(c => c !== name),
        settingsLastModified: Date.now()
      })),
      
      importSettings: (settings) => set(() => ({
        activeBackends: settings.activeBackends || [],
        activeScrobblers: settings.activeScrobblers || [],
        activeSyncs: settings.activeSyncs || [],
        autoBackupEnabled: settings.autoBackupEnabled || false,
        categories: settings.categories || ['Favorites', 'Wishlist', 'Completed'],
        settingsLastModified: Date.now()
      }))
    }),
    {
      name: 'media-log-storage',
    }
  )
);
