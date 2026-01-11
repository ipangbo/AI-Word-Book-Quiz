import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Settings2 } from 'lucide-react';
import { DictationConfig } from '../types';
import { getDictationSettings } from '../utils/settings';
import { Ripple } from './common/Ripple';
import { Switch } from './common/Switch';
import { SetupOptions } from './quiz/SetupOptions';

interface DictationSetupProps {
  totalWords: number;
  onStart: (config: DictationConfig) => void;
}

export const DictationSetup: React.FC<DictationSetupProps> = ({ totalWords, onStart }) => {
  const [count, setCount] = useState<number>(Math.min(10, totalWords));
  const [isRandom, setIsRandom] = useState(true);
  
  const [showPhonetic, setShowPhonetic] = useState(true);
  const [showPos, setShowPos] = useState(true);
  const [showDefinition, setShowDefinition] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showSentence, setShowSentence] = useState(false);

  useEffect(() => {
    const defaults = getDictationSettings();
    setShowPhonetic(defaults.defaultShowPhonetic);
    setShowPos(defaults.defaultShowPos);
    setShowDefinition(defaults.defaultShowDefinition);
    setShowTranslation(defaults.defaultShowTranslation);
    setShowSentence(defaults.defaultShowSentence);
  }, []);

  const handleStart = () => {
    onStart({
      itemCount: count,
      isRandom,
      showPhonetic,
      showPos,
      showDefinition,
      showTranslation,
      showSentence
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-lg mx-auto p-6"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-md-on-surface">Dictation Setup</h2>
        <p className="text-md-outline">Configure your listening practice</p>
      </div>

      <div className="w-full bg-md-surface-container p-6 rounded-3xl mb-6 shadow-sm">
        <SetupOptions 
          totalWords={totalWords}
          count={count}
          onCountChange={setCount}
          isRandom={isRandom}
          onRandomChange={setIsRandom}
        />

        {/* Hints Config */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-md-primary">
            <Settings2 size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Default Hints</span>
          </div>
          <div className="space-y-1">
            <Switch checked={showPhonetic} onChange={setShowPhonetic} label="Show Phonetic [əˈnʌðər]" />
            <Switch checked={showDefinition} onChange={setShowDefinition} label="Show English Definition" />
            <Switch checked={showTranslation} onChange={setShowTranslation} label="Show Translation (CN)" />
            <Switch checked={showSentence} onChange={setShowSentence} label="Show Masked Sentence" />
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        className="relative overflow-hidden w-full bg-md-primary text-md-on-primary py-4 rounded-full font-bold text-lg shadow-lg hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Ripple color="rgba(255,255,255,0.3)" />
        <Play size={20} fill="currentColor" className="relative z-10" />
        <span className="relative z-10">Start Dictation</span>
      </button>
    </motion.div>
  );
};