
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Shuffle, ListOrdered, Settings2 } from 'lucide-react';
import { ClozeConfig } from '../types';
import { getClozeSettings } from '../utils/settings';
import { Ripple } from './Ripple';
import { Switch } from './Switch';
import { ChoiceChip } from './ChoiceChip';

interface ClozeSetupProps {
  totalWords: number;
  onStart: (config: ClozeConfig) => void;
}

export const ClozeSetup: React.FC<ClozeSetupProps> = ({ totalWords, onStart }) => {
  const [count, setCount] = useState<number>(Math.min(10, totalWords));
  const [isRandom, setIsRandom] = useState(true);
  
  // Hint Toggles
  const [showPhonetic, setShowPhonetic] = useState(false);
  const [showPos, setShowPos] = useState(true);
  const [showDefinition, setShowDefinition] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Load defaults
  useEffect(() => {
      const defaults = getClozeSettings();
      setShowPhonetic(defaults.defaultShowPhonetic);
      setShowPos(defaults.defaultShowPos);
      setShowDefinition(defaults.defaultShowDefinition);
      setShowTranslation(defaults.defaultShowTranslation);
  }, []);

  // Quick select options
  const options = [5, 10, 20, 50].filter(n => n <= totalWords);
  if (!options.includes(totalWords)) options.push(totalWords);
  const uniqueOptions = Array.from(new Set(options)).sort((a, b) => a - b);

  const handleStart = () => {
      onStart({
          itemCount: count,
          isRandom,
          showPhonetic,
          showPos,
          showDefinition,
          showTranslation
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
        <h2 className="text-2xl font-bold text-md-on-surface">Cloze Test Setup</h2>
        <p className="text-md-outline">Fill in the blanks context quiz</p>
      </div>

      <div className="w-full bg-md-surface-container p-6 rounded-3xl mb-6 shadow-sm">
        
        {/* Count Selection */}
        <div className="mb-6 border-b border-md-outline/10 pb-6">
            <label className="block text-sm font-bold text-md-on-secondary-container mb-4">
            Number of Words
            </label>
            <div className="flex flex-wrap gap-2">
            {uniqueOptions.map(opt => (
                <ChoiceChip
                  key={opt}
                  label={opt === totalWords ? 'All' : opt.toString()}
                  selected={count === opt}
                  onClick={() => setCount(opt)}
                />
            ))}
            </div>
        </div>

        {/* Randomize */}
        <div className="flex items-center justify-between mb-6 border-b border-md-outline/10 pb-6">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${isRandom ? 'bg-md-secondary-container text-md-on-secondary-container' : 'text-md-outline'}`}>
                {isRandom ? <Shuffle size={20} /> : <ListOrdered size={20} />}
             </div>
             <div className="flex flex-col">
                <span className="text-md-on-surface font-medium">Randomize Order</span>
             </div>
          </div>
          <Switch checked={isRandom} onChange={setIsRandom} />
        </div>

        {/* Hints Config */}
        <div>
            <div className="flex items-center gap-2 mb-3 text-md-primary">
                <Settings2 size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Visible Hints</span>
            </div>
            <div className="space-y-1">
                <Switch checked={showPhonetic} onChange={setShowPhonetic} label="Show Phonetic" />
                <Switch checked={showPos} onChange={setShowPos} label="Show Part of Speech" />
                <Switch checked={showDefinition} onChange={setShowDefinition} label="Show Definition" />
                <Switch checked={showTranslation} onChange={setShowTranslation} label="Show Translation (CN)" />
            </div>
        </div>

      </div>

      <button
        onClick={handleStart}
        className="relative overflow-hidden w-full bg-md-primary text-md-on-primary py-4 rounded-full font-bold text-lg shadow-lg hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Ripple color="rgba(255,255,255,0.3)" />
        <Play size={20} fill="currentColor" className="relative z-10" />
        <span className="relative z-10">Start Cloze Test</span>
      </button>
    </motion.div>
  );
};
