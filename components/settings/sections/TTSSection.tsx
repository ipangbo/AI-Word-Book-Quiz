import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ChevronDown, Check, Gauge, Activity, Play } from 'lucide-react';
import { TTSConfig, speak } from '../../../utils/tts';
import { Ripple } from '../../common/Ripple';

interface TTSSectionProps {
  config: TTSConfig;
  voices: SpeechSynthesisVoice[];
  onChange: (key: keyof TTSConfig, value: any) => void;
}

export const TTSSection: React.FC<TTSSectionProps> = ({ config, voices, onChange }) => {
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVoiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedVoiceName = () => {
    if (!config.voiceURI) return "Default System Voice";
    const v = voices.find(v => v.voiceURI === config.voiceURI);
    return v ? `${v.name} (${v.lang})` : "Unknown Voice";
  };

  const testVoice = () => {
    speak("The quick brown fox jumps over the lazy dog.");
  };

  return (
    <div className="bg-white dark:bg-md-surface-container rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6 relative z-20">
      <div className="flex items-center gap-3 mb-6">
        <Mic className="text-md-primary" />
        <h3 className="text-xl font-bold text-md-on-surface">Voice & Playback</h3>
      </div>

      <div className="mb-6 relative" ref={dropdownRef}>
        <label className="block text-base font-medium text-md-outline mb-2">Preferred Voice</label>
        <button
          onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
          className={`w-full text-left p-4 rounded-t-xl transition-all duration-200 outline-none border-b flex items-center justify-between group relative overflow-hidden ${
            isVoiceDropdownOpen 
              ? 'bg-md-secondary-container dark:bg-md-secondary-container/30 rounded-b-none border-md-outline/40 dark:border-md-outline/10' 
              : 'bg-md-surface-container dark:bg-black/20 rounded-b-xl hover:bg-md-secondary-container/50 border-md-outline/40 dark:border-md-outline/10'
          }`}
        >
          <Ripple />
          <div className="flex flex-col relative z-10">
            <span className="text-md-on-surface text-lg truncate pr-8">
              {getSelectedVoiceName()}
            </span>
          </div>
          <motion.div
            className="relative z-10"
            animate={{ rotate: isVoiceDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="text-md-outline" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isVoiceDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-md-surface-container rounded-b-xl shadow-xl dark:shadow-black/50 border border-md-outline/20 dark:border-md-outline/10 border-t-0 overflow-hidden z-50 max-h-64 overflow-y-auto"
            >
              <div 
                className={`p-4 cursor-pointer flex items-center justify-between hover:bg-md-on-surface/5 transition-colors relative ${!config.voiceURI ? 'bg-md-secondary-container/50 dark:bg-md-secondary-container/30' : ''}`}
                onClick={() => {
                  onChange('voiceURI', null);
                  setIsVoiceDropdownOpen(false);
                }}
              >
                <Ripple />
                <span className={`text-base ${!config.voiceURI ? 'text-md-primary font-bold' : 'text-md-on-surface'}`}>Default System Voice</span>
                {!config.voiceURI && <Check size={18} className="text-md-primary" />}
              </div>
              {voices.map(v => (
                <div
                  key={v.voiceURI}
                  className={`p-4 cursor-pointer flex items-center justify-between hover:bg-md-on-surface/5 transition-colors relative ${config.voiceURI === v.voiceURI ? 'bg-md-secondary-container/50 dark:bg-md-secondary-container/30' : ''}`}
                  onClick={() => {
                    onChange('voiceURI', v.voiceURI);
                    setIsVoiceDropdownOpen(false);
                  }}
                >
                  <Ripple />
                  <span className={`text-base truncate ${config.voiceURI === v.voiceURI ? 'text-md-primary font-bold' : 'text-md-on-surface'}`}>{v.name}</span>
                  {config.voiceURI === v.voiceURI && <Check size={18} className="text-md-primary" />}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
        <div>
          <div className="flex justify-between mb-2">
            <label className="flex items-center gap-2 text-base font-medium text-md-outline">
              <Gauge size={16} /> Speed
            </label>
            <span className="text-base font-mono text-md-primary">{config.rate.toFixed(1)}x</span>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1"
            value={config.rate}
            onChange={(e) => onChange('rate', parseFloat(e.target.value))}
            className="w-full accent-md-primary h-2 bg-md-secondary-container rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="flex items-center gap-2 text-base font-medium text-md-outline">
              <Activity size={16} /> Pitch
            </label>
            <span className="text-base font-mono text-md-primary">{config.pitch.toFixed(1)}</span>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1"
            value={config.pitch}
            onChange={(e) => onChange('pitch', parseFloat(e.target.value))}
            className="w-full accent-md-primary h-2 bg-md-secondary-container rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <button 
        onClick={testVoice}
        className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-full bg-md-secondary-container text-md-on-secondary-container font-medium hover:opacity-90 transition-opacity"
      >
        <Ripple />
        <Play size={18} fill="currentColor" className="relative z-10" />
        <span className="relative z-10 text-base">Test Voice</span>
      </button>
    </div>
  );
};