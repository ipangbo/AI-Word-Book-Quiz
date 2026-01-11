import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordEntry } from '../types';
import { ArrowRight, BookOpen, ArrowUp } from 'lucide-react';
import { speak } from '../utils/tts';
import { Ripple } from './common/Ripple';

interface ReviewScreenProps {
  data: WordEntry[];
  onConfirm: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ data, onConfirm }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const groupedData: Record<string, { sentence: string, translation: string, timestamp: string, words: WordEntry[] }> = {};
  
  data.forEach(entry => {
    const key = `${entry.timestamp}_${entry.sentence}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        sentence: entry.sentence,
        translation: entry.translation,
        timestamp: entry.timestamp,
        words: []
      };
    }
    groupedData[key].words.push(entry);
  });

  const groups = Object.values(groupedData);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-3xl mx-auto pb-24"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-md-secondary-container p-3 rounded-xl text-md-on-secondary-container">
          < BookOpen size={24} />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-md-on-surface">Data Review</h2>
           <p className="text-md-outline text-sm">Found {data.length} words in {groups.length} sentences.</p>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group, idx) => (
          <div key={idx} className="bg-white dark:bg-md-surface-container border border-md-surface-container rounded-2xl p-5 shadow-sm">
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-mono text-md-primary bg-md-primary-container px-2 py-0.5 rounded">
                  {group.timestamp}
               </span>
             </div>
             <p className="text-md-on-surface font-medium text-lg leading-snug mb-2">{group.sentence}</p>
             <p className="text-md-outline text-sm italic mb-4">{group.translation}</p>
             
             <div className="space-y-2">
                {group.words.map(w => (
                  <div key={w.id} className="flex items-center gap-3 bg-md-surface-container/50 p-2 rounded-lg flex-wrap">
                    <span className="font-bold text-md-primary">{w.word}</span>
                    {w.phonetic && (
                      <span 
                        onClick={() => speak(w.word)}
                        className="text-xs text-md-outline font-mono cursor-pointer hover:text-md-primary transition-colors select-none"
                        title="Click to listen"
                      >
                        [{w.phonetic}]
                      </span>
                    )}
                    <span className="text-xs bg-md-outline/10 px-2 rounded text-md-outline">{w.pos}</span>
                    <span className="text-sm text-md-on-surface/80 truncate flex-1 min-w-[120px]">{w.definition}</span>
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-28 right-6 z-40 bg-md-primary-container text-md-on-primary-container p-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group overflow-hidden"
            aria-label="Back to top"
          >
            <Ripple />
            <ArrowUp size={24} className="relative z-10 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
        <button
          onClick={onConfirm}
          className="relative overflow-hidden bg-md-primary text-md-on-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <Ripple color="rgba(255,255,255,0.3)" />
          <span className="relative z-10">Looks Good, Continue</span>
          <ArrowRight size={20} className="relative z-10" />
        </button>
      </div>
    </motion.div>
  );
};