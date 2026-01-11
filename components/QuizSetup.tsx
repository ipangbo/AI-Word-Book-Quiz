import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { QuizConfig } from '../types';
import { Ripple } from './common/Ripple';
import { SetupOptions } from './quiz/SetupOptions';

interface QuizSetupProps {
  totalWords: number;
  onStart: (config: QuizConfig) => void;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({ totalWords, onStart }) => {
  const [count, setCount] = useState<number>(Math.min(10, totalWords));
  const [isRandom, setIsRandom] = useState(false);

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
        <SetupOptions 
          totalWords={totalWords}
          count={count}
          onCountChange={setCount}
          isRandom={isRandom}
          onRandomChange={setIsRandom}
        />
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