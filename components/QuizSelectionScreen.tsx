
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Edit3, Mic, ArrowRight } from 'lucide-react';
import { QuizMode } from '../types';
import { Ripple } from './Ripple';

interface QuizSelectionScreenProps {
  onSelect: (mode: QuizMode) => void;
}

export const QuizSelectionScreen: React.FC<QuizSelectionScreenProps> = ({ onSelect }) => {
  const modes: { 
    id: QuizMode, 
    title: string, 
    description: string, 
    icon: React.ReactNode,
    colorClass: string,
    iconColor: string
  }[] = [
    {
      id: 'flashcard',
      title: 'Flashcards',
      description: 'The foundation of learning. Review words within their original sentence context to build long-term memory.',
      icon: <Layers size={24} />,
      colorClass: 'bg-purple-100',
      iconColor: 'text-purple-700'
    },
    {
      id: 'dictation',
      title: 'Dictation',
      description: 'Master your listening skills. Hear the movie dialogue and type the target word exactly as spoken.',
      icon: <Mic size={24} />,
      colorClass: 'bg-blue-100',
      iconColor: 'text-blue-700'
    },
    {
      id: 'cloze',
      title: 'Cloze Test',
      description: 'Context is king. Fill in the missing gaps in movie lines by analyzing the surrounding text and audio hints.',
      icon: <Edit3 size={24} />,
      colorClass: 'bg-emerald-100',
      iconColor: 'text-emerald-700'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 flex flex-col items-center pb-32"
    >
      <div className="text-left w-full mt-12 mb-12 px-2">
        <h2 className="text-4xl font-bold text-md-on-surface mb-3 tracking-tight">Choose Your Practice</h2>
        <p className="text-md-outline max-w-xl">Choose a specialized method to reinforce your vocabulary and master real-world movie dialogues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {modes.map((mode) => (
          <button 
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="relative overflow-hidden bg-white p-6 rounded-[32px] text-left border border-md-surface-container hover:border-md-primary/30 hover:shadow-lg transition-all group flex flex-col"
          >
            <Ripple />
            
            {/* Header: Icon + Title */}
            <div className="flex items-center gap-4 mb-5 relative z-10">
              <div className={`${mode.colorClass} ${mode.iconColor} w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                {mode.icon}
              </div>
              <h3 className="text-2xl font-bold text-md-on-surface">
                {mode.title}
              </h3>
            </div>
            
            {/* Content: Description */}
            <p className="text-md-outline text-sm leading-relaxed mb-8 flex-1 relative z-10">
              {mode.description}
            </p>

            {/* Footer Action */}
            <div className="flex items-center justify-between mt-auto relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-md-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Start Now
                </span>
                <div className="w-10 h-10 rounded-full bg-md-surface-container flex items-center justify-center group-hover:bg-md-primary group-hover:text-white transition-colors">
                    <ArrowRight size={18} />
                </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
