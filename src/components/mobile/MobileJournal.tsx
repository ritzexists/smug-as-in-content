import React, { useState } from 'react';
import { useMediaStore } from '../../store';
import { format } from 'date-fns';
import { 
  Star, BookOpen, Tv, Film, Gamepad2, Headphones, X, Plus, 
  LayoutGrid, CheckCircle2, Calendar, PlayCircle, XCircle, Folder,
  Radio, Video, Library, Mic, ChevronDown, ChevronUp, Globe, HeartCrack
} from 'lucide-react';
import { MediaType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const TypeIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'book': return <BookOpen className={className} />;
    case 'tv': return <Tv className={className} />;
    case 'movie': return <Film className={className} />;
    case 'movies': return <Film className={className} />;
    case 'universe': return <Globe className={className} />;
    case 'game': return <Gamepad2 className={className} />;
    case 'music': return <Headphones className={className} />;
    case 'stream': return <Radio className={className} />;
    case 'vid': return <Video className={className} />;
    case 'comic': return <Library className={className} />;
    case 'audiobook': return <Headphones className={className} />;
    case 'podcast': return <Mic className={className} />;
    default: return <Film className={className} />;
  }
};

const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  const cat = category.toLowerCase();
  if (cat === 'all') return <LayoutGrid className={className} />;
  if (cat.includes('complete')) return <CheckCircle2 className={className} />;
  if (cat.includes('plan') || cat.includes('queue')) return <Calendar className={className} />;
  if (cat.includes('watch') || cat.includes('read') || cat.includes('play') || cat.includes('current')) return <PlayCircle className={className} />;
  if (cat.includes('drop')) return <XCircle className={className} />;
  return <Folder className={className} />;
};

export function MobileJournal({ searchQuery, onSelect, onClose }: { searchQuery: string, onSelect: (id: string) => void, onClose: () => void }) {
  const { items, categories, addCategory } = useMediaStore();
  const [activeCategory, setActiveCategory] = React.useState<string>('All');
  const [activeType, setActiveType] = React.useState<string>('All');
  const [activeTag, setActiveTag] = React.useState<string>('All');
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  
  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [items]);
  
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesType = activeType === 'All' || item.type === activeType;
    const matchesTag = activeTag === 'All' || (item.tags && item.tags.includes(activeTag));
    
    return matchesSearch && matchesCategory && matchesType && matchesTag;
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim() && newCategoryName.trim() !== 'All') {
      addCategory(newCategoryName.trim());
      setActiveCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const mediaTypes = [
    { id: 'All', label: 'All' },
    { id: 'movie', label: 'Films' },
    { id: 'movies', label: 'Movies' },
    { id: 'universe', label: 'Universes' },
    { id: 'tv', label: 'TV' },
    { id: 'book', label: 'Books' },
    { id: 'comic', label: 'Graphic Novels' },
    { id: 'game', label: 'Games' },
    { id: 'music', label: 'Music' },
    { id: 'stream', label: 'Streams' },
    { id: 'vid', label: 'Vids' },
    { id: 'audiobook', label: 'Audiobooks' },
    { id: 'podcast', label: 'Podcasts' }
  ];

  // Split media types into two rows
  const mediaTypeRows = [
    mediaTypes.slice(0, Math.ceil(mediaTypes.length / 2)),
    mediaTypes.slice(Math.ceil(mediaTypes.length / 2))
  ];

  return (
    <div className="h-full flex flex-col relative">
      <div className="shrink-0 pt-4 pb-2 px-4 border-b border-zinc-900 flex flex-col gap-4">
        {/* Status Tabs */}
        <div id="mobile-status-tabs" className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveCategory('All')}
            className={`p-2.5 rounded-xl transition-all ${
              activeCategory === 'All' 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-110' 
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
            }`}
          >
            <CategoryIcon category="All" className="w-5 h-5" />
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`p-2.5 rounded-xl transition-all ${
                activeCategory === cat 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-110' 
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}
            >
              <CategoryIcon category={cat} className="w-5 h-5" />
            </button>
          ))}
          
          {isAddingCategory ? (
            <form onSubmit={handleAddCategory} className="flex items-center">
              <input
                type="text"
                autoFocus
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onBlur={() => setIsAddingCategory(false)}
                placeholder="..."
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-20"
              />
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="p-2.5 rounded-xl bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Media Type Tabs (Doubled Up & Different Color) */}
        <div id="mobile-media-tabs" className="flex flex-col gap-1">
          {mediaTypeRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
              {row.map(type => (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`p-2.5 rounded-xl transition-all ${
                    activeType === type.id 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' 
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {type.id === 'All' ? <LayoutGrid className="w-5 h-5" /> : <TypeIcon type={type.id} className="w-5 h-5" />}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Tag Cloud */}
        {uniqueTags.length > 0 && (
          <div id="mobile-tag-cloud" className="flex flex-col">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Tags</span>
              <button 
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                {isTagsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <motion.div 
              animate={{ 
                height: isTagsExpanded ? 'auto' : 0, 
                opacity: isTagsExpanded ? 1 : 0,
                marginBottom: isTagsExpanded ? 8 : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveTag('All')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    activeTag === 'All'
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  All
                </button>
                {uniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                      activeTag === tag
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center">
            <Film className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium text-zinc-300 mb-2">Your journal is empty</p>
            <p className="text-sm">Swipe right on items in Discover to add them to your journal.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.id)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex h-32 active:scale-[0.98] transition-transform"
            >
              <div className="w-24 shrink-0 bg-zinc-800 relative">
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <TypeIcon type={item.type} className="w-8 h-8" />
                  </div>
                )}
                {item.rating === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-around px-1">
                    <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500">
                      <HeartCrack className="w-4 h-4" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <TypeIcon type={item.type} className="w-3 h-3" />
                      <span>{item.type}</span>
                    </div>
                    {item.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        {item.rating}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white leading-tight line-clamp-1">{item.title}</h3>
                  {item.creator && <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{item.creator}</p>}
                  
                  {/* Tag & Plugin Pills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[8px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase tracking-tighter">
                      {item.source}
                    </span>
                    {item.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[8px] font-medium bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="text-[9px] text-zinc-600 font-medium">
                    {format(new Date(item.consumedDate), 'MMM d, yyyy')}
                  </div>
                  {item.category && (
                    <div className="text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-700">
                      {item.category}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={onClose}
        className="absolute bottom-6 right-6 w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center shadow-xl border border-zinc-700 text-zinc-400 hover:text-white z-10"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}
