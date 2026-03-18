import React, { useState } from 'react';
import { useMediaStore } from '../../store';
import { Database, Radio, Share2, CheckCircle2, XCircle, Cloud, LayoutGrid } from 'lucide-react';
import { RawDownloadModal } from './RawDownloadModal';
import { OpenDataImportModal } from './OpenDataImportModal';
import { GoogleDriveConfigModal } from './GoogleDriveConfigModal';
import { BoxConfigModal } from './BoxConfigModal';
import { WebDAVConfigModal } from './WebDAVConfigModal';
import { S3ConfigModal } from './S3ConfigModal';

const BACKENDS = [
  { id: 'openlibrary', name: 'Open Library', icon: Database, categories: ['book'], hasOpenData: true, hasOpenSearch: true, supportsLogin: true },
  { id: 'mal', name: 'MyAnimeList', icon: Database, categories: ['tv'], hasOpenData: true, hasOpenSearch: true, supportsLogin: true },
  { id: 's3', name: 'S3 Compatible', icon: Database, categories: ['all'], hasOpenData: true, untested: true },
  { id: 'youtube', name: 'YouTube History', icon: Database, categories: ['video', 'music'], untested: true },
  { id: 'tiktok', name: 'TikTok Data Export', icon: Database, categories: ['video'], untested: true },
  { id: 'netflix', name: 'Netflix Viewing Activity', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'amazon', name: 'Amazon / Audible', icon: Database, categories: ['book', 'movie', 'tv', 'game', 'music'], untested: true },
  { id: 'vimeo', name: 'Vimeo', icon: Database, categories: ['video'], hasOpenData: true, supportsLogin: true, untested: true },
  { id: 'tubi', name: 'Tubi', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'max', name: 'Max', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'disneyplus', name: 'Disney+', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'peacock', name: 'Peacock', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'twitch', name: 'Twitch.tv', icon: Database, categories: ['stream'], untested: true },
  { id: 'goodreads', name: 'Goodreads RSS', icon: Database, categories: ['book'], hasOpenData: true, supportsLogin: true, untested: true },
  { id: 'storygraph', name: 'The StoryGraph', icon: Database, categories: ['book'], untested: true },
  { id: 'fable', name: 'Fable', icon: Database, categories: ['book'], untested: true },
  { id: 'bookly', name: 'Bookly', icon: Database, categories: ['book'], untested: true },
  { id: 'bookmory', name: 'Bookmory', icon: Database, categories: ['book'], untested: true },
  { id: 'booksloth', name: 'Booksloth', icon: Database, categories: ['book'], untested: true },
  { id: 'pagebound', name: 'Pagebound', icon: Database, categories: ['book'], untested: true },
  { id: 'trakt', name: 'Trakt.tv API', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'tvdb', name: 'TVDB', icon: Database, categories: ['tv'], untested: true },
  { id: 'tmdb', name: 'TMDB', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'tvmaze', name: 'TVMaze', icon: Database, categories: ['tv'], hasOpenSearch: true, untested: true },
  { id: 'imdb', name: 'IMDb', icon: Database, categories: ['movie', 'tv', 'game'], untested: true },
  { id: 'rottentomatoes', name: 'Rotten Tomatoes', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'metacritic', name: 'Metacritic', icon: Database, categories: ['movie', 'tv', 'game', 'music'], untested: true },
  { id: 'applemusic', name: 'Apple Music / iTunes', icon: Database, categories: ['music', 'podcast', 'movie', 'tv'], hasOpenSearch: true, supportsLogin: true, untested: true },
  { id: 'spotify', name: 'Spotify', icon: Database, categories: ['music', 'podcast'], untested: true },
  { id: 'pandora', name: 'Pandora', icon: Database, categories: ['music', 'podcast'], untested: true },
];

const SCROBBLERS = [
  { id: 'lastfm', name: 'Last.fm', icon: Radio, hasOpenSearch: true, hasOpenData: true, supportsLogin: true, untested: true },
  { id: 'listenbrainz', name: 'ListenBrainz', icon: Radio, hasOpenSearch: true, hasOpenData: true, supportsLogin: true, untested: true },
  { id: 'librefm', name: 'Libre.fm', icon: Radio, hasOpenSearch: true, hasOpenData: true, supportsLogin: true, untested: true },
  { id: 'xbmc', name: 'XBMC / Kodi', icon: Radio, untested: true },
  { id: 'plex', name: 'Plex Webhook', icon: Radio, untested: true },
  { id: 'jellyfin', name: 'Jellyfin Webhook', icon: Radio, untested: true },
  { id: 'emby', name: 'Emby Webhook', icon: Radio, untested: true },
  { id: 'tautulli', name: 'Tautulli Webhook', icon: Radio, untested: true },
  { id: 'webscrobbler', name: 'Web Scrobbler', icon: Radio, untested: true },
];

export const SYNC_BACKENDS = [
  { id: 'google', name: 'Google Drive', icon: Cloud, untested: true },
  { id: 'box', name: 'Box', icon: Cloud, untested: true },
  { id: 's3', name: 'S3 Compatible', icon: Cloud, untested: true },
  { id: 'dav', name: 'WebDAV', icon: Cloud, untested: true },
  { id: 'nextcloud', name: 'Nextcloud', icon: Cloud, untested: true },
  { id: 'raw_download', name: 'Raw Download Backup', icon: Database },
];

const SOCIALS = [
  { id: 'bluesky', name: 'Bluesky', icon: Share2, hasOpenSearch: true, hasOpenData: true, supportsLogin: true, untested: true },
  { id: 'mastodon', name: 'Mastodon', icon: Share2, hasOpenSearch: true, hasOpenData: true, supportsLogin: true, untested: true },
];

type PluginType = 'all' | 'sync' | 'data' | 'scrobblers' | 'social';

export function PluginManager() {
  const { 
    activeBackends, toggleBackend, 
    activePublicBackends, togglePublicBackend,
    activePublicSearchBackends, togglePublicSearchBackend,
    activeScrobblers, toggleScrobbler, 
    activeSyncs, toggleSync,
    activeSocials, toggleSocial
  } = useMediaStore();
  const [activeType, setActiveType] = useState<PluginType>('all');
  const [showRawDownloadModal, setShowRawDownloadModal] = useState(false);
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);
  const [showBoxModal, setShowBoxModal] = useState(false);
  const [showWebDAVModal, setShowWebDAVModal] = useState(false);
  const [showNextcloudModal, setShowNextcloudModal] = useState(false);
  const [showS3Modal, setShowS3Modal] = useState(false);
  const [activeOpenDataPlugin, setActiveOpenDataPlugin] = useState<string | null>(null);

  const tabs: { id: PluginType, label: string, icon: any }[] = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'sync', label: 'Sync', icon: Cloud },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'scrobblers', label: 'Scrobblers', icon: Radio },
    { id: 'social', label: 'Social', icon: Share2 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Plugin Type Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 pb-2 w-full">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className={`items-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-2 rounded-xl text-[10px] sm:text-sm font-bold transition-all border flex-1 sm:flex-none justify-center sm:justify-start min-w-0 ${
              activeType === tab.id
                ? 'hidden sm:flex bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'flex bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {(activeType === 'all' || activeType === 'sync') && (
        <section>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" /> Backup & Sync
            </h3>
            <p className="text-zinc-400 text-sm mt-1">Store replicas of your local journal data to the cloud.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYNC_BACKENDS.map(sync => {
              const isActive = activeSyncs.includes(sync.id);
              return (
                <div 
                  key={sync.id}
                  className={`p-5 rounded-2xl border transition-all ${isActive ? 'bg-blue-500/10 border-blue-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      <sync.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {sync.id === 'raw_download' ? (
                        <button 
                          onClick={() => setShowRawDownloadModal(true)}
                          className="text-sm font-medium px-3 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          Download
                        </button>
                      ) : (sync.id === 'google' || sync.id === 'box' || sync.id === 'dav' || sync.id === 'nextcloud' || sync.id === 's3') ? (
                        <div className="flex flex-col gap-1 w-full">
                          <button 
                            onClick={() => {
                              if (sync.id === 'google') setShowGoogleDriveModal(true);
                              if (sync.id === 'box') setShowBoxModal(true);
                              if (sync.id === 'dav') setShowWebDAVModal(true);
                              if (sync.id === 'nextcloud') setShowNextcloudModal(true);
                              if (sync.id === 's3') setShowS3Modal(true);
                            }}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                          >
                            Configure
                          </button>
                          <button 
                            onClick={() => toggleSync(sync.id)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg text-white transition-colors w-full text-center ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                          >
                            {isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => toggleSync(sync.id)}
                          className={`text-sm font-medium px-3 py-1 rounded-full ${isActive ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                        >
                          {isActive ? 'Syncing' : 'Enable'}
                        </button>
                      )}
                      {sync.untested && (
                        <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5">
                          Untested
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-100">{sync.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {sync.id === 'raw_download' ? 'Download as ZIP' : (isActive ? 'Active replica' : 'Not configured')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(activeType === 'all' || activeType === 'data') && (
        <section>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" /> Data Backends
            </h3>
            <p className="text-zinc-400 text-sm mt-1">Connect services to automatically import your media consumption history.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BACKENDS.map(backend => {
              const isActive = activeBackends.includes(backend.id);
              const isPublicActive = activePublicBackends.includes(backend.id);
              const isPublicSearchActive = activePublicSearchBackends.includes(backend.id);
              return (
                <div 
                  key={backend.id}
                  className={`p-5 rounded-2xl border transition-all ${isActive || isPublicActive || isPublicSearchActive ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${isActive || isPublicActive || isPublicSearchActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      <backend.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full ml-4">
                      {(backend.hasOpenData || backend.hasOpenSearch) ? (
                        <div className="flex flex-row items-start gap-2 w-full justify-end">
                          {backend.hasOpenSearch && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isPublicSearchActive && togglePublicSearchBackend(backend.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isPublicSearchActive ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                              >
                                Public Search
                              </button>
                              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5 whitespace-nowrap">
                                Untested
                              </span>
                              {isPublicSearchActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => {}}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => togglePublicSearchBackend(backend.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {backend.hasOpenData && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isPublicActive && setActiveOpenDataPlugin(backend.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isPublicActive ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                              >
                                Public Sync
                              </button>
                              {isPublicActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => setActiveOpenDataPlugin(backend.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => togglePublicBackend(backend.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {backend.supportsLogin && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isActive && toggleBackend(backend.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                              >
                                Auth Sync
                              </button>
                              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5 whitespace-nowrap">
                                Untested
                              </span>
                              {isActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => {}}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => toggleBackend(backend.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => toggleBackend(backend.id)}
                            className={`text-sm font-medium px-3 py-1 rounded-full ${isActive ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                          >
                            {isActive ? 'Connected' : 'Connect'}
                          </button>
                          {backend.untested && (
                            <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5">
                              Untested
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-100">{backend.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-2 mb-1">
                    {backend.categories.map(cat => (
                      <span key={cat} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isActive ? 'Syncing automatically' : 'Not connected'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(activeType === 'all' || activeType === 'scrobblers') && (
        <section>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400" /> Scrobblers
            </h3>
            <p className="text-zinc-400 text-sm mt-1">Listen to media servers and log plays in real-time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCROBBLERS.map(scrobbler => {
              const isActive = activeScrobblers.includes(scrobbler.id);
              const isPublicActive = activePublicBackends.includes(scrobbler.id);
              const isPublicSearchActive = activePublicSearchBackends.includes(scrobbler.id);
              return (
                <div 
                  key={scrobbler.id}
                  className={`p-5 rounded-2xl border transition-all ${isActive || isPublicActive || isPublicSearchActive ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${isActive || isPublicActive || isPublicSearchActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      <scrobbler.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full ml-4">
                      {(scrobbler.hasOpenData || scrobbler.hasOpenSearch) ? (
                        <div className="flex flex-row items-start gap-2 w-full justify-end">
                          {scrobbler.hasOpenSearch && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isPublicSearchActive && togglePublicSearchBackend(scrobbler.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isPublicSearchActive ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                              >
                                Public Search
                              </button>
                              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5 whitespace-nowrap">
                                Untested
                              </span>
                              {isPublicSearchActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => {}}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => togglePublicSearchBackend(scrobbler.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {scrobbler.hasOpenData && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isPublicActive && setActiveOpenDataPlugin(scrobbler.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isPublicActive ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                              >
                                Public Sync
                              </button>
                              {isPublicActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => setActiveOpenDataPlugin(scrobbler.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => togglePublicBackend(scrobbler.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {scrobbler.supportsLogin && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isActive && toggleScrobbler(scrobbler.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                              >
                                Auth Sync
                              </button>
                              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5 whitespace-nowrap">
                                Untested
                              </span>
                              {isActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => {}}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => toggleScrobbler(scrobbler.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => toggleScrobbler(scrobbler.id)}
                            className={`text-sm font-medium px-3 py-1 rounded-full ${isActive ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                          >
                            {isActive ? 'Active' : 'Enable'}
                          </button>
                          {scrobbler.untested && (
                            <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5">
                              Untested
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-100">{scrobbler.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isActive || isPublicActive || isPublicSearchActive ? 'Listening for plays...' : 'Disabled'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(activeType === 'all' || activeType === 'social') && (
        <section>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" /> Social Sharing
            </h3>
            <p className="text-zinc-400 text-sm mt-1">Configure where your reviews are shared.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIALS.map(social => {
              const isActive = activeSocials.includes(social.id);
              const isPublicActive = activePublicBackends.includes(social.id);
              const isPublicSearchActive = activePublicSearchBackends.includes(social.id);
              return (
                <div 
                  key={social.id}
                  className={`p-5 rounded-2xl border transition-all ${isActive || isPublicActive || isPublicSearchActive ? 'bg-blue-500/10 border-blue-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${isActive || isPublicActive || isPublicSearchActive ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      <social.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full ml-4">
                      {(social.hasOpenData || social.hasOpenSearch) ? (
                        <div className="flex flex-row items-start gap-2 w-full justify-end">
                          {social.hasOpenSearch && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isPublicSearchActive && togglePublicSearchBackend(social.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isPublicSearchActive ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                              >
                                Public Search
                              </button>
                              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5 whitespace-nowrap">
                                Untested
                              </span>
                              {isPublicSearchActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => {}}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => togglePublicSearchBackend(social.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {social.hasOpenData && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isPublicActive && setActiveOpenDataPlugin(social.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isPublicActive ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                              >
                                Public Sync
                              </button>
                              {isPublicActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => setActiveOpenDataPlugin(social.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => togglePublicBackend(social.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {social.supportsLogin && (
                            <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <button 
                                onClick={() => !isActive && toggleSocial(social.id)}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-white transition-colors w-full text-center leading-tight ${isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                              >
                                Auth Sync
                              </button>
                              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5 whitespace-nowrap">
                                Untested
                              </span>
                              {isActive && (
                                <div className="flex flex-col gap-1 w-full">
                                  <button 
                                    onClick={() => {}}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-600 text-white hover:bg-zinc-500 transition-colors w-full text-center"
                                  >
                                    Configure
                                  </button>
                                  <button 
                                    onClick={() => toggleSocial(social.id)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors w-full text-center"
                                  >
                                    Disable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => toggleSocial(social.id)}
                            className={`text-sm font-medium px-3 py-1 rounded-full ${isActive ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                          >
                            {isActive ? 'Active' : 'Enable'}
                          </button>
                          {social.untested && (
                            <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5">
                              Untested
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-100">{social.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isActive || isPublicActive || isPublicSearchActive ? 'Sharing active' : 'Disabled'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {showRawDownloadModal && (
        <RawDownloadModal onClose={() => setShowRawDownloadModal(false)} />
      )}

      {showGoogleDriveModal && (
        <GoogleDriveConfigModal onClose={() => setShowGoogleDriveModal(false)} />
      )}

      {showBoxModal && (
        <BoxConfigModal onClose={() => setShowBoxModal(false)} />
      )}

      {showWebDAVModal && (
        <WebDAVConfigModal onClose={() => setShowWebDAVModal(false)} />
      )}

      {showNextcloudModal && (
        <WebDAVConfigModal 
          onClose={() => setShowNextcloudModal(false)} 
          pluginId="nextcloud"
          title="Nextcloud"
        />
      )}

      {showS3Modal && (
        <S3ConfigModal onClose={() => setShowS3Modal(false)} />
      )}

      {activeOpenDataPlugin && (
        <OpenDataImportModal 
          pluginId={activeOpenDataPlugin} 
          onClose={() => setActiveOpenDataPlugin(null)} 
        />
      )}
    </div>
  );
}
