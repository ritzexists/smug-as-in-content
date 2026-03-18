import React, { useState } from 'react';
import { Book, Film, Plus, Search, Settings, X, Share2, ChevronRight, Ban, HelpCircle, LayoutGrid, CheckCircle2, Download } from 'lucide-react';
import { SwipeDeck } from './mobile/SwipeDeck';
import { MobileJournal } from './mobile/MobileJournal';
import { MobileReviewEditor } from './mobile/MobileReviewEditor';
import { PluginManager } from './desktop/PluginManager';
import { SettingsManager } from './SettingsManager';
import { HelpManager } from './HelpManager';
import { TutorialOverlay } from './TutorialOverlay';
import { Logo } from './Logo';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { ActionRing, RatingRing } from './mobile/RingMenus';
import { useMediaStore } from '../store';
import { MediaItem } from '../types';
import { useEffect } from 'react';
import { usePWA } from '../lib/pwa';

export default function MobileView() {
  const [activeTab, setActiveTab] = useState<'discover' | 'journal' | 'plugins' | 'settings' | 'help'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const { addItem, settingsLastModified, settingsLastExported } = useMediaStore();
  const { isPWA, canInstall, installPWA } = usePWA();

  useEffect(() => {
    if (!isPWA) {
      setIsSettingsOpen(true);
    }
  }, [isPWA]);

  const handleOpenEditor = (id: string | null = null) => {
    setSelectedItemId(id);
    setIsEditorOpen(true);
    setIsSettingsOpen(false); // Close settings if open
  };

  const handleRate = (rating: number) => {
    setRingConfig(prev => ({ ...prev, show: 'actions', rating }));
  };

  const handleAction = (action: 'data' | 'review' | 'social' | 'skip') => {
    if (ringConfig.item && ringConfig.rating !== undefined) {
      addItem({
        title: ringConfig.item.title!,
        type: ringConfig.item.type!,
        rating: ringConfig.rating * 2,
        source: ringConfig.item.source!,
        consumedDate: new Date().toISOString(),
        posterUrl: ringConfig.item.posterUrl,
        creator: ringConfig.item.creator,
      });

      if (action === 'data' || action === 'review') {
        // Opening editor
      } else if (action === 'social') {
        // Sharing
      }
    }
    setRingConfig({ show: null, type: 'stars', item: null });
    setIsSearching(false); // Close search after adding
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-950 overflow-hidden">
      {/* Unsaved Settings Banner */}
      {settingsLastModified > settingsLastExported && activeTab !== 'settings' && (
        <div className="bg-amber-500 text-black py-1 px-4 text-center text-xs font-bold z-50 flex items-center justify-center gap-2">
          <span>Unsaved settings changes.</span>
          <button 
            onClick={() => setActiveTab('settings')}
            className="underline hover:no-underline"
          >
            Settings
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        {activeTab === 'discover' && (
          <SwipeDeck 
            onSwipeUp={() => setIsSearching(true)} 
            onSwipeDown={() => setIsSettingsOpen(true)} 
          />
        )}
        {activeTab === 'journal' && (
          <MobileJournal searchQuery={searchQuery} onSelect={handleOpenEditor} onClose={() => setActiveTab('discover')} />
        )}
        {activeTab === 'plugins' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Plugins & Sync</h2>
              <button 
                onClick={() => setActiveTab('discover')} 
                className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PluginManager />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <button 
                onClick={() => setActiveTab('discover')} 
                className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SettingsManager />
          </div>
        )}
        {activeTab === 'help' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Help & Tutorial</h2>
              <button 
                onClick={() => setActiveTab('discover')} 
                className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <HelpManager onStartTutorial={() => setShowTutorial(true)} />
          </div>
        )}
      </main>

      {/* Bottom Navigation Removed */}

      {/* Settings Menu (Down Swipe) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-[#002b36] z-40 flex flex-col"
            drag={isPWA ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => {
              if (isPWA && info.offset.y < -50) setIsSettingsOpen(false);
            }}
          >
            <div className="p-6 pt-12 flex-1">
              <div className="flex justify-between items-start mb-8">
                <Logo />
                <div className="text-[#586e75] text-[10px] font-bold uppercase tracking-widest pt-1">
                  {isPWA ? "Swipe up to close" : "Install App to continue"}
                </div>
              </div>
              
              <div className="space-y-4">
                {!isPWA && canInstall && (
                  <button 
                    onClick={installPWA}
                    className="w-full flex items-center gap-4 p-4 bg-indigo-600 rounded-2xl text-left active:scale-95 transition-transform shadow-lg shadow-indigo-500/20"
                  >
                    <div className="p-3 bg-white/20 text-white rounded-xl">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Install App</h3>
                      <p className="text-sm text-white/80">Add to home screen to unlock full features</p>
                    </div>
                  </button>
                )}

                <button 
                  onClick={() => { if (isPWA) { setActiveTab('journal'); setIsSettingsOpen(false); } }}
                  disabled={!isPWA}
                  className={`w-full flex items-center gap-4 p-4 bg-[#073642] rounded-2xl text-left transition-transform ${isPWA ? 'active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'}`}
                >
                  <div className="p-3 bg-[#268bd2]/20 text-[#268bd2] rounded-xl">
                    <Book className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#93a1a1]">Journal</h3>
                    <p className="text-sm text-[#839496]">View your logged media</p>
                  </div>
                </button>

                <button 
                  onClick={() => { if (isPWA) handleOpenEditor(); }}
                  disabled={!isPWA}
                  className={`w-full flex items-center gap-4 p-4 bg-[#073642] rounded-2xl text-left transition-transform ${isPWA ? 'active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'}`}
                >
                  <div className="p-3 bg-[#859900]/20 text-[#859900] rounded-xl">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#93a1a1]">Add Entry</h3>
                    <p className="text-sm text-[#839496]">Manually log a new item</p>
                  </div>
                </button>

                <button 
                  onClick={() => { if (isPWA) { setActiveTab('plugins'); setIsSettingsOpen(false); } }}
                  disabled={!isPWA}
                  className={`w-full flex items-center gap-4 p-4 bg-[#073642] rounded-2xl text-left transition-transform ${isPWA ? 'active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'}`}
                >
                  <div className="p-3 bg-[#d33682]/20 text-[#d33682] rounded-xl">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#93a1a1]">Plugins & Sync</h3>
                    <p className="text-sm text-[#839496]">Manage external connections</p>
                  </div>
                </button>

                <button 
                  onClick={() => { if (isPWA) { setActiveTab('settings'); setIsSettingsOpen(false); } }}
                  disabled={!isPWA}
                  className={`w-full flex items-center gap-4 p-4 bg-[#073642] rounded-2xl text-left transition-transform ${isPWA ? 'active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'}`}
                >
                  <div className="p-3 bg-[#586e75]/20 text-[#839496] rounded-xl">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#93a1a1]">Settings</h3>
                    <p className="text-sm text-[#839496]">App configuration and data</p>
                  </div>
                </button>

                <button 
                  onClick={() => { if (isPWA) { setActiveTab('help'); setIsSettingsOpen(false); } }}
                  disabled={!isPWA}
                  className={`w-full flex items-center gap-4 p-4 bg-[#073642] rounded-2xl text-left transition-transform ${isPWA ? 'active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'}`}
                >
                  <div className="p-3 bg-[#b58900]/20 text-[#b58900] rounded-xl">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#93a1a1]">Help</h3>
                    <p className="text-sm text-[#839496]">Tutorial and FAQs</p>
                  </div>
                </button>

                {activeTab !== 'discover' && (
                  <button 
                    onClick={() => { if (isPWA) { setActiveTab('discover'); setIsSettingsOpen(false); } }}
                    disabled={!isPWA}
                    className={`w-full flex items-center gap-4 p-4 bg-[#073642] rounded-2xl text-left transition-transform ${isPWA ? 'active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'}`}
                  >
                    <div className="p-3 bg-[#268bd2]/20 text-[#268bd2] rounded-xl">
                      <Film className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#93a1a1]">Discover</h3>
                      <p className="text-sm text-[#839496]">Back to swiping</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Menu (Up Swipe) */}
      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-zinc-950 z-40 flex flex-col"
          >
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search media..."
                    className="w-full bg-zinc-900 border-none outline-none text-white py-4 pl-12 pr-4 rounded-2xl text-lg"
                  />
                </div>
              </div>
              
              {searchQuery ? (
                <div className="space-y-8 pb-12">
                  {[
                    { id: 'tmdb', name: 'TMDB', results: [
                      { title: 'Inception', creator: 'Christopher Nolan', posterUrl: 'https://picsum.photos/seed/inception/100/150', type: 'movie', source: 'tmdb', tags: ['Sci-Fi', 'Heist'] },
                      { title: 'Interstellar', creator: 'Christopher Nolan', posterUrl: 'https://picsum.photos/seed/interstellar/100/150', type: 'movie', source: 'tmdb', tags: ['Sci-Fi', 'Space'] },
                    ]},
                    { id: 'trakt', name: 'Trakt.tv', results: [
                      { title: 'Breaking Bad', creator: 'Vince Gilligan', posterUrl: 'https://picsum.photos/seed/breakingbad/100/150', type: 'tv', source: 'trakt', tags: ['Crime', 'Drama'] },
                      { title: 'Better Call Saul', creator: 'Vince Gilligan', posterUrl: 'https://picsum.photos/seed/saul/100/150', type: 'tv', source: 'trakt', tags: ['Crime', 'Legal'] },
                    ]},
                    { id: 'goodreads', name: 'Goodreads', results: [
                      { title: 'The Hobbit', creator: 'J.R.R. Tolkien', posterUrl: 'https://picsum.photos/seed/hobbit/100/150', type: 'book', source: 'goodreads', tags: ['Fantasy', 'Adventure'] },
                    ]}
                  ].map(plugin => (
                    <div key={plugin.id} className="bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-800/50">
                      <div className="p-5 flex items-center justify-between border-b border-zinc-800/50">
                        <h3 className="font-bold text-lg text-white">{plugin.name}</h3>
                        <button className="text-sm font-medium text-indigo-400 flex items-center gap-1">
                          Full Search <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="divide-y divide-zinc-800/50">
                        {plugin.results.map((res, i) => (
                          <SwipeableSearchResult 
                            key={i} 
                            item={res} 
                            onSwipe={(dir) => {
                              if (dir === 'right') setRingConfig({ show: 'rating', type: 'stars', item: res });
                              else if (dir === 'left') setRingConfig({ show: 'rating', type: 'hearts', item: res });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-500 mt-12">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Start typing to search across all backends</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsSearching(false)}
              className="absolute bottom-6 right-6 w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center shadow-xl border border-zinc-700 text-zinc-400 hover:text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditorOpen && (
          <MobileReviewEditor 
            itemId={selectedItemId} 
            onClose={() => setIsEditorOpen(false)} 
          />
        )}
      </AnimatePresence>

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

      {showTutorial && (
        <TutorialOverlay isMobile={true} onComplete={completeTutorial} />
      )}
    </div>
  );
}

function SwipeableSearchResult({ item, onSwipe }: { item: any, onSwipe: (dir: 'left' | 'right') => void, key?: any }) {
  const { items } = useMediaStore();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const bg = useTransform(x, [-100, 0, 100], ['#ef4444', 'transparent', '#10b981']);

  const existingItem = items.find(i => i.title === item.title && i.type === item.type);
  const isTriageable = !existingItem || existingItem.rating === 0;

  return (
    <div className="relative overflow-hidden">
      {isTriageable && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-between px-8 text-white font-bold"
          style={{ backgroundColor: bg }}
        >
          <span>Negative</span>
          <span>Positive</span>
        </motion.div>
      )}
      <motion.div 
        style={{ x, opacity }}
        drag={isTriageable ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, info) => {
          if (isTriageable) {
            if (info.offset.x > 100) onSwipe('right');
            else if (info.offset.x < -100) onSwipe('left');
          }
          x.set(0);
        }}
        className={`relative p-4 flex gap-4 bg-zinc-950 active:bg-zinc-900 transition-colors ${!isTriageable ? 'opacity-75' : ''}`}
      >
        <div className="relative w-12 h-18 shrink-0">
          <img src={item.posterUrl} className="w-full h-full object-cover rounded-lg bg-zinc-800" />
          {existingItem && (
            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 shadow-lg border border-zinc-950">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-white truncate">{item.title}</h4>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
              {item.type}
            </span>
          </div>
          <p className="text-sm text-zinc-400 truncate mb-2">{item.creator}</p>
          <div className="flex flex-wrap gap-1">
            {item.tags?.map((tag: string) => (
              <span key={tag} className="text-[9px] font-medium bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
