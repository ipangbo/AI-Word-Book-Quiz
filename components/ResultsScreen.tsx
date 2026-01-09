
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, RotateCcw, Home, CheckCircle2, AlertCircle, Ear } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WordEntry, DictationMistake } from '../types';
import { exportFailedWords } from '../utils/parser';
import { speak } from '../utils/tts';
import { Ripple } from './Ripple';
import { ToastType } from './Toast';
import { Switch } from './Switch';

interface ResultsScreenProps {
  sessionEntries: WordEntry[];
  markedIds: Set<string>;
  dictationMistakes?: DictationMistake[]; // Now serves as generic result container for Dictation and Cloze
  onHome: () => void;
  onRestart: () => void;
  showToast: (msg: string, type: ToastType) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ sessionEntries, markedIds, dictationMistakes, onHome, onRestart, showToast }) => {
  const resultMap = useMemo(() => {
    const map = new Map<string, DictationMistake>();
    if (dictationMistakes) {
        dictationMistakes.forEach(m => map.set(m.wordId, m));
    }
    return map;
  }, [dictationMistakes]);

  // State to determine if we should export words that were solved with a hint
  const [includeHintedInExport, setIncludeHintedInExport] = useState(true);

  const getResultStatus = (entry: WordEntry): 'correct' | 'mistake' | 'marked' | 'hinted' => {
      const res = resultMap.get(entry.id);
      
      // Prioritize detailed result info over generic 'marked' set
      if (res) {
          const userClean = (res.userInput || '').trim().toLowerCase();
          const wordClean = (entry.word || '').trim().toLowerCase();
          const isCorrect = !res.isSkipped && userClean === wordClean;

          if (!isCorrect) return 'mistake';
          if (res.usedHint) return 'hinted';
          return 'correct';
      }

      // Fallback for Flashcards (where dictationMistakes is empty or item not in it)
      if (markedIds.has(entry.id)) return 'marked';
      
      return 'correct';
  };

  // Stats calculation
  const total = sessionEntries.length;
  const absoluteFailures = useMemo(() => {
    return sessionEntries.filter(e => {
        const status = getResultStatus(e);
        // Failures are marked items or explicit mistakes. Hinted correct answers are not "failures" in the score.
        return status === 'marked' || status === 'mistake';
    }).length;
  }, [sessionEntries, resultMap, markedIds]);
  
  const correct = total - absoluteFailures;

  // Celebration Effect
  useEffect(() => {
    if (absoluteFailures === 0 && total > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        // Using default colors for a vibrant, multi-colored festive feel
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [absoluteFailures, total]);

  // Filter logic for export
  const exportableEntries = sessionEntries.filter(e => {
    const status = getResultStatus(e);
    if (status === 'marked') return true;
    if (status === 'mistake') return true;
    if (status === 'hinted' && includeHintedInExport) return true;
    return false;
  });

  const handleCopy = async () => {
    if (exportableEntries.length === 0) {
        showToast('No entries match criteria to export!', 'info');
        return;
    }
    const text = exportFailedWords(exportableEntries);
    
    try {
      await navigator.clipboard.writeText(text);
      showToast('Review list copied as TeX to clipboard.', 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('Failed to copy to clipboard.', 'error');
    }
  };

  const isQuizMode = !!dictationMistakes;
  const hasHints = dictationMistakes?.some(m => m.usedHint);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6 pb-32"
    >
      <div className="text-center mb-8 mt-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${absoluteFailures === 0 ? 'bg-green-100 text-green-700' : 'bg-md-primary-container text-md-primary'}`}>
          {absoluteFailures === 0 ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
        </div>
        <h2 className="text-3xl font-bold text-md-on-surface">
          {absoluteFailures === 0 ? 'Perfect Score!' : 'Session Complete!'}
        </h2>
        <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-green-600">{correct}</span>
                <span className="text-xs text-md-outline uppercase font-bold tracking-widest">Correct</span>
            </div>
            <div className="w-px h-8 bg-md-outline/20" />
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-md-primary">{absoluteFailures}</span>
                <span className="text-xs text-md-outline uppercase font-bold tracking-widest">Review</span>
            </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-md-on-surface">Session Words</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
             {hasHints && (
                 <div className="bg-white dark:bg-md-surface-container border border-md-surface-container px-3 py-1 rounded-xl shadow-sm w-full sm:w-auto flex items-center">
                     <Switch 
                        checked={includeHintedInExport} 
                        onChange={setIncludeHintedInExport} 
                        label="Export Hinted Words"
                     />
                 </div>
             )}
             
             {exportableEntries.length > 0 && (
                <button 
                onClick={handleCopy}
                className="relative overflow-hidden flex items-center justify-center gap-2 font-medium px-4 py-3 rounded-xl bg-md-primary-container text-md-on-primary-container hover:bg-md-primary hover:text-white transition-all shadow-sm w-full sm:w-auto"
                >
                <Ripple />
                <div className="relative z-10 flex items-center gap-2">
                    <Copy size={18} />
                    <span>Copy ({exportableEntries.length})</span>
                </div>
                </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessionEntries.map(entry => {
             const result = resultMap.get(entry.id);
             const status = getResultStatus(entry);
             
             const isError = status === 'mistake' || status === 'marked';
             const isHinted = status === 'hinted';
             
             return (
              <div key={entry.id} className={`bg-white dark:bg-md-surface-container p-5 rounded-3xl shadow-sm border transition-all ${
                isError 
                ? 'border-md-error/20 bg-md-error-container/5' 
                : 'border-md-surface-container'
              }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-md-on-surface">{entry.word}</span>
                        {isError ? (
                            <span className="text-md-error shrink-0"><AlertCircle size={16} /></span>
                        ) : isHinted ? (
                            <span className="text-amber-500 shrink-0"><Ear size={16} /></span>
                        ) : (
                            <span className="text-green-500 shrink-0"><CheckCircle2 size={16} /></span>
                        )}
                      </div>
                      {entry.phonetic && (
                        <span 
                          onClick={() => speak(entry.word)}
                          className="text-xs text-md-outline font-mono cursor-pointer hover:text-md-primary transition-colors select-none"
                          title="Click to listen"
                        >
                          [{entry.phonetic}]
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                        status === 'marked' ? 'bg-md-error-container text-md-error' :
                        status === 'mistake' ? 'bg-md-error-container text-md-error' :
                        status === 'hinted' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                      {status === 'marked' ? 'Marked' : 
                       status === 'mistake' ? (result?.isSkipped ? 'Skipped' : 'Mistake') : 
                       status === 'hinted' ? 'Hint Used' : 'Correct'}
                    </span>
                  </div>
                  
                  {isQuizMode && result && status === 'mistake' && (
                      <div className="mb-3 p-2 bg-md-error-container/20 rounded-xl border border-md-error/10">
                          <span className="text-[10px] font-bold text-md-error uppercase block mb-0.5">
                              {result.isSkipped ? 'No Input' : 'You Typed'}
                          </span>
                          <span className={`text-sm ${result.isSkipped ? 'text-md-outline italic' : 'text-md-error font-mono'}`}>
                              {result.isSkipped ? '—' : result.userInput}
                          </span>
                      </div>
                  )}

                  <p className="text-sm text-md-outline mb-3 leading-relaxed">{entry.definition}</p>
                  <p className="text-xs text-md-on-surface/60 italic border-t border-md-surface-container pt-3">
                    "{entry.sentence}"
                  </p>
              </div>
             );
          })}
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 px-6 z-10 pointer-events-none">
         <div className="flex gap-4 pointer-events-auto shadow-2xl rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md p-2 border border-md-surface-container">
            <button
              onClick={onRestart}
              className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-full bg-md-secondary-container text-md-on-secondary-container font-medium hover:opacity-80 transition-opacity"
            >
              <Ripple />
              <RotateCcw size={20} className="relative z-10" />
              <span className="relative z-10">Restart</span>
            </button>
            <button
              onClick={onHome}
              className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-full bg-md-primary text-md-on-primary font-medium hover:opacity-90 transition-opacity"
            >
              <Ripple color="rgba(255,255,255,0.3)" />
              <Home size={20} className="relative z-10" />
              <span className="relative z-10">Home</span>
            </button>
         </div>
      </div>
    </motion.div>
  );
};
