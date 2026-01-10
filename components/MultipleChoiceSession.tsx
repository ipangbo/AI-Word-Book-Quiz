
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, X, SkipForward, Pause, Play } from 'lucide-react';
import { WordEntry, MultipleChoiceConfig, DictationMistake } from '../types';
import { speak } from '../utils/tts';
import { getDictationSettings } from '../utils/settings'; // Reusing delays
import { Ripple } from './Ripple';
import { Switch } from './Switch';

interface MultipleChoiceSessionProps {
  entries: WordEntry[];
  config: MultipleChoiceConfig;
  onFinish: (mistakes: DictationMistake[], sessionEntries: WordEntry[]) => void;
  onExit: () => void;
}

type FeedbackState = 'idle' | 'correct' | 'incorrect';

export const MultipleChoiceSession: React.FC<MultipleChoiceSessionProps> = ({ entries, config, onFinish, onExit }) => {
  const [queue, setQueue] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<DictationMistake[]>([]);
  
  const resultsRef = useRef<DictationMistake[]>([]);
  useEffect(() => { resultsRef.current = results; }, [results]);

  // Session State
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  
  // Timer State
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Settings
  const settings = useRef(getDictationSettings());

  // Local Config Controls
  const [showPhonetic, setShowPhonetic] = useState(config.showPhonetic);
  const [showPos, setShowPos] = useState(config.showPos);
  const [showDefinition, setShowDefinition] = useState(config.showDefinition);
  const [showTranslation, setShowTranslation] = useState(config.showTranslation);
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

  const currentWord = queue[currentIndex];

  // Reset internal scroll when index changes
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo(0, 0);
    }
  }, [currentIndex]);

  // Generate Options
  useEffect(() => {
    if (!currentWord) return;
    
    // Reset state for new card
    setFeedback('idle');
    setSelectedOption(null);
    setIsPaused(false);
    setProgress(100);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    // Filter out current word to pool distractors. Use PROTOTYPES for options.
    const allWords = entries.map(e => e.word);
    const distractors = allWords.filter(w => w.toLowerCase() !== currentWord.word.toLowerCase());
    
    // Shuffle distractors
    for (let i = distractors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }

    // Select N-1 distractors
    const numOptions = Math.min(config.optionCount, entries.length);
    const selectedDistractors = distractors.slice(0, numOptions - 1);
    
    // Combine and Shuffle
    const opts = [...selectedDistractors, currentWord.word];
    for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    
    setCurrentOptions(opts);

  }, [currentIndex, currentWord, entries, config.optionCount]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (!currentWord) return null;

  const sessionProgress = ((currentIndex) / queue.length) * 100;

  const nextWord = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(resultsRef.current, queue);
    }
  };

  const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const total = durationRef.current;
      
      if (total === 0) {
          nextWord();
          return;
      }

      const p = Math.max(0, 100 - (elapsed / total) * 100);
      setProgress(p);

      if (elapsed < total) {
          requestRef.current = requestAnimationFrame(updateProgress);
      } else {
          nextWord();
      }
  };

  const handleOptionClick = (option: string) => {
      // Logic to pause timer on incorrect answers if clicked again
      if (feedback === 'incorrect' && selectedOption === option) {
          if (!isPaused) {
              setIsPaused(true);
              if (requestRef.current) cancelAnimationFrame(requestRef.current);
          }
          return;
      }

      if (feedback !== 'idle') return;
      
      setSelectedOption(option);
      
      const isCorrect = option.toLowerCase() === currentWord.word.toLowerCase();
      
      if (isCorrect) {
          triggerFeedback('correct');
      } else {
          setResults(prev => [...prev, {
              wordId: currentWord.id,
              userInput: option,
              isSkipped: false
          }]);
          triggerFeedback('incorrect');
      }
  };

  const handleSkip = () => {
      if (feedback !== 'idle') return;
      setResults(prev => [...prev, {
          wordId: currentWord.id,
          userInput: '',
          isSkipped: true
      }]);
      triggerFeedback('incorrect');
  };

  const triggerFeedback = (status: FeedbackState) => {
    setFeedback(status);
    const delay = status === 'correct' ? settings.current.correctDelay : settings.current.incorrectDelay;
    
    durationRef.current = delay;
    startTimeRef.current = Date.now();
    setProgress(100);
    
    // Speak word on feedback
    speak(currentWord.word);

    // Start timer loop
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(updateProgress);
  };

  const getMaskedSentence = () => {
     // Robust replace using wordInSentence
     const target = currentWord.wordInSentence || currentWord.word;
     const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
     const regex = new RegExp(`(${escaped})`, 'gi');
     
     const parts = currentWord.sentence.split(regex);
     return (
        <span className="text-xl md:text-2xl font-medium leading-relaxed text-md-on-surface">
            {parts.map((part, i) => {
                if (part.toLowerCase() === target.toLowerCase()) {
                   // If idle, show blank. If answered, show target word (sentence form)
                   const display = feedback !== 'idle' ? target : '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0';
                   return (
                       <span key={i} className={`inline-block min-w-[80px] border-b-2 text-center px-1 font-bold transition-colors ${
                           feedback === 'idle' ? 'border-md-primary text-md-primary' :
                           feedback === 'correct' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
                       }`}>
                           {display}
                       </span>
                   );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
     );
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[90vh] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 p-4">
        <div className="flex-1 h-2 bg-md-surface-container rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-md-primary"
            initial={{ width: 0 }}
            animate={{ width: `${sessionProgress}%` }}
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
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div 
        ref={scrollRef}
        className="flex-1 flex flex-col items-center justify-start p-4 w-full relative overflow-y-auto"
      >
        
        {/* Sentence */}
        <div className="w-full bg-white dark:bg-md-surface-container border border-md-surface-container rounded-3xl p-6 md:p-8 mb-6 shadow-sm text-center">
            {getMaskedSentence()}
        </div>

        {/* Hints */}
        <div className="w-full space-y-3 mb-6 text-center min-h-[60px]">
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
            </AnimatePresence>
        </div>

        {/* Options Grid */}
        <div className={`grid gap-3 w-full max-w-md ${currentOptions.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {currentOptions.map((option, idx) => {
                const isCorrectOption = option.toLowerCase() === currentWord.word.toLowerCase();
                const isSelected = selectedOption === option;
                
                let stateClass = "bg-white dark:bg-md-surface-container border-md-surface-container text-md-on-surface hover:bg-md-surface-container/50";
                
                if (feedback !== 'idle') {
                    if (isCorrectOption) {
                        stateClass = "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 font-bold";
                    } else if (isSelected && !isCorrectOption) {
                        stateClass = "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200";
                    } else {
                        stateClass = "opacity-40 bg-md-surface-container/20 border-transparent";
                    }
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={feedback !== 'idle' && !(isSelected && feedback === 'incorrect' && !isPaused)}
                        className={`relative overflow-hidden p-4 rounded-2xl border-2 text-lg font-medium transition-colors duration-200 ${stateClass}`}
                    >
                        {feedback === 'idle' && <Ripple />}
                        <div className="relative z-10 flex items-center justify-center gap-2">
                            <span>{option}</span>
                            {/* Show Pause/Play icon if this is the selected wrong answer */}
                            {isSelected && feedback === 'incorrect' && (
                                <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }}
                                    className={isPaused ? "text-md-primary" : "text-md-error"}
                                >
                                    {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
                                </motion.div>
                            )}
                        </div>

                        {/* Progress Bar for Selected Option */}
                        {isSelected && feedback !== 'idle' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 w-full">
                                <div 
                                    className={`h-full ${
                                        feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
        
        {/* Hint for pausing */}
        {feedback === 'incorrect' && !isPaused && (
            <p className="text-xs text-md-outline mt-4 opacity-60 animate-pulse">
                Tap the selected option to pause
            </p>
        )}

      </div>

      {/* Footer Controls */}
      <div className="p-6 flex items-center gap-4">
        {feedback === 'idle' ? (
            <button
            onClick={handleSkip}
            className="relative overflow-hidden w-full py-4 rounded-full flex items-center justify-center gap-2 font-medium text-md-outline hover:bg-md-surface-container transition-colors"
            >
            <Ripple />
            <SkipForward size={20} className="relative z-10" />
            <span className="relative z-10">Skip</span>
            </button>
        ) : (
            <button
            onClick={nextWord}
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
