
import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RotateCcw, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import { WordEntry, DictationMistake } from '../types';
import { exportFailedWords } from '../utils/parser';
import { speak } from '../utils/tts';
import { Ripple } from './Ripple';
import { ToastType } from './Toast';

interface ResultsScreenProps {
  allEntries: WordEntry[];
  markedIds: Set<string>;
  dictationMistakes?: DictationMistake[]; // Optional, for dictation mode
  onHome: () => void;
  onRestart: () => void;
  showToast: (msg: string, type: ToastType) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ allEntries, markedIds, dictationMistakes, onHome, onRestart, showToast }) => {
  // Combine marked IDs (Flashcard) and mistakes (Dictation) to get the list of "failed" words
  const mistakeMap = new Map<string, DictationMistake>();
  if (dictationMistakes) {
      dictationMistakes.forEach(m => mistakeMap.set(m.wordId, m));
  }

  const failedEntries = allEntries.filter(e => markedIds.has(e.id) || mistakeMap.has(e.id));

  const handleCopy = async () => {
    if (failedEntries.length === 0) return;
    const text = exportFailedWords(failedEntries);
    
    try {
      await navigator.clipboard.writeText(text);
      showToast('Review list copied as TeX to clipboard.', 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('Failed to copy to clipboard.', 'error');
    }
  };

  const isDictationMode = !!dictationMistakes;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6 pb-20"
    >
      <div className="text-center mb-10 mt-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${failedEntries.length === 0 ? 'bg-green-100 text-green-700' : 'bg-md-primary-container text-md-primary'}`}>
          {failedEntries.length === 0 ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
        </div>
        <h2 className="text-3xl font-bold text-md-on-surface">Session Complete!</h2>
        <p className="text-md-outline mt-2">
          {failedEntries.length === 0 
            ? "Perfect score! You crushed it." 
            : `You have ${failedEntries.length} words to review.`}
        </p>
      </div>

      {failedEntries.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-md-on-surface">Review List</h3>
            <button 
              onClick={handleCopy}
              className="relative overflow-hidden flex items-center gap-2 font-medium px-4 py-2 rounded-xl bg-md-primary-container text-md-on-primary-container hover:bg-md-primary hover:text-white transition-all shadow-sm"
            >
              <Ripple />
              <div className="relative z-10 flex items-center gap-2">
                 <Copy size={18} />
                 <span>Copy as TeX</span>
              </div>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {failedEntries.map(entry => {
               const mistake = mistakeMap.get(entry.id);
               return (
                <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-md-surface-container hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-md-on-surface">{entry.word}</span>
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
                      <span className="text-xs bg-md-secondary-container text-md-on-secondary-container px-2 py-0.5 rounded shrink-0">{entry.pos}</span>
                    </div>
                    
                    {/* Dictation Specific Feedback */}
                    {isDictationMode && mistake && (
                        <div className="mb-3 p-2 bg-md-error-container/30 rounded-lg border border-md-error/10">
                            <span className="text-xs font-bold text-md-error uppercase block mb-1">
                                {mistake.isSkipped ? 'Skipped' : 'You Typed'}
                            </span>
                            <span className={`text-sm ${mistake.isSkipped ? 'text-md-outline italic' : 'text-md-error font-mono'}`}>
                                {mistake.isSkipped ? '(No Input)' : mistake.userInput}
                            </span>
                        </div>
                    )}

                    <p className="text-sm text-md-outline mb-2">{entry.definition}</p>
                    <p className="text-xs text-md-on-surface/70 italic border-t border-md-surface-container pt-2 mt-2">
                    "{entry.sentence}"
                    </p>
                </div>
               );
            })}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 px-6 z-10 pointer-events-none">
         <div className="flex gap-4 pointer-events-auto shadow-2xl rounded-full bg-white/90 backdrop-blur-md p-2 border border-md-surface-container">
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
