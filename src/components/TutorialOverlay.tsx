import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

interface Step {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const DESKTOP_STEPS: Step[] = [
  {
    targetId: 'sidebar-nav',
    title: 'Navigation',
    content: 'Use the sidebar to switch between your Journal, Plugins, and Settings.',
    position: 'right'
  },
  {
    targetId: 'journal-header',
    title: 'Filters',
    content: 'Filter your journal by status, media type, or tags to find exactly what you are looking for.',
    position: 'bottom'
  },
  {
    targetId: 'search-button',
    title: 'Global Search',
    content: 'Search for new content across all your connected plugins and add them to your journal.',
    position: 'top'
  },
  {
    targetId: 'add-entry-button',
    title: 'Manual Entry',
    content: 'Add a new entry manually if you can\'t find it through search.',
    position: 'top'
  }
];

const MOBILE_STEPS: Step[] = [
  {
    targetId: 'mobile-journal-filters',
    title: 'Filters',
    content: 'Quickly filter your journal using these icon-based tabs for status and media type.',
    position: 'bottom'
  },
  {
    targetId: 'mobile-tags-toggle',
    title: 'Tags',
    content: 'Expand the tag cloud to filter by specific genres or themes.',
    position: 'bottom'
  },
  {
    targetId: 'mobile-nav',
    title: 'Main Navigation',
    content: 'Switch between your Journal, Search, and Settings using the bottom navigation bar.',
    position: 'top'
  }
];

export function TutorialOverlay({ isMobile, onComplete }: { isMobile: boolean, onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;

  useEffect(() => {
    const updateRect = () => {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto" onClick={onComplete} />
      
      <AnimatePresence mode="wait">
        {targetRect && (
          <motion.div
            key={`highlight-${currentStep}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: targetRect.left - 4,
              y: targetRect.top - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bg-white/10 border-2 border-indigo-500 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.3)] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`popover-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            left: targetRect ? (
              step.position === 'right' ? targetRect.right + 20 :
              step.position === 'left' ? targetRect.left - 340 :
              targetRect.left + (targetRect.width / 2) - 160
            ) : '50%',
            top: targetRect ? (
              step.position === 'bottom' ? targetRect.bottom + 20 :
              step.position === 'top' ? targetRect.top - 180 :
              targetRect.top + (targetRect.height / 2) - 80
            ) : '50%',
            transform: targetRect ? 'none' : 'translate(-50%, -50%)'
          }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute w-80 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <HelpCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Tutorial {currentStep + 1}/{steps.length}</span>
            </div>
            <button onClick={onComplete} className="text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">{step.content}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                currentStep === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
