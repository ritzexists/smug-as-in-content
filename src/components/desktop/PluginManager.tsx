import React, { useState } from 'react';
import { useMediaStore } from '../../store';
import { Database, Radio, Share2, CheckCircle2, XCircle, Cloud, LayoutGrid } from 'lucide-react';

const BACKENDS = [
  { id: 'youtube', name: 'YouTube History', icon: Database, categories: ['video', 'music'], untested: true },
  { id: 'tiktok', name: 'TikTok Data Export', icon: Database, categories: ['video'], untested: true },
  { id: 'netflix', name: 'Netflix Viewing Activity', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'amazon', name: 'Amazon / Audible', icon: Database, categories: ['book', 'movie', 'tv', 'game', 'music'], untested: true },
  { id: 'vimeo', name: 'Vimeo', icon: Database, categories: ['video'], untested: true },
  { id: 'tubi', name: 'Tubi', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'max', name: 'Max', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'disneyplus', name: 'Disney+', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'peacock', name: 'Peacock', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'twitch', name: 'Twitch.tv', icon: Database, categories: ['stream'], untested: true },
  { id: 'goodreads', name: 'Goodreads RSS', icon: Database, categories: ['book'], untested: true },
  { id: 'storygraph', name: 'The StoryGraph', icon: Database, categories: ['book'], untested: true },
  { id: 'fable', name: 'Fable', icon: Database, categories: ['book'], untested: true },
  { id: 'bookly', name: 'Bookly', icon: Database, categories: ['book'], untested: true },
  { id: 'bookmory', name: 'Bookmory', icon: Database, categories: ['book'], untested: true },
  { id: 'booksloth', name: 'Booksloth', icon: Database, categories: ['book'], untested: true },
  { id: 'pagebound', name: 'Pagebound', icon: Database, categories: ['book'], untested: true },
  { id: 'trakt', name: 'Trakt.tv API', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'tvdb', name: 'TVDB', icon: Database, categories: ['tv'], untested: true },
  { id: 'tmdb', name: 'TMDB', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'imdb', name: 'IMDb', icon: Database, categories: ['movie', 'tv', 'game'], untested: true },
  { id: 'rottentomatoes', name: 'Rotten Tomatoes', icon: Database, categories: ['movie', 'tv'], untested: true },
  { id: 'metacritic', name: 'Metacritic', icon: Database, categories: ['movie', 'tv', 'game', 'music'], untested: true },
  { id: 'applemusic', name: 'Apple Music', icon: Database, categories: ['music'], untested: true },
  { id: 'spotify', name: 'Spotify', icon: Database, categories: ['music', 'podcast'], untested: true },
  { id: 'pandora', name: 'Pandora', icon: Database, categories: ['music', 'podcast'], untested: true },
];

const SCROBBLERS = [
  { id: 'xbmc', name: 'XBMC / Kodi', icon: Radio, untested: true },
  { id: 'plex', name: 'Plex Webhook', icon: Radio, untested: true },
];

const SYNC_BACKENDS = [
  { id: 'google', name: 'Google Drive', icon: Cloud, untested: true },
  { id: 'box', name: 'Box', icon: Cloud, untested: true },
  { id: 'dav', name: 'WebDAV', icon: Cloud, untested: true },
  { id: 'nextcloud', name: 'Nextcloud', icon: Cloud, untested: true },
  { id: 'raw_download', name: 'Raw Download Backup', icon: Database, untested: true },
];

const SOCIALS = [
  { id: 'bluesky', name: 'Bluesky', icon: Share2, untested: true },
  { id: 'mastodon', name: 'Mastodon', icon: Share2, untested: true },
];

type PluginType = 'all' | 'sync' | 'data' | 'scrobblers' | 'social';

export function PluginManager() {
  const { activeBackends, toggleBackend, activeScrobblers, toggleScrobbler, activeSyncs, toggleSync } = useMediaStore();
  const [activeType, setActiveType] = useState<PluginType>('all');

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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
              activeType === tab.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
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
                      <button 
                        onClick={() => toggleSync(sync.id)}
                        className={`text-sm font-medium px-3 py-1 rounded-full ${isActive ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                      >
                        {isActive ? 'Syncing' : 'Enable'}
                      </button>
                      {sync.untested && (
                        <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5">
                          Untested
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-100">{sync.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isActive ? 'Active replica' : 'Not configured'}
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
              return (
                <div 
                  key={backend.id}
                  className={`p-5 rounded-2xl border transition-all ${isActive ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      <backend.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
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
              return (
                <div 
                  key={scrobbler.id}
                  className={`p-5 rounded-2xl border transition-all ${isActive ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      <scrobbler.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
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
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-100">{scrobbler.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isActive ? 'Listening for plays...' : 'Disabled'}
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
            {SOCIALS.map(social => (
              <div key={social.id} className="p-5 rounded-2xl border bg-zinc-900 border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                      <social.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-zinc-100">{social.name}</h4>
                  </div>
                  {social.untested && (
                    <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/5">
                      Untested
                    </span>
                  )}
                </div>
                <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors">
                  Configure
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
