import React, { useState, useMemo, useEffect } from 'react';
import { Book, Film, Tv, Gamepad2, Music, Settings, Share2, Plus, Search, X, HelpCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMediaStore } from '../store';
import { usePWA } from '../lib/pwa';
import { MediaGrid } from './desktop/MediaGrid';
import { ReviewEditor } from './desktop/ReviewEditor';
import { PluginManager } from './desktop/PluginManager';
import { SearchContent } from './desktop/SearchContent';
import { SettingsManager } from './SettingsManager';
import { HelpManager } from './HelpManager';
import { TutorialOverlay } from './TutorialOverlay';
import { Logo } from './Logo';
import { RatingRing, ActionRing } from './mobile/RingMenus';
import { MediaItem } from '../types';
import { syncToS3 } from '../services/s3Sync';

export default function DesktopView() {
  const [activeTab, setActiveTab] = useState<'journal' | 'plugins' | 'settings' | 'search' | 'help'>('journal');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [activeTag, setActiveTag] = useState('All');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [ringConfig, setRingConfig] = useState<{
    show: 'rating' | 'actions' | null,
    type: 'stars' | 'hearts',
    item: Partial<MediaItem> | null,
    rating?: number
  }>({ show: null, type: 'stars', item: null });

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  const { items, categories, addCategory, addItem, updateItem, settingsLastModified, settingsLastExported } = useMediaStore();
  const { isPWA, canInstall, installPWA } = usePWA();
  
  const handleTriage = (item: Partial<MediaItem>, dir: 'left' | 'right') => {
    setRingConfig({
      show: 'rating',
      type: dir === 'right' ? 'stars' : 'hearts',
      item
    });
  };

  const handleRate = (rating: number) => {
    setRingConfig(prev => ({ ...prev, show: 'actions', rating }));
  };

  const handleAction = (action: 'data' | 'review' | 'social' | 'skip') => {
    if (ringConfig.item && ringConfig.rating !== undefined) {
      if (ringConfig.item.id && items.find(i => i.id === ringConfig.item?.id)) {
        // Existing item in journal
        updateItem(ringConfig.item.id, {
          rating: ringConfig.rating * 2
        });
      } else {
        // New item from search
        addItem({
          title: ringConfig.item.title!,
          type: ringConfig.item.type!,
          rating: ringConfig.rating * 2,
          source: ringConfig.item.source!,
          consumedDate: new Date().toISOString(),
          posterUrl: ringConfig.item.posterUrl,
          creator: ringConfig.item.creator,
        });
      }

      if (action === 'data' || action === 'review') {
        // Open editor logic could go here
      }
    }
    setRingConfig({ show: null, type: 'stars', item: null });
  };
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery.trim() || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.creator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.review?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesType = activeType === 'All' || item.type === activeType;
      const matchesTag = activeTag === 'All' || (item.tags && item.tags.includes(activeTag));
      
      return matchesSearch && matchesCategory && matchesType && matchesTag;
    });
  }, [items, searchQuery, activeCategory, activeType, activeTag]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim() && newCategoryName.trim() !== 'All') {
      addCategory(newCategoryName.trim());
      setActiveCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleAddFromSearch = (item: any) => {
    addItem({
      ...item,
      rating: 0,
      review: '',
      consumedDate: new Date().toISOString(),
    });
    setActiveTab('journal');
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Unsaved Settings Banner */}
      {settingsLastModified > settingsLastExported && activeTab !== 'settings' && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black py-1 px-4 text-center text-xs font-bold z-[60] flex items-center justify-center gap-2">
          <span>You have unsaved settings changes.</span>
          <button 
            onClick={() => setActiveTab('settings')}
            className="underline hover:no-underline"
          >
            Go to Settings
          </button>
        </div>
      )}

      {/* Sidebar Toggle Bar */}
      {!isSidebarOpen && (
        <div
          onMouseEnter={() => setIsSidebarOpen(true)}
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-0 left-0 bottom-0 w-3 hover:w-6 bg-[#002b36]/40 hover:bg-[#073642]/60 border-r border-[#268bd2]/20 hover:border-[#268bd2]/40 z-40 cursor-pointer transition-all group flex items-center justify-center"
          title="Open Sidebar"
        >
          <div className="w-1 h-24 bg-[#268bd2]/30 group-hover:bg-[#268bd2]/60 rounded-full transition-colors" />
        </div>
      )}

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              onMouseLeave={() => setIsSidebarOpen(false)}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-[#002b36] backdrop-blur-xl border-r border-[#268bd2]/30 flex flex-col z-50 shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between">
                <Logo />
              </div>
              
              <nav id="sidebar-nav" className="flex-1 px-4 space-y-2 mt-4">
                <button 
                  onClick={() => { setActiveTab('journal'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'journal' ? 'bg-[#268bd2]/20 text-[#268bd2]' : 'text-[#839496] hover:text-[#268bd2] hover:bg-[#268bd2]/10'}`}
                >
                  <Book className="w-5 h-5" /> Journal
                </button>
                <button 
                  onClick={() => { setActiveTab('plugins'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'plugins' ? 'bg-[#d33682]/20 text-[#d33682]' : 'text-[#839496] hover:text-[#d33682] hover:bg-[#d33682]/10'}`}
                >
                  <Share2 className="w-5 h-5" /> Plugins & Sync
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-[#586e75]/20 text-[#93a1a1]' : 'text-[#839496] hover:text-[#93a1a1] hover:bg-[#586e75]/10'}`}
                >
                  <Settings className="w-5 h-5" /> Settings
                </button>
                <button 
                  onClick={() => { setActiveTab('help'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'help' ? 'bg-[#b58900]/20 text-[#b58900]' : 'text-[#839496] hover:text-[#b58900] hover:bg-[#b58900]/10'}`}
                >
                  <HelpCircle className="w-5 h-5" /> Help & Tutorial
                </button>
              </nav>
              
              <div className="px-4 mb-2">
                {!isPWA && canInstall && (
                  <button 
                    onClick={installPWA}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 px-4 py-2 rounded-lg font-medium transition-colors border border-indigo-500/30 mb-2"
                  >
                    <Download className="w-5 h-5" /> Install App
                  </button>
                )}
              </div>

              <div className="p-4 border-t border-[#073642] space-y-2">
                <button 
                  id="search-button"
                  onClick={() => { setActiveTab('search'); setIsCreating(false); setSelectedItemId(null); setIsSidebarOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-[#268bd2]/10 hover:bg-[#268bd2]/20 text-[#268bd2] px-4 py-2 rounded-lg font-medium transition-colors border border-[#268bd2]/30"
                >
                  <Search className="w-5 h-5" /> Search Content
                </button>
                <button 
                  id="add-entry-button"
                  onClick={() => { setIsCreating(true); setSelectedItemId(null); setActiveTab('journal'); setIsSidebarOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-[#859900]/20 hover:bg-[#859900]/30 text-[#859900] px-4 py-2 rounded-lg font-medium transition-colors border border-[#859900]/30"
                >
                  <Plus className="w-5 h-5" /> Add Entry
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {activeTab === 'journal' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
              <div className="w-full">
                <header id="journal-header" className="flex flex-col gap-6 mb-8">
                  <div className="flex items-center gap-6">
                    <h2 className="text-3xl font-bold whitespace-nowrap">Journal</h2>
                    
                    {/* Tag Cloud */}
                    <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-hidden max-h-24 py-1">
                      <button
                        onClick={() => setActiveTag('All')}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${
                          activeTag === 'All'
                            ? 'bg-[#268bd2]/20 border-[#268bd2]/50 text-[#268bd2]'
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
                              ? 'bg-[#268bd2]/20 border-[#268bd2]/50 text-[#268bd2]'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Search Bubble */}
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search entries..." 
                        className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#268bd2]/50 w-64 transition-all text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Status Tabs (Categories) */}
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto hide-scrollbar">
                      <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                          activeCategory === 'All' 
                            ? 'border-[#268bd2] text-[#268bd2]' 
                            : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        All Status
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                            activeCategory === cat 
                              ? 'border-[#268bd2] text-[#268bd2]' 
                              : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                      
                      {isAddingCategory ? (
                        <form onSubmit={handleAddCategory} className="flex items-center ml-2">
                          <input
                            type="text"
                            autoFocus
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onBlur={() => setIsAddingCategory(false)}
                            placeholder="New..."
                            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-[#268bd2] w-24"
                          />
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsAddingCategory(true)}
                          className="px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 ml-2 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      )}
                    </div>

                    {/* Media Type Tabs */}
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto hide-scrollbar">
                      {[
                        { id: 'All', label: 'All Types' },
                        { id: 'movie', label: 'Films' },
                        { id: 'movies', label: 'Movies' },
                        { id: 'universe', label: 'Universes' },
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
                              ? 'border-[#268bd2] text-[#268bd2]' 
                              : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </header>
                <MediaGrid items={filteredItems} onSelect={setSelectedItemId} onTriage={handleTriage} />
              </div>
            </div>
            
            {/* Right Sidebar for Editor */}
            {(selectedItemId || isCreating) && (
              <div className="w-96 bg-zinc-900 border-l border-zinc-800 overflow-y-auto">
                <ReviewEditor 
                  itemId={selectedItemId} 
                  onClose={() => { setSelectedItemId(null); setIsCreating(false); }} 
                />
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'search' && (
          <SearchContent onAdd={handleAddFromSearch} onTriage={handleTriage} />
        )}

        {activeTab === 'plugins' && (
          <div className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
            <div className="w-full">
              <h2 className="text-3xl font-bold mb-8">Plugins & Integrations</h2>
              <PluginManager />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
            <div className="w-full">
              <h2 className="text-3xl font-bold mb-8">Settings</h2>
              <SettingsManager />
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="flex-1 overflow-y-auto p-8 pt-20 lg:pt-8">
            <div className="w-full max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Help & Tutorial</h2>
              <HelpManager onStartTutorial={() => setShowTutorial(true)} />
            </div>
          </div>
        )}
      </main>

      {showTutorial && (
        <TutorialOverlay isMobile={false} onComplete={completeTutorial} />
      )}

      {ringConfig.show === 'rating' && (
        <RatingRing 
          type={ringConfig.type} 
          onRate={handleRate} 
          onCancel={() => setRingConfig({ show: null, type: 'stars', item: null })} 
        />
      )}

      {ringConfig.show === 'actions' && (
        <ActionRing 
          onAction={handleAction}
          onBack={() => setRingConfig(prev => ({ ...prev, show: 'rating' }))}
        />
      )}
    </div>
  );
}
