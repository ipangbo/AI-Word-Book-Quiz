
import React from 'react';
import { motion } from 'framer-motion';
import { WordEntry } from '../types';
import { Volume2 } from 'lucide-react';
import { speak } from '../utils/tts';

interface FlashcardProps {
  data: WordEntry;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ data, isFlipped, onFlip }) => {
  
  // Helper to highlight the target word in the sentence
  const renderSentence = () => {
    // A simple robust replacement.
    // Note: This matches strictly. If the word form in text differs (e.g., gnawing vs gnaw), 
    // it might miss without stemming. For now, strict match or simple casing.
    const parts = data.sentence.split(new RegExp(`(${data.word})`, 'gi'));
    
    return (
      <p className="text-2xl md:text-3xl font-medium leading-relaxed text-center text-md-on-surface mb-6">
        {parts.map((part, i) => 
          part.toLowerCase() === data.word.toLowerCase() ? (
            <span key={i} className="text-md-primary font-bold bg-md-primary-container px-1 rounded-md mx-0.5">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
    );
  };

  return (
    <div className="relative w-full max-w-xl h-96 perspective-1000 cursor-pointer" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div 
          className="absolute w-full h-full backface-hidden bg-white dark:bg-md-surface-container rounded-3xl shadow-xl border border-md-surface-container flex flex-col items-center justify-center p-8"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="absolute top-6 right-6 text-xs font-mono text-md-outline bg-md-surface-container px-2 py-1 rounded">
            {data.timestamp}
          </span>
          {renderSentence()}
          <p className="text-md-outline text-sm mt-4">Tap to reveal</p>
        </div>

        {/* BACK */}
        <div 
          className="absolute w-full h-full backface-hidden bg-md-secondary-container rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-md-on-secondary-container"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {renderSentence()}
          
          <div className="w-full h-px bg-md-outline/20 my-4" />
          
          <p className="text-lg text-md-on-secondary-container/80 italic mb-4">
            "{data.translation}"
          </p>

          <div className="bg-white/60 dark:bg-black/40 w-full p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-baseline gap-2 mb-1 justify-center">
              <h3 className="text-xl font-bold text-md-primary">{data.word}</h3>
              <span className="text-sm italic text-md-outline">{data.pos}</span>
            </div>
            {data.phonetic && (
               <div 
                 onClick={(e) => { e.stopPropagation(); speak(data.word); }}
                 className="flex items-center justify-center gap-1 text-md-outline text-sm mb-2 cursor-pointer hover:text-md-primary transition-colors select-none"
                 title="Click to listen"
               >
                 <span>[{data.phonetic}]</span>
               </div>
            )}
            <p className="text-center font-medium">{data.definition}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
