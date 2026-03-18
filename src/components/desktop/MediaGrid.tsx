import React, { useState } from 'react';
import { useMediaStore } from '../../store';
import { format } from 'date-fns';
import { Star, BookOpen, Tv, Film, Gamepad2, Headphones, Globe, HeartCrack } from 'lucide-react';
import { MediaType, MediaItem } from '../../types';
import { motion, useMotionValue, useTransform } from 'motion/react';

const TypeIcon = ({ type, className }: { type: MediaType, className?: string }) => {
  switch (type) {
    case 'book': return <BookOpen className={className} />;
    case 'tv': return <Tv className={className} />;
    case 'movie': return <Film className={className} />;
    case 'movies': return <Film className={className} />;
    case 'universe': return <Globe className={className} />;
    case 'game': return <Gamepad2 className={className} />;
    case 'music': return <Headphones className={className} />;
    default: return <Film className={className} />;
  }
};

export function MediaGrid({ items, onSelect, onTriage }: { items: MediaItem[], onSelect: (id: string) => void, onTriage: (item: MediaItem, dir: 'left' | 'right') => void }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
        <Film className="w-12 h-12 mb-4 opacity-50" />
        <p>No media entries yet.</p>
        <p className="text-sm">Click "Add Entry" to start your journal.</p>
      </div>
    );
  }

  return (
    <div id="desktop-media-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <TriageTile key={item.id} item={item} onSelect={onSelect} onTriage={onTriage} />
      ))}
    </div>
  );
}

function TriageTile({ item, onSelect, onTriage }: { item: MediaItem, onSelect: (id: string) => void, onTriage: (item: MediaItem, dir: 'left' | 'right') => void, key?: any }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-5, 5]);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const isTriageable = item.rating === 0;

  const handleDragEnd = (e: any, info: any) => {
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
  };

  return (
    <motion.div 
      style={{ 
        x: useTransform(x, [-200, 200], [-10, 10]),
        rotate,
        opacity,
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
      onClick={() => onSelect(item.id)}
      className={`group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/10 relative ${isTriageable ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
            <TypeIcon type={item.type} className="w-16 h-16" />
          </div>
        )}
        
        {/* Top Overlays */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-sm font-medium text-yellow-400 z-10">
          <Star className="w-4 h-4 fill-current" />
          {item.rating}/10
        </div>
        
        <div className="absolute top-3 left-3 bg-indigo-500/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider z-10">
          {item.source}
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12">
          <div className="flex items-center gap-2 text-[10px] text-zinc-300 mb-1 uppercase tracking-wider font-bold">
            <TypeIcon type={item.type} className="w-3 h-3" />
            <span>{item.type}</span>
            <span className="mx-1 opacity-50">•</span>
            <span>{format(new Date(item.consumedDate), 'MMM d, yyyy')}</span>
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

          {item.review && (
            <p className="text-xs text-zinc-400 mt-2 line-clamp-1 italic opacity-80">"{item.review}"</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
