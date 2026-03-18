import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Star, HeartCrack } from 'lucide-react';
import { useMediaStore } from '../../store';
import { MediaItem } from '../../types';
import { ActionRing, RatingRing } from './RingMenus';


export function SwipeDeck({ onSwipeUp, onSwipeDown }: { onSwipeUp: () => void, onSwipeDown: () => void }) {
  const { items, updateItem } = useMediaStore();
  const [cards, setCards] = useState(() => 
    items.filter(i => i.category === 'Completed' && i.rating === 0)
  );
  const [ringConfig, setRingConfig] = useState<{
    show: 'rating' | 'actions' | null,
    type: 'stars' | 'hearts',
    item: Partial<MediaItem> | null,
    rating?: number
  }>({ show: null, type: 'stars', item: null });

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down', item: Partial<MediaItem>) => {
    if (direction === 'right') {
      setRingConfig({ show: 'rating', type: 'stars', item });
    } else if (direction === 'left') {
      setRingConfig({ show: 'rating', type: 'hearts', item });
    } else if (direction === 'up') {
      onSwipeUp();
    } else if (direction === 'down') {
      onSwipeDown();
    }
  };

  const handleRate = (rating: number) => {
    setRingConfig(prev => ({ ...prev, show: 'actions', rating }));
  };

  const handleAction = (action: 'data' | 'review' | 'social' | 'skip') => {
    if (ringConfig.item && ringConfig.rating !== undefined) {
      updateItem(ringConfig.item.id!, {
        rating: ringConfig.rating * 2,
      });

      if (action === 'data' || action === 'review') {
        // In a real app, this would open the editor
      } else if (action === 'social') {
        // Sharing
      }
    }
    setCards(prev => prev.filter(c => c.id !== ringConfig.item?.id));
    setRingConfig({ show: null, type: 'stars', item: null });
  };

  const refreshFeed = () => {
    setCards(items.filter(i => i.category === 'Completed' && i.rating === 0));
  };

  return (
    <motion.div 
      id="mobile-swipe-deck"
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-zinc-950"
      onPanEnd={(e, info) => {
        if (cards.length === 0) {
          if (info.offset.y > 50) onSwipeDown();
          else if (info.offset.y < -50) onSwipeUp();
        }
      }}
    >
      {/* Top Instruction */}
      <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-10">
        <div className="text-[#586e75]/40 text-[10px] font-bold uppercase tracking-[0.3em]">
          Swipe down for menu
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-zinc-500 p-8 z-20 h-full w-full">
          <p className="text-lg font-medium text-[#93a1a1]">No more items in your feed.</p>
          <p className="text-sm mt-2 text-[#839496]">Only completed items missing ratings appear here.</p>
          <button onClick={refreshFeed} className="mt-6 px-6 py-2 bg-[#268bd2]/10 border border-[#268bd2]/30 rounded-full text-[#268bd2] font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform">
            Refresh Plugins
          </button>
        </div>
      ) : (
        <div className="relative w-[85%] max-w-sm aspect-[2/3] z-10">
          <AnimatePresence>
            {cards.map((card, index) => {
              const isTop = index === cards.length - 1;
              return (
                <SwipeCard 
                  key={card.id} 
                  item={card} 
                  isTop={isTop} 
                  onSwipe={(dir: any) => handleSwipe(dir, card)} 
                  zIndex={index}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Instruction */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-10">
        <div className="text-[#586e75]/40 text-[10px] font-bold uppercase tracking-[0.3em]">
          Swipe up for search
        </div>
      </div>

      {/* Action Buttons */}
      {cards.length > 0 && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-8 px-8 pointer-events-none">
          <button 
            onClick={() => cards.length > 0 && handleSwipe('left', cards[cards.length - 1])}
            className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-red-500/50 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/20 pointer-events-auto active:scale-95 transition-transform"
          >
            <HeartCrack className="w-8 h-8" />
          </button>
          <button 
            onClick={() => cards.length > 0 && handleSwipe('right', cards[cards.length - 1])}
            className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20 pointer-events-auto active:scale-95 transition-transform"
          >
            <Star className="w-8 h-8" />
          </button>
        </div>
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
    </motion.div>
  );
}

function SwipeCard({ item, isTop, onSwipe, zIndex }: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const handleDragEnd = (e: any, info: any) => {
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      if (info.offset.x > 100) onSwipe('right');
      else if (info.offset.x < -100) onSwipe('left');
      else { x.set(0); y.set(0); }
    } else {
      if (info.offset.y > 100) { onSwipe('down'); x.set(0); y.set(0); }
      else if (info.offset.y < -100) { onSwipe('up'); x.set(0); y.set(0); }
      else { x.set(0); y.set(0); }
    }
  };

  return (
    <motion.div
      className="absolute inset-0 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
      style={{ x, y, rotate, zIndex, opacity: isTop ? opacity : 1 }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={isTop ? { scale: 1.02 } : {}}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: 1, y: isTop ? 0 : 20, x: 0 }}
      exit={{ 
        x: x.get() > 50 ? 300 : x.get() < -50 ? -300 : 0, 
        y: y.get() > 50 ? 300 : y.get() < -50 ? -300 : 0,
        opacity: 0, 
        transition: { duration: 0.2 } 
      }}
    >
      <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          <span className="bg-zinc-800/80 px-2 py-1 rounded backdrop-blur-sm">{item.type}</span>
          <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded backdrop-blur-sm">{item.source}</span>
        </div>
        <h2 className="text-3xl font-black text-white leading-tight mb-1">{item.title}</h2>
        <p className="text-zinc-300 font-medium">{item.creator}</p>
      </div>
    </motion.div>
  );
}


