
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Edit3, Mic } from 'lucide-react';
import { QuizMode } from '../types';
import { Ripple } from './Ripple';

interface QuizSelectionScreenProps {
  onSelect: (mode: QuizMode) => void;
}

export const QuizSelectionScreen: React.FC<QuizSelectionScreenProps> = ({ onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto p-6 flex flex-col items-center"
    >
      <h2 className="text-3xl font-bold text-md-on-surface mb-2 mt-8">Choose Quiz Mode</h2>
      <p className="text-md-outline mb-10">Select how you want to test your knowledge</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Flashcards (Active) */}
        <button 
          onClick={() => onSelect('flashcard')}
          className="relative overflow-hidden bg-md-primary-container p-6 rounded-3xl text-left hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md group"
        >
          <Ripple />
          <div className="bg-md-primary w-12 h-12 rounded-xl flex items-center justify-center text-md-on-primary mb-4 shadow-lg group-hover:rotate-6 transition-transform relative z-10">
            <Layers size={24} />
          </div>
          <h3 className="text-xl font-bold text-md-on-primary-container mb-2 relative z-10">Flashcards</h3>
          <p className="text-md-on-primary-container/70 text-sm relative z-10">
            Flip cards to learn meaning within sentence context. Best for first-time learning.
          </p>
        </button>

        {/* Dictation (Active) */}
        <button
          onClick={() => onSelect('dictation')}
          className="relative overflow-hidden bg-md-secondary-container p-6 rounded-3xl text-left hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md group"
        >
          <Ripple />
          <div className="bg-md-on-secondary-container w-12 h-12 rounded-xl flex items-center justify-center text-md-secondary-container mb-4 shadow-lg group-hover:-rotate-6 transition-transform relative z-10">
            <Mic size={24} />
          </div>
          <h3 className="text-xl font-bold text-md-on-secondary-container mb-2 relative z-10">Dictation</h3>
          <p className="text-md-on-secondary-container/70 text-sm relative z-10">
            Listen to the pronunciation and type the word. Configurable hints available.
          </p>
        </button>

        {/* Fill in Blanks (Future) */}
        <div className="relative bg-md-surface-container/50 p-6 rounded-3xl text-left border-2 border-dashed border-md-outline/20 opacity-60 cursor-not-allowed">
          <div className="bg-md-outline/20 w-12 h-12 rounded-xl flex items-center justify-center text-md-outline mb-4">
             <Edit3 size={24} />
          </div>
          <h3 className="text-xl font-bold text-md-outline mb-2">Cloze Test</h3>
          <p className="text-md-outline/70 text-sm">
            Fill in the blank words in the sentence. Coming soon.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
