import React, { useState, useEffect, useRef } from 'react';
import { Settings, ArrowLeft, HelpCircle, Compass } from 'lucide-react';
import { Ripple } from './common/Ripple';
import { Logo } from './common/Logo';

interface TopBarProps {
  title?: string;
  showBack: boolean;
  onBack: () => void;
  onSettings: () => void;
  onHelp?: () => void;
  onEcosystem: () => void;
  showHelp?: boolean;
  showSettings?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  title = "CineVocab", 
  showBack, 
  onBack, 
  onSettings,
  onHelp,
  onEcosystem,
  showHelp = false,
  showSettings = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Reset visibility when navigating to a new screen/title (e.g. Opening Settings)
  useEffect(() => {
    setIsVisible(true);
  }, [title]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        if (currentScrollY > lastScrollY.current) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-md-surface/90 backdrop-blur-md flex items-center justify-between border-b border-transparent transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 shadow-sm' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center gap-3">
        {showBack ? (
          <button 
            onClick={onBack}
            className="relative overflow-hidden p-2 rounded-full hover:bg-md-surface-container text-md-on-surface transition-colors group"
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
      
      <div className="flex items-center gap-1">
        <button 
          onClick={onEcosystem}
          className="relative overflow-hidden p-2 rounded-full hover:bg-md-surface-container text-md-primary transition-colors group"
          title="学习生态闭环"
        >
          <Ripple />
          <Compass size={24} className="relative z-10" />
        </button>
        
        {showHelp && onHelp && (
          <button 
            onClick={onHelp}
            className="relative overflow-hidden p-2 rounded-full hover:bg-md-surface-container text-md-on-surface transition-colors group"
            title="Help & FAQ"
          >
            <Ripple />
            <HelpCircle size={24} className="relative z-10" />
          </button>
        )}
        
        {showSettings && (
          <button 
            onClick={onSettings}
            className="relative overflow-hidden p-2 rounded-full hover:bg-md-surface-container text-md-on-surface transition-colors group"
          >
            <Ripple />
            <Settings size={24} className="relative z-10" />
          </button>
        )}
      </div>
    </div>
  );
};