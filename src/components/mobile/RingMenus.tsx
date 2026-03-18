import React from 'react';
import { motion } from 'motion/react';
import { Ban, Database, MessageSquare, Share2, SkipForward } from 'lucide-react';

export function getArcPath(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) {
  const startOuterX = Math.cos(startAngle) * outerRadius;
  const startOuterY = Math.sin(startAngle) * outerRadius;
  const endOuterX = Math.cos(endAngle) * outerRadius;
  const endOuterY = Math.sin(endAngle) * outerRadius;

  const startInnerX = Math.cos(endAngle) * innerRadius;
  const startInnerY = Math.sin(endAngle) * innerRadius;
  const endInnerX = Math.cos(startAngle) * innerRadius;
  const endInnerY = Math.sin(startAngle) * innerRadius;

  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

  return `
    M ${startOuterX} ${startOuterY}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
    L ${startInnerX} ${startInnerY}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}
    Z
  `;
}

export function ActionRing({ onAction, onBack }: { onAction: (a: 'data' | 'review' | 'social' | 'skip') => void, onBack: () => void }) {
  const actions = [
    { id: 'data', label: 'Data', icon: Database },
    { id: 'review', label: 'Review', icon: MessageSquare },
    { id: 'social', label: 'Social', icon: Share2 },
    { id: 'skip', label: 'Skip', icon: SkipForward },
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
      onClick={onBack}
    >
      <div className="relative w-80 h-80" onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={onBack}
            className="p-6 rounded-full hover:bg-white/10 transition-colors active:scale-95"
          >
            <Ban className="w-16 h-16 text-red-500" />
          </button>
        </div>

        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="-160 -160 320 320">
          {actions.map((action, i) => {
            const segmentAngle = (Math.PI * 2) / actions.length;
            const startAngle = i * segmentAngle - Math.PI / 2 - segmentAngle / 2;
            const endAngle = startAngle + segmentAngle;
            const innerRadius = 70;
            const outerRadius = 150;
            
            return (
              <g key={action.id} className="pointer-events-auto cursor-pointer group" onClick={() => onAction(action.id)}>
                <path
                  d={getArcPath(startAngle, endAngle, innerRadius, outerRadius)}
                  className="fill-zinc-900/50 stroke-zinc-800 transition-colors group-hover:fill-indigo-500/20 group-hover:stroke-indigo-500/50"
                  strokeWidth="2"
                />
                <foreignObject
                  x={Math.cos(startAngle + segmentAngle / 2) * 110 - 30}
                  y={Math.sin(startAngle + segmentAngle / 2) * 110 - 30}
                  width="60"
                  height="60"
                  className="pointer-events-none"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-white">
                    <action.icon className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{action.label}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}

export function RatingRing({ type, onRate, onCancel }: { type: 'stars'|'hearts', onRate: (r: number) => void, onCancel: () => void }) {
  const ratings = type === 'stars' ? [1, 2, 3, 4, 5] : [-1, -2, -3, -4, -5];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="relative w-80 h-80" onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={onCancel}
            className="p-6 rounded-full hover:bg-white/10 transition-colors active:scale-95"
          >
            <Ban className="w-16 h-16 text-red-500" />
          </button>
        </div>

        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="-160 -160 320 320">
          {ratings.map((rating, i) => {
            const segmentAngle = (Math.PI * 2) / ratings.length;
            const startAngle = i * segmentAngle - Math.PI / 2 - segmentAngle / 2;
            const endAngle = startAngle + segmentAngle;
            const innerRadius = 70;
            const outerRadius = 150;
            
            return (
              <g key={rating} className="pointer-events-auto cursor-pointer group" onClick={() => onRate(rating)}>
                <path
                  d={getArcPath(startAngle, endAngle, innerRadius, outerRadius)}
                  className={`fill-zinc-900/50 stroke-zinc-800 transition-colors group-hover:fill-white/10`}
                  strokeWidth="2"
                />
                <foreignObject
                  x={Math.cos(startAngle + segmentAngle / 2) * 110 - 40}
                  y={Math.sin(startAngle + segmentAngle / 2) * 110 - 40}
                  width="80"
                  height="80"
                  className="pointer-events-none"
                >
                  <div className="w-full h-full relative flex items-center justify-center text-white">
                    <span className="text-xl font-black z-10">{Math.abs(rating)}</span>
                    {Array.from({ length: Math.abs(rating) }).map((_, j) => {
                      const count = Math.abs(rating);
                      const angle = (j / count) * Math.PI * 2 - Math.PI / 2;
                      const radius = 22;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      return (
                        <span 
                          key={j} 
                          className="absolute text-[12px] leading-none"
                          style={{ 
                            transform: `translate(${x}px, ${y}px)` 
                          }}
                        >
                          {type === 'stars' ? '⭐' : '💔'}
                        </span>
                      );
                    })}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}
