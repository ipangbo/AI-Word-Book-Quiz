import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Play, Shuffle, ListOrdered } from 'lucide-react';
import { WordEntry, QuizConfig } from '../types';
import { Ripple } from './Ripple';

interface QuizSetupProps {
  totalWords: number;
  onStart: (config: QuizConfig) => void;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({ totalWords, onStart }) => {
  const [count, setCount] = useState<number>(Math.min(10, totalWords));
  const [isRandom, setIsRandom] = useState(false);

  // Quick select options
  const options = [5, 10, 20, 50].filter(n => n <= totalWords);
  if (!options.includes(totalWords)) options.push(totalWords);
  const uniqueOptions = Array.from(new Set(options)).sort((a, b) => a - b);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-lg mx-auto p-6"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-md-on-surface">Session Setup</h2>
        <p className="text-md-outline">Configure your learning session</p>
      </div>

      <div className="w-full bg-md-surface-container p-6 rounded-3xl mb-6">
        <label className="block text-sm font-bold text-md-on-secondary-container mb-4">
          Number of Words ({totalWords} available)
        </label>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {uniqueOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setCount(opt)}
              className={`relative overflow-hidden px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                count === opt
                  ? 'bg-md-primary text-md-on-primary shadow-md'
                  : 'bg-white text-md-on-surface hover:bg-md-secondary-container'
              }`}
            >
              <Ripple color={count === opt ? "rgba(255,255,255,0.3)" : undefined} />
              <span className="relative z-10">{opt === totalWords ? 'All' : opt}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${isRandom ? 'bg-md-secondary-container text-md-on-secondary-container' : 'text-md-outline'}`}>
                {isRandom ? <Shuffle size={20} /> : <ListOrdered size={20} />}
             </div>
             <div className="flex flex-col">
                <span className="text-md-on-surface font-medium">Randomize Order</span>
                <span className="text-xs text-md-outline">{isRandom ? 'Shuffle words' : 'Sequential order'}</span>
             </div>
          </div>
          <button
            onClick={() => setIsRandom(!isRandom)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              isRandom ? 'bg-md-primary' : 'bg-md-outline/30'
            }`}
          >
             <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                isRandom ? 'left-6' : 'left-1'
             }`} />
          </button>
        </div>
      </div>

      <button
        onClick={() => onStart({ itemCount: count, isRandom })}
        className="relative overflow-hidden w-full bg-md-primary text-md-on-primary py-4 rounded-full font-bold text-lg shadow-lg hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Ripple color="rgba(255,255,255,0.3)" />
        <Play size={20} fill="currentColor" className="relative z-10" />
        <span className="relative z-10">Start Quiz</span>
      </button>
    </motion.div>
  );
};
