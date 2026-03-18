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
  
  activePublicBackends: string[];
  togglePublicBackend: (id: string) => void;
  
  activePublicSearchBackends: string[];
  togglePublicSearchBackend: (id: string) => void;
  
  activeScrobblers: string[];
  toggleScrobbler: (id: string) => void;
  
  activeSyncs: string[];
  toggleSync: (id: string) => void;
  
  activeSocials: string[];
  toggleSocial: (id: string) => void;
  
  activeSettingsSyncs: string[];
  toggleSettingsSync: (id: string) => void;
  
  pluginSecrets: Record<string, any>;
  setPluginSecret: (pluginId: string, key: string, value: any) => void;
  getPluginSecret: (pluginId: string, key: string) => any;
  
  autoBackupEnabled: boolean;
  toggleAutoBackup: () => void;
  
  settingsLastModified: number;
  settingsLastExported: number;
  markSettingsExported: () => void;
  
  categories: string[];
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  
  importSettings: (settings: { activeBackends?: string[], activeScrobblers?: string[], activeSyncs?: string[], activeSettingsSyncs?: string[], pluginSecrets?: Record<string, any>, autoBackupEnabled?: boolean, categories?: string[] }) => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set, get) => ({
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
      
      activePublicBackends: [],
      togglePublicBackend: (id) => set((state) => ({
        activePublicBackends: state.activePublicBackends.includes(id) 
          ? state.activePublicBackends.filter(b => b !== id)
          : [...state.activePublicBackends, id],
        settingsLastModified: Date.now()
      })),
      
      activePublicSearchBackends: [],
      togglePublicSearchBackend: (id) => set((state) => ({
        activePublicSearchBackends: state.activePublicSearchBackends.includes(id) 
          ? state.activePublicSearchBackends.filter(b => b !== id)
          : [...state.activePublicSearchBackends, id],
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

      activeSocials: [],
      toggleSocial: (id) => set((state) => ({
        activeSocials: state.activeSocials.includes(id)
          ? state.activeSocials.filter(s => s !== id)
          : [...state.activeSocials, id],
        settingsLastModified: Date.now()
      })),
      
      activeSettingsSyncs: [],
      toggleSettingsSync: (id) => set((state) => ({
        activeSettingsSyncs: state.activeSettingsSyncs.includes(id)
          ? state.activeSettingsSyncs.filter(s => s !== id)
          : [...state.activeSettingsSyncs, id],
        settingsLastModified: Date.now()
      })),
      
      pluginSecrets: {},
      setPluginSecret: (pluginId, key, value) => set((state) => ({
        pluginSecrets: {
          ...state.pluginSecrets,
          [pluginId]: {
            ...(state.pluginSecrets[pluginId] || {}),
            [key]: value
          }
        },
        settingsLastModified: Date.now()
      })),
      getPluginSecret: (pluginId, key) => {
        return get().pluginSecrets[pluginId]?.[key];
      },
      
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
      
      importSettings: (settings: any) => set(() => ({
        activeBackends: settings.activeBackends || [],
        activeScrobblers: settings.activeScrobblers || [],
        activeSyncs: settings.activeSyncs || [],
        activeSettingsSyncs: settings.activeSettingsSyncs || [],
        pluginSecrets: settings.pluginSecrets || {},
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
