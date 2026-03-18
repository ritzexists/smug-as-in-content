export type MediaType = 'book' | 'comic' | 'tv' | 'movie' | 'movies' | 'universe' | 'short' | 'stream' | 'vid' | 'game' | 'music' | 'audiobook' | 'podcast';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  source: string; // netflix, goodreads, trakt, manual, etc.
  rating: number; // 0-10
  review?: string;
  consumedDate: string; // ISO string
  posterUrl?: string;
  externalId?: string; // ID from the source
  creator?: string; // Author, Director, etc.
  tags?: string[];
  category?: string;
}

export interface PluginBackend {
  id: string;
  name: string;
  search: (query: string) => Promise<Partial<MediaItem>[]>;
  sync?: () => Promise<MediaItem[]>;
}

export interface ScrobblerPlugin {
  id: string;
  name: string;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  isConnected: boolean;
}
