import React, { useState, useMemo } from 'react';
import { Search, Plus, Star, BookOpen, Tv, Film, Gamepad2, Headphones, ChevronRight, Share2, HeartCrack, CheckCircle2 } from 'lucide-react';
import { MediaType, MediaItem } from '../../types';
import { useMediaStore } from '../../store';
import { motion, useMotionValue, useTransform } from 'motion/react';

const MOCK_SEARCH_RESULTS: Partial<MediaItem>[] = [
  { id: 's1', title: 'Inception', type: 'movie', posterUrl: 'https://picsum.photos/seed/inception/400/600', creator: 'Christopher Nolan', source: 'tmdb', tags: ['Sci-Fi', 'Heist'] },
  { id: 's2', title: 'The Dark Knight', type: 'movie', posterUrl: 'https://picsum.photos/seed/darkknight/400/600', creator: 'Christopher Nolan', source: 'tmdb', tags: ['Action', 'Crime'] },
  { id: 's3', title: 'Breaking Bad', type: 'tv', posterUrl: 'https://picsum.photos/seed/breakingbad/400/600', creator: 'Vince Gilligan', source: 'trakt', tags: ['Crime', 'Drama'] },
  { id: 's4', title: 'The Great Gatsby', type: 'book', posterUrl: 'https://picsum.photos/seed/gatsby/400/600', creator: 'F. Scott Fitzgerald', source: 'goodreads', tags: ['Classic', 'Drama'] },
  { id: 's5', title: 'Hades II', type: 'game', posterUrl: 'https://picsum.photos/seed/hades/400/600', creator: 'Supergiant Games', source: 'manual', tags: ['Action', 'Roguelike'] },
  { id: 's6', title: 'Midnights', type: 'music', posterUrl: 'https://picsum.photos/seed/midnights/400/600', creator: 'Taylor Swift', source: 'spotify', tags: ['Pop'] },
];

const TypeIcon = ({ type, className }: { type: MediaType, className?: string }) => {
  switch (type) {
    case 'book': return <BookOpen className={className} />;
    case 'tv': return <Tv className={className} />;
    case 'movie': return <Film className={className} />;
    case 'game': return <Gamepad2 className={className} />;
    case 'music': return <Headphones className={className} />;
    default: return <Film className={className} />;
  }
};

export function SearchContent({ onAdd, onTriage }: { onAdd: (item: Partial<MediaItem>) => void, onTriage: (item: Partial<MediaItem>, dir: 'left' | 'right') => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [activeSource, setActiveSource] = useState('All');
  const [activeTag, setActiveTag] = useState('All');
  
  const { activeBackends, items } = useMediaStore();

  const sources = useMemo(() => {
    const base = ['All', 'manual', 'orphan'];
    const plugins = activeBackends.filter(b => b !== 'manual');
    return [...base, ...plugins];
  }, [activeBackends]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [items]);

  const filteredResults = useMemo(() => {
    return MOCK_SEARCH_RESULTS.filter(item => {
      const matchesSearch = !searchQuery.trim() || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.creator?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesType = activeType === 'All' || item.type === activeType;
      const matchesSource = activeSource === 'All' || item.source === activeSource;
      const matchesTag = activeTag === 'All' || (item.tags && item.tags.includes(activeTag));
      
      return matchesSearch && matchesType && matchesSource && matchesTag;
    });
  }, [searchQuery, activeType, activeSource, activeTag]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
        <div className="w-full">
          <header className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-6">
              <h2 className="text-3xl font-bold whitespace-nowrap">Search</h2>
              
              {/* Tag Cloud */}
              <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-hidden max-h-24 py-1">
                <button
                  onClick={() => setActiveTag('All')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${
                    activeTag === 'All'
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  All Tags
                </button>
                {uniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${
                      activeTag === tag
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search global media..." 
                  className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all text-white"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Source Tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto hide-scrollbar">
                {sources.map(source => (
                  <button
                    key={source}
                    onClick={() => setActiveSource(source)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                      activeSource === source 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {source === 'All' ? 'All Sources' : source.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Media Type Tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto hide-scrollbar">
                {[
                  { id: 'All', label: 'All Types' },
                  { id: 'movie', label: 'Films' },
                  { id: 'tv', label: 'TV Shows' },
                  { id: 'book', label: 'Books' },
                  { id: 'comic', label: 'Graphic Novels' },
                  { id: 'game', label: 'Games' },
                  { id: 'music', label: 'Music' },
                  { id: 'stream', label: 'Streams' },
                  { id: 'vid', label: 'Vids' },
                  { id: 'audiobook', label: 'Audiobooks' },
                  { id: 'podcast', label: 'Podcasts' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setActiveType(type.id)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                      activeType === type.id 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map(item => (
              <SearchTriageTile key={item.id} item={item} onAdd={onAdd} onTriage={onTriage} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchTriageTile({ item, onAdd, onTriage }: { item: Partial<MediaItem>, onAdd: (item: Partial<MediaItem>) => void, onTriage: (item: Partial<MediaItem>, dir: 'left' | 'right') => void, key?: any }) {
  const { items } = useMediaStore();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-5, 5]);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  const existingItem = items.find(i => i.title === item.title && i.type === item.type);
  const isTriageable = !existingItem || existingItem.rating === 0;

  const handleDragEnd = (e: any, info: any) => {
    if (!isTriageable) return;
    if (info.offset.x > 100) {
      onTriage(item, 'right');
    } else if (info.offset.x < -100) {
      onTriage(item, 'left');
    }
    x.set(0);
  };

  return (
    <motion.div 
      style={{ 
        x: useTransform(x, [-200, 200], [-10, 10]),
        rotate,
        opacity: isTriageable ? opacity : 0.5,
        scale: useTransform(x, [-200, 0, 200], [0.98, 1, 0.98])
      }}
      onPan={(e, info) => {
        if (isTriageable) x.set(info.offset.x);
      }}
      onPanEnd={(e, info) => {
        if (!isTriageable) {
          x.set(0);
          return;
        }
        if (info.offset.x > 100) {
          onTriage(item, 'right');
        } else if (info.offset.x < -100) {
          onTriage(item, 'left');
        }
        x.set(0);
      }}
      className={`group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-indigo-500/10 relative ${isTriageable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
    >
      {isTriageable && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 z-20 transition-opacity">
          <motion.div 
            style={{ x: useTransform(x, [-100, 0], [0, -10]), opacity: useTransform(x, [-100, 0], [1, 0.4]) }}
            className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500"
          >
            <HeartCrack className="w-5 h-5" />
          </motion.div>
          <motion.div 
            style={{ x: useTransform(x, [0, 100], [10, 0]), opacity: useTransform(x, [0, 100], [0.4, 1]) }}
            className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500"
          >
            <Star className="w-5 h-5" />
          </motion.div>
        </div>
      )}
      <div className="aspect-square bg-zinc-800 relative overflow-hidden">
        {item.posterUrl ? (
          <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <TypeIcon type={item.type as MediaType} className="w-16 h-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <button 
            onClick={() => onAdd(item)}
            className="bg-indigo-600 text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute top-3 left-3 bg-indigo-500/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider z-10">
          {item.source}
        </div>
        {existingItem && (
          <div className="absolute top-3 right-3 bg-emerald-500/80 backdrop-blur-md p-1 rounded-full text-white shadow-lg z-10" title="In Journal">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* Bottom Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12">
          <div className="flex items-center gap-2 text-[10px] text-zinc-300 mb-1 uppercase tracking-wider font-bold">
            <TypeIcon type={item.type as MediaType} className="w-3 h-3" />
            <span>{item.type}</span>
          </div>
          <h3 className="font-bold text-base leading-tight text-white line-clamp-1">{item.title}</h3>
          {item.creator && <p className="text-xs text-zinc-300 mt-0.5 line-clamp-1">{item.creator}</p>}
          
          {/* Tag Pills */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map(tag => (
                <span key={tag} className="text-[8px] font-medium bg-white/10 text-zinc-200 px-1.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
