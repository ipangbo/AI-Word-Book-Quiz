
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Volume2, Eye, X, SkipForward, CheckCircle2, AlertCircle, PauseCircle, Ear } from 'lucide-react';
import { WordEntry, ClozeConfig, DictationMistake } from '../types';
import { speak } from '../utils/tts';
import { getDictationSettings } from '../utils/settings'; // Reuse delays from dictation settings
import { Ripple } from './Ripple';
import { Switch } from './Switch';

interface ClozeSessionProps {
  entries: WordEntry[];
  config: ClozeConfig;
  onFinish: (mistakes: DictationMistake[], sessionEntries: WordEntry[]) => void;
  onExit: () => void;
}

type FeedbackState = 'idle' | 'correct' | 'incorrect';

export const ClozeSession: React.FC<ClozeSessionProps> = ({ entries, config, onFinish, onExit }) => {
  const [queue, setQueue] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<DictationMistake[]>([]);
  
  const resultsRef = useRef<DictationMistake[]>([]);
  useEffect(() => { resultsRef.current = results; }, [results]);
  
  // Input & State
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [hintUsed, setHintUsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Timer State
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [feedbackTimeLeft, setFeedbackTimeLeft] = useState(0);
  const [totalFeedbackTime, setTotalFeedbackTime] = useState(0);

  // Use delays from dictation settings for consistency
  const settings = useRef(getDictationSettings());

  // Local Config
  const [showPhonetic, setShowPhonetic] = useState(config.showPhonetic);
  const [showPos, setShowPos] = useState(config.showPos);
  const [showDefinition, setShowDefinition] = useState(config.showDefinition);
  const [showTranslation, setShowTranslation] = useState(config.showTranslation);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize
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

  useEffect(() => {
    if (currentWord && feedback === 'idle') {
      setInputValue('');
      setHintUsed(false);
      setIsPaused(false);
      // Auto-focus input
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 400); 
      return () => clearTimeout(focusTimer);
    }
  }, [currentIndex, currentWord, feedback]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!currentWord) return null;

  const progress = ((currentIndex) / queue.length) * 100;

  const playSentenceHint = () => {
    if (feedback !== 'idle') return;
    setHintUsed(true);
    speak(currentWord.sentence);
    inputRef.current?.focus();
  };

  const nextWord = () => {
    setFeedback('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(resultsRef.current, queue);
    }
  };

  const handleSkip = () => {
    const newResult: DictationMistake = {
        wordId: currentWord.id,
        userInput: inputValue,
        isSkipped: true,
        usedHint: hintUsed
    };
    setResults(prev => [...prev, newResult]);
    triggerFeedback('incorrect');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (feedback !== 'idle') return;
    
    const cleanInput = inputValue.trim().toLowerCase();
    const target = currentWord.word.trim().toLowerCase();

    if (cleanInput === target) {
      // If hint was used, we still mark it in results to differentiate performance
      if (hintUsed) {
        setResults(prev => [...prev, {
            wordId: currentWord.id,
            userInput: inputValue,
            isSkipped: false,
            usedHint: true
        }]);
      }
      triggerFeedback('correct');
    } else {
      setResults(prev => [...prev, {
        wordId: currentWord.id,
        userInput: inputValue,
        isSkipped: false,
        usedHint: hintUsed
      }]);
      triggerFeedback('incorrect');
    }
  };

  const triggerFeedback = (status: FeedbackState) => {
    setFeedback(status);
    const delay = status === 'correct' ? settings.current.correctDelay : settings.current.incorrectDelay;
    setTotalFeedbackTime(delay);
    setFeedbackTimeLeft(delay);

    // Speak the word on completion
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

  const getMaskedSentence = () => {
     // Robust replace: handle case insensitivity
     const escaped = currentWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
     const regex = new RegExp(`(${escaped})`, 'gi');
     
     const parts = currentWord.sentence.split(regex);
     return (
        <span className="text-xl md:text-2xl font-medium leading-relaxed text-md-on-surface">
            {parts.map((part, i) => {
                if (part.toLowerCase() === currentWord.word.toLowerCase()) {
                   return (
                       <span key={i} className="inline-block min-w-[80px] border-b-2 border-md-primary text-center px-1 text-md-primary font-bold">
                           {feedback !== 'idle' ? currentWord.word : '\u00A0'}
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
      <div className="flex items-center justify-between mb-2 p-4">
        <button onClick={onExit} className="relative overflow-hidden p-2 rounded-full hover:bg-md-surface-container transition-colors">
          <Ripple />
          <ArrowLeft className="text-md-on-surface relative z-10" />
        </button>
        <div className="flex-1 mx-4 h-2 bg-md-surface-container rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-md-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium font-mono text-md-outline mr-4">
          {currentIndex + 1}/{queue.length}
        </span>
        <button 
           onClick={() => setIsSettingsOpen(!isSettingsOpen)}
           className={`relative overflow-hidden p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-md-primary-container text-md-on-primary-container' : 'hover:bg-md-surface-container text-md-outline'}`}
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
             className="absolute top-20 right-4 z-50 bg-white shadow-xl rounded-2xl border border-md-surface-container p-4 min-w-[280px]"
           >
              <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-bold text-md-outline uppercase">Visible Hints</span>
                 <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-md-surface-container rounded-full"><X size={16} /></button>
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

      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full relative">
        <AnimatePresence mode="wait">
        {feedback === 'idle' ? (
            <motion.div 
                key="input-mode"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center"
            >
                {/* Sentence Area */}
                <div className="w-full bg-white border border-md-surface-container rounded-3xl p-6 md:p-10 mb-8 shadow-sm text-center">
                    {getMaskedSentence()}
                </div>

                <div className="w-full space-y-3 mb-8 text-center min-h-[80px]">
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

                <div className="flex flex-col items-center w-full max-w-md gap-6">
                    <form onSubmit={handleSubmit} className="w-full relative">
                        <input
                            ref={inputRef}
                            type="text"
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full bg-md-surface-container/30 border-b-2 text-center text-2xl py-3 rounded-t-lg focus:outline-none transition-colors font-medium placeholder:text-md-outline/30 border-md-outline/40 focus:border-md-primary text-md-on-surface focus:bg-md-primary-container/10"
                            placeholder="Type the missing word..."
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                    </form>

                    <button 
                        onClick={playSentenceHint}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border ${
                            hintUsed 
                            ? 'bg-amber-100 text-amber-800 border-amber-200' 
                            : 'bg-white text-md-primary border-md-outline/20 hover:border-md-primary hover:bg-md-primary/5'
                        }`}
                    >
                        {hintUsed ? <Ear size={18} /> : <Volume2 size={18} />}
                        <span className="text-sm font-bold">
                            {hintUsed ? 'Audio Hint Used' : 'Play Sentence Audio'}
                        </span>
                    </button>
                </div>
            </motion.div>
        ) : (
            <motion.div 
                key="feedback-mode"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-md-surface-container flex flex-col items-center text-center cursor-pointer relative overflow-hidden"
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
                
                {hintUsed && feedback === 'correct' && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full mb-2">
                        WITH AUDIO HINT
                    </span>
                )}

                <div className="my-4 w-full">
                    <p className="text-sm text-md-outline uppercase font-bold mb-1">Answer</p>
                    <p className="text-2xl font-bold text-md-on-surface mb-4">{currentWord.word}</p>
                    {feedback === 'incorrect' && (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                             <p className="text-xs text-red-500 font-bold uppercase mb-1">You Typed</p>
                             <p className="text-lg text-red-800 font-mono">{inputValue || '(Nothing)'}</p>
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
                <span className="relative z-10">Skip</span>
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
