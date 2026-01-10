
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Volume2, Eye, X, SkipForward, CheckCircle2, AlertCircle, PauseCircle } from 'lucide-react';
import { WordEntry, DictationConfig, DictationMistake } from '../types';
import { speak } from '../utils/tts';
import { getDictationSettings } from '../utils/settings';
import { Ripple } from './Ripple';
import { Switch } from './Switch';

interface DictationSessionProps {
  entries: WordEntry[];
  config: DictationConfig;
  onFinish: (mistakes: DictationMistake[], sessionEntries: WordEntry[]) => void;
  onExit: () => void;
}

type FeedbackState = 'idle' | 'correct' | 'incorrect';

export const DictationSession: React.FC<DictationSessionProps> = ({ entries, config, onFinish, onExit }) => {
  const [queue, setQueue] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakes, setMistakes] = useState<DictationMistake[]>([]);
  
  // Use a ref to access the latest mistakes inside setTimeout closures
  const mistakesRef = useRef<DictationMistake[]>([]);

  useEffect(() => {
    mistakesRef.current = mistakes;
  }, [mistakes]);
  
  // Input State
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Timer State for Feedback
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [feedbackTimeLeft, setFeedbackTimeLeft] = useState(0);
  const [totalFeedbackTime, setTotalFeedbackTime] = useState(0);

  // Settings for feedback delays
  const settings = useRef(getDictationSettings());

  // Display State (Local override of config)
  const [showPhonetic, setShowPhonetic] = useState(config.showPhonetic);
  const [showPos, setShowPos] = useState(config.showPos);
  const [showDefinition, setShowDefinition] = useState(config.showDefinition);
  const [showTranslation, setShowTranslation] = useState(config.showTranslation);
  const [showSentence, setShowSentence] = useState(config.showSentence);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize Queue
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

  // Reset scroll on word change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentIndex]);

  const currentWord = queue[currentIndex];

  // Auto-speak and focus handling
  useEffect(() => {
    if (currentWord && feedback === 'idle') {
      speak(currentWord.word);
      setInputValue('');
      setIsPaused(false);
      
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 400); 
      
      return () => clearTimeout(focusTimer);
    }
  }, [currentIndex, currentWord, feedback]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        speak(currentWord?.word || '');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!currentWord) return null;

  const progress = ((currentIndex) / queue.length) * 100;

  const handleReplay = () => {
    speak(currentWord.word);
    inputRef.current?.focus();
  };

  const nextWord = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    if (currentIndex < queue.length - 1) {
      setFeedback('idle'); // Only reset to idle if staying in session
      setCurrentIndex(prev => prev + 1);
    } else {
      // For the last word, don't reset feedback to 'idle' to avoid triggering the auto-speak useEffect
      onFinish(mistakesRef.current, queue);
    }
  };

  const handleSkip = () => {
    const newMistake: DictationMistake = {
        wordId: currentWord.id,
        userInput: inputValue,
        isSkipped: true
    };
    setMistakes(prev => [...prev, newMistake]);
    triggerFeedback('incorrect', newMistake);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (feedback !== 'idle') return;
    
    const cleanInput = inputValue.trim().toLowerCase();
    const target = currentWord.word.trim().toLowerCase();

    if (cleanInput === target) {
      triggerFeedback('correct');
    } else {
      const mist: DictationMistake = {
        wordId: currentWord.id,
        userInput: inputValue,
        isSkipped: false
      };
      setMistakes(prev => [...prev, mist]);
      triggerFeedback('incorrect', mist);
    }
  };

  const triggerFeedback = (status: FeedbackState, mistake?: DictationMistake) => {
    setFeedback(status);
    const delay = status === 'correct' ? settings.current.correctDelay : settings.current.incorrectDelay;
    setTotalFeedbackTime(delay);
    setFeedbackTimeLeft(delay);

    // Only replay the target word, no "Correct/Incorrect" voiceover
    speak(currentWord.word);

    const startTime = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
        if (isPaused) return;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, delay - elapsed);
        setFeedbackTimeLeft(remaining);
    }, 100);

    timerRef.current = setTimeout(() => {
        nextWord();
    }, delay);
  };

  const handlePauseToggle = () => {
      if (feedback === 'idle') return;
      
      if (!isPaused) {
          setIsPaused(true);
          if (timerRef.current) clearTimeout(timerRef.current);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
  };

  const handleManualNext = () => {
      nextWord();
  };

  const getMaskedSentence = () => {
     // Use wordInSentence for accurate masking
     const target = currentWord.wordInSentence || currentWord.word;
     const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
     const regex = new RegExp(escaped, 'gi');
     return currentWord.sentence.replace(regex, '_______');
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[90vh] relative">
      <div className="flex items-center justify-between mb-2 p-4">
        <div className="flex-1 h-2 bg-md-surface-container rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-md-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium font-mono text-md-outline ml-4">
          {currentIndex + 1}/{queue.length}
        </span>
        <button 
           onClick={() => setIsSettingsOpen(!isSettingsOpen)}
           className={`relative overflow-hidden p-2 rounded-full ml-4 transition-colors ${isSettingsOpen ? 'bg-md-primary-container text-md-on-primary-container' : 'hover:bg-md-surface-container text-md-outline'}`}
        >
          <Ripple />
          <Eye size={24} className="relative z-10" />
        </button>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
           <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="absolute top-20 right-4 z-50 bg-white dark:bg-md-surface-container shadow-xl rounded-2xl border border-md-surface-container p-4 min-w-[280px]"
           >
              <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-bold text-md-outline uppercase">Visible Hints</span>
                 <button onClick={() => setIsSettingsOpen(false)} className="relative overflow-hidden p-1 hover:bg-md-surface-container rounded-full transition-colors">
                   <Ripple />
                   <X size={16} className="relative z-10" />
                 </button>
              </div>
              <div className="space-y-1">
                 <Switch checked={showPhonetic} onChange={setShowPhonetic} label="Phonetic" />
                 <Switch checked={showPos} onChange={setShowPos} label="Part of Speech" />
                 <Switch checked={showDefinition} onChange={setShowDefinition} label="Definition" />
                 <Switch checked={showTranslation} onChange={setShowTranslation} label="Translation (CN)" />
                 <Switch checked={showSentence} onChange={setShowSentence} label="Context" />
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full relative">
        <AnimatePresence mode="wait">
        {feedback === 'idle' ? (
            <motion.div 
                key="input-mode"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center"
            >
                <button 
                onClick={handleReplay}
                className="mb-8 relative group rounded-full"
                title="Replay Audio (Alt + R)"
                >
                <div className="absolute inset-0 bg-md-primary/20 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
                <div className="bg-md-primary text-md-on-primary p-6 rounded-full shadow-lg relative z-10 hover:scale-105 transition-transform overflow-hidden">
                     <Ripple color="rgba(255,255,255,0.3)" />
                     <Volume2 size={48} className="relative z-10" />
                </div>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-md-outline whitespace-nowrap opacity-60">Alt + R</span>
                </button>

                <div className="w-full space-y-4 mb-8 text-center min-h-[120px]">
                    <AnimatePresence>
                        {showPhonetic && currentWord.phonetic && (
                            <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-md-outline font-mono text-lg">
                                [{currentWord.phonetic}]
                            </motion.p>
                        )}
                        <div className="flex justify-center gap-2 items-baseline flex-wrap">
                        {showPos && (
                            <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-xs font-bold bg-md-secondary-container text-md-on-secondary-container px-2 py-1 rounded">
                                {currentWord.pos}
                            </motion.span>
                        )}
                        {showDefinition && (
                            <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-md-on-surface font-medium">
                                {currentWord.definition}
                            </motion.span>
                        )}
                        </div>
                        {showTranslation && (
                            <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-md-outline text-sm italic">
                                {currentWord.translation}
                            </motion.p>
                        )}
                        {showSentence && (
                            <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mt-4 p-4 bg-md-surface-container/50 rounded-xl text-md-on-surface/80 text-lg leading-relaxed">
                                {getMaskedSentence()}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-md relative">
                    <input
                        ref={inputRef}
                        type="text"
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-transparent border-b-2 text-center text-3xl py-2 focus:outline-none transition-colors font-medium placeholder:text-md-outline/20 border-md-outline/40 focus:border-md-primary text-md-on-surface"
                        placeholder="Type what you hear..."
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                </form>
            </motion.div>
        ) : (
            <motion.div 
                key="feedback-mode"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-white dark:bg-md-surface-container rounded-3xl p-8 shadow-xl border border-md-surface-container flex flex-col items-center text-center cursor-pointer relative overflow-hidden"
                onClick={handlePauseToggle}
            >
                {!isPaused && (
                    <div className="absolute top-0 left-0 h-1 bg-md-primary transition-all duration-100 ease-linear" style={{ width: `${(feedbackTimeLeft / totalFeedbackTime) * 100}%` }} />
                )}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {feedback === 'correct' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                    {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
                </h2>
                <div className="my-4 w-full">
                    <p className="text-sm text-md-outline uppercase font-bold mb-1">Answer</p>
                    <p className="text-2xl font-bold text-md-on-surface mb-4">{currentWord.word}</p>
                    {feedback === 'incorrect' && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                             <p className="text-xs text-red-500 font-bold uppercase mb-1">You Typed</p>
                             <p className="text-lg text-red-800 dark:text-red-200 font-mono">{inputValue || '(Nothing)'}</p>
                        </div>
                    )}
                </div>
                {isPaused && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute top-4 right-4 text-md-outline/40 bg-md-surface-container/50 p-1 rounded-full">
                        <PauseCircle size={20} />
                    </motion.div>
                )}
                <p className="text-xs text-md-outline mt-2 opacity-60">
                    {isPaused ? "Tap 'Next' to continue" : "Tap card to pause"}
                </p>
            </motion.div>
        )}
        </AnimatePresence>
      </div>

      <div className="p-6 flex items-center gap-4">
        {feedback === 'idle' ? (
            <>
                <button
                onClick={handleSkip}
                className="relative overflow-hidden flex-1 py-4 rounded-full flex items-center justify-center gap-2 font-medium text-md-outline hover:bg-md-surface-container transition-colors"
                >
                <Ripple />
                <SkipForward size={20} className="relative z-10" />
                <span className="relative z-10">IDK, Skip</span>
                </button>
                <button
                onClick={() => handleSubmit()}
                className="relative overflow-hidden flex-1 bg-md-primary text-md-on-primary py-4 rounded-full flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl hover:bg-opacity-90 active:scale-95 transition-all"
                >
                <Ripple color="rgba(255,255,255,0.3)" />
                <span className="relative z-10">Submit</span>
                <ArrowRight size={20} className="relative z-10" />
                </button>
            </>
        ) : (
            <button
            onClick={handleManualNext}
            className="relative overflow-hidden w-full bg-md-secondary-container text-md-on-secondary-container py-4 rounded-full flex items-center justify-center gap-2 font-bold shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
            >
                <Ripple />
                <span className="relative z-10">Next Word</span>
                <ArrowRight size={20} className="relative z-10" />
            </button>
        )}
      </div>
    </div>
  );
};
