import React from 'react';
import { Settings, ArrowLeft } from 'lucide-react';
import { Ripple } from './Ripple';
import { Logo } from './Logo';

interface TopBarProps {
  title?: string;
  showBack: boolean;
  onBack: () => void;
  onSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title = "CineVocab", showBack, onBack, onSettings }) => {
  return (
    <div className="sticky top-0 z-50 px-4 py-3 bg-md-surface/80 backdrop-blur-md flex items-center justify-between border-b border-transparent transition-all">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button 
            onClick={onBack}
            className="relative overflow-hidden p-2 rounded-full hover:bg-md-surface-container text-md-on-surface transition-colors"
          >
            <Ripple />
            <ArrowLeft size={24} className="relative z-10" />
          </button>
        ) : (
          <Logo size={32} />
        )}
        <h1 className={`text-xl font-bold text-md-on-surface tracking-tight ${!showBack ? 'ml-0' : ''}`}>
          {title}
        </h1>
      </div>
      
      <button 
        onClick={onSettings}
        className="relative overflow-hidden p-2 rounded-full hover:bg-md-surface-container text-md-on-surface transition-colors"
      >
        <Ripple />
        <Settings size={24} className="relative z-10" />
      </button>
    </div>
  );
};
