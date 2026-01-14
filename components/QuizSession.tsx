
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Bookmark, ArrowRight, Undo2 } from 'lucide-react';
import { WordEntry, QuizConfig } from '../types';
import { Flashcard } from './Flashcard';
import { Ripple } from './common/Ripple';

interface QuizSessionProps {
  entries: WordEntry[];
  config: QuizConfig;
  onFinish: (markedIds: Set<string>, sessionEntries: WordEntry[]) => void;
  onExit: () => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({ entries, config, onFinish, onExit }) => {
  const [queue, setQueue] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  useEffect(() => {
    let q = [...entries];
    if (config.isRandom) {
      for (let i = q.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q[i], q[j]] = [q[j], q[i]];
      }
    }
    setQueue(q.slice(0, config.itemCount));
  }, [entries, config]);

  useEffect(() => {
    // Reset scroll when card changes
    const scrollContainer = document.getElementById('card-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, [currentIndex]);

  if (queue.length === 0) return null;

  const currentCard = queue[currentIndex];
  const progress = ((currentIndex) / queue.length) * 100;

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      onFinish(markedIds, queue);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  const toggleMark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(markedIds);
    if (newSet.has(currentCard.id)) {
      newSet.delete(currentCard.id);
    } else {
      newSet.add(currentCard.id);
    }
    setMarkedIds(newSet);
  };

  return (
    // FIX: Calculate exact height to fit viewport. 
    // 100dvh (dynamic viewport height) - 5rem (TopBar pt-20) - safe-area-inset-bottom
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[calc(100dvh-5rem-env(safe-area-inset-bottom))]">
      
      {/* Header: Reduced margins/padding for tighter mobile fit */}
      <div className="flex items-center gap-4 px-4 py-3 mb-1 shrink-0">
        <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`relative overflow-hidden p-2 rounded-full transition-colors ${
                currentIndex === 0 
                ? 'text-md-outline/20 cursor-not-allowed' 
                : 'text-md-on-surface hover:bg-md-surface-container'
            }`}
            title="Previous Card"
        >
            <Ripple />
            <Undo2 size={24} className="relative z-10" />
        </button>

        <div className="flex-1 h-2 bg-md-surface-container rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-md-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium font-mono text-md-outline min-w-[3ch] text-right">
          {currentIndex + 1}/{queue.length}
        </span>
      </div>

      {/* Card Area: flex-1 takes remaining space. overflow-y-auto handles internal scrolling. */}
      <div 
        id="card-scroll-container"
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 w-full scroll-smooth"
      >
        {/* min-h-full ensures vertical centering if card is smaller than area */}
        <div className="min-h-full flex flex-col items-center justify-center py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ x: direction * 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <Flashcard 
                data={currentCard} 
                isFlipped={isFlipped} 
                onFlip={() => setIsFlipped(!isFlipped)} 
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls: Reduced padding */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 shrink-0 bg-md-surface/90 backdrop-blur-sm z-10">
        <button
          onClick={toggleMark}
          className={`relative overflow-hidden flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all ${
            markedIds.has(currentCard.id)
              ? 'bg-md-error-container text-md-error'
              : 'bg-md-surface-container text-md-outline hover:bg-md-secondary-container'
          }`}
        >
          <Ripple />
          <Bookmark size={22} fill={markedIds.has(currentCard.id) ? "currentColor" : "none"} className="relative z-10" />
          <span className="relative z-10 text-sm md:text-base">{markedIds.has(currentCard.id) ? 'Marked' : 'Mark'}</span>
        </button>

        <button
          onClick={handleNext}
          className="relative overflow-hidden flex-1 bg-md-primary text-md-on-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl hover:bg-opacity-90 active:scale-95 transition-all"
        >
          <Ripple color="rgba(255,255,255,0.3)" />
          {currentIndex === queue.length - 1 ? (
             <div className="flex items-center gap-2 relative z-10 text-sm md:text-base">Finish <Check size={22} /></div>
          ) : (
             <div className="flex items-center gap-2 relative z-10 text-sm md:text-base">Next <ArrowRight size={22} /></div>
          )}
        </button>
      </div>
    </div>
  );
};
