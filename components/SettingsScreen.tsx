
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, applyTheme, ThemeName, SEED_COLORS } from '../utils/theme';
import { Palette, Info, Mic, Volume2, Gauge, Play, Activity, Check, ChevronDown, Keyboard, FlaskConical, FileCode, Loader2, Download, Search, Clock, Trash2, History } from 'lucide-react';
import { getEnglishVoices, getTTSConfig, saveTTSConfig, TTSConfig, speak } from '../utils/tts';
import { getDictationSettings, saveDictationSettings } from '../utils/settings';
import { DictationGlobalSettings, WordEntry } from '../types';
import { parseInputData } from '../utils/parser';
import { Ripple } from './Ripple';
import { Logo } from './Logo';
import { Switch } from './Switch';
import { ToastType } from './Toast';

const RECENT_FILES_KEY = 'cinevocab_recent_test_files';

interface SettingsScreenProps {
  onQuickImport?: (data: WordEntry[]) => void;
  showToast?: (msg: string, type: ToastType) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onQuickImport, showToast }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('violet');
  const [customColor, setCustomColor] = useState('#6750A4');
  
  // TTS State
  const [ttsConfig, setTtsConfig] = useState<TTSConfig>(getTTSConfig());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dictation Settings State
  const [dictSettings, setDictSettings] = useState<DictationGlobalSettings>(getDictationSettings());

  // Dev Tools State
  const [isDevVisible, setIsDevVisible] = useState(false);
  const [devClickCount, setDevClickCount] = useState(0);
  const [testFileName, setTestFileName] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [recentFiles, setRecentFiles] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_FILES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Load Voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const available = getEnglishVoices();
      setVoices(available);
    };

    loadVoices();
    
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
        }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVoiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (name: ThemeName) => {
    setCurrentTheme(name);
    applyTheme(name, name === 'custom' ? customColor : undefined);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (currentTheme === 'custom') {
      applyTheme('custom', color);
    }
  };

  const handleTTSChange = (key: keyof TTSConfig, value: string | number | null) => {
    const newConfig = { ...ttsConfig, [key]: value };
    setTtsConfig(newConfig);
    saveTTSConfig(newConfig);
  };

  const handleDictSettingChange = (key: keyof DictationGlobalSettings, value: any) => {
      const newSettings = { ...dictSettings, [key]: value };
      setDictSettings(newSettings);
      saveDictationSettings(newSettings);
  };

  const testVoice = () => {
     speak("The quick brown fox jumps over the lazy dog.");
  };

  const handleVersionClick = () => {
    const newCount = devClickCount + 1;
    if (newCount >= 5) {
      setIsDevVisible(true);
      showToast?.('Developer Mode Enabled', 'info');
      setDevClickCount(0);
    } else {
      setDevClickCount(newCount);
      setTimeout(() => setDevClickCount(0), 2000);
    }
  };

  const saveToHistory = (fileName: string) => {
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f !== fileName);
      const updated = [fileName, ...filtered].slice(0, 10);
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentFiles([]);
    localStorage.removeItem(RECENT_FILES_KEY);
    showToast?.('History cleared', 'info');
  };

  const handleFileFetch = async () => {
    if (!onQuickImport || isFetching || !testFileName.trim()) return;
    
    setIsFetching(true);
    const fileName = testFileName.trim().endsWith('.tex') ? testFileName.trim() : `${testFileName.trim()}.tex`;
    
    try {
      const response = await fetch(`/test_data/${fileName}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File "${fileName}" not found in /test_data/ folder.`);
        }
        throw new Error(`Server returned ${response.status}`);
      }
      
      const content = await response.text();
      const parsed = parseInputData(content);
      
      if (parsed.length > 0) {
        saveToHistory(fileName);
        onQuickImport(parsed);
      } else {
        showToast?.('No valid CineVocab data found in the file.', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast?.(e.message || 'Failed to fetch test file.', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const getSelectedVoiceName = () => {
    if (!ttsConfig.voiceURI) return "Default System Voice";
    const v = voices.find(v => v.voiceURI === ttsConfig.voiceURI);
    return v ? `${v.name} (${v.lang})` : "Unknown Voice";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 max-w-2xl mx-auto pb-20"
    >
      <h2 className="text-3xl font-bold text-md-on-surface mb-8">Settings</h2>

      {/* --- Dictation Settings Section --- */}
      <div className="bg-white rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
             <Keyboard className="text-md-primary" />
             <h3 className="text-xl font-bold text-md-on-surface">Dictation Defaults</h3>
          </div>
          
          <div className="space-y-1 mb-6">
              <p className="text-xs font-bold text-md-outline uppercase mb-2">Visible Hints</p>
              <Switch 
                checked={dictSettings.defaultShowPhonetic} 
                onChange={(v) => handleDictSettingChange('defaultShowPhonetic', v)}
                label="Show Phonetic"
              />
              <Switch 
                checked={dictSettings.defaultShowPos} 
                onChange={(v) => handleDictSettingChange('defaultShowPos', v)}
                label="Show Part of Speech"
              />
              <Switch 
                checked={dictSettings.defaultShowDefinition} 
                onChange={(v) => handleDictSettingChange('defaultShowDefinition', v)}
                label="Show Definition"
              />
              <Switch 
                checked={dictSettings.defaultShowTranslation} 
                onChange={(v) => handleDictSettingChange('defaultShowTranslation', v)}
                label="Show Translation (CN)"
              />
              <Switch 
                checked={dictSettings.defaultShowSentence} 
                onChange={(v) => handleDictSettingChange('defaultShowSentence', v)}
                label="Show Masked Sentence"
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-md-outline">Correct Feedback</label>
                      <span className="text-sm font-mono text-md-primary">{(dictSettings.correctDelay / 1000).toFixed(1)}s</span>
                  </div>
                  <input 
                    type="range" min="500" max="5000" step="100"
                    value={dictSettings.correctDelay}
                    onChange={(e) => handleDictSettingChange('correctDelay', parseInt(e.target.value))}
                    className="w-full accent-md-primary h-2 bg-md-surface-container rounded-lg appearance-none cursor-pointer"
                  />
              </div>
              <div>
                  <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-md-outline">Error Feedback</label>
                      <span className="text-sm font-mono text-md-primary">{(dictSettings.incorrectDelay / 1000).toFixed(1)}s</span>
                  </div>
                  <input 
                    type="range" min="1000" max="10000" step="500"
                    value={dictSettings.incorrectDelay}
                    onChange={(e) => handleDictSettingChange('incorrectDelay', parseInt(e.target.value))}
                    className="w-full accent-md-primary h-2 bg-md-surface-container rounded-lg appearance-none cursor-pointer"
                  />
              </div>
          </div>
      </div>

      {/* --- TTS Section --- */}
      <div className="bg-white rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6 relative z-20">
        <div className="flex items-center gap-3 mb-6">
          <Mic className="text-md-primary" />
          <h3 className="text-xl font-bold text-md-on-surface">Voice & Playback</h3>
        </div>

        <div className="mb-6 relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-md-outline mb-2">Preferred Voice</label>
          <button
            onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
            className={`w-full text-left p-4 rounded-t-xl transition-colors outline-none border-b border-md-outline/40 flex items-center justify-between group relative overflow-hidden ${
              isVoiceDropdownOpen ? 'bg-md-secondary-container rounded-b-none' : 'bg-md-surface-container rounded-b-xl hover:bg-md-secondary-container/50'
            }`}
          >
            <Ripple />
            <div className="flex flex-col relative z-10">
                 <span className="text-md-on-surface text-base truncate pr-8">
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
                className="absolute top-full left-0 right-0 bg-md-surface-container rounded-b-xl shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto border-t border-md-outline/10"
              >
                <div 
                   className={`p-4 cursor-pointer flex items-center justify-between hover:bg-md-on-surface/5 transition-colors relative ${!ttsConfig.voiceURI ? 'bg-md-secondary-container/50' : ''}`}
                   onClick={() => {
                     handleTTSChange('voiceURI', null);
                     setIsVoiceDropdownOpen(false);
                   }}
                >
                   <Ripple />
                   <span className={`text-sm ${!ttsConfig.voiceURI ? 'text-md-primary font-bold' : 'text-md-on-surface'}`}>Default System Voice</span>
                   {!ttsConfig.voiceURI && <Check size={18} className="text-md-primary" />}
                </div>
                {voices.map(v => (
                  <div
                    key={v.voiceURI}
                    className={`p-4 cursor-pointer flex items-center justify-between hover:bg-md-on-surface/5 transition-colors relative ${ttsConfig.voiceURI === v.voiceURI ? 'bg-md-secondary-container/50' : ''}`}
                    onClick={() => {
                      handleTTSChange('voiceURI', v.voiceURI);
                      setIsVoiceDropdownOpen(false);
                    }}
                  >
                    <Ripple />
                    <span className={`text-sm truncate ${ttsConfig.voiceURI === v.voiceURI ? 'text-md-primary font-bold' : 'text-md-on-surface'}`}>{v.name}</span>
                    {ttsConfig.voiceURI === v.voiceURI && <Check size={18} className="text-md-primary" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
            <div>
                <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-md-outline">
                        <Gauge size={16} /> Speed
                    </label>
                    <span className="text-sm font-mono text-md-primary">{ttsConfig.rate.toFixed(1)}x</span>
                </div>
                <input 
                    type="range" min="0.5" max="2.0" step="0.1"
                    value={ttsConfig.rate}
                    onChange={(e) => handleTTSChange('rate', parseFloat(e.target.value))}
                    className="w-full accent-md-primary h-2 bg-md-surface-container rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <div>
                <div className="flex justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-md-outline">
                        <Activity size={16} /> Pitch
                    </label>
                    <span className="text-sm font-mono text-md-primary">{ttsConfig.pitch.toFixed(1)}</span>
                </div>
                <input 
                    type="range" min="0.5" max="2.0" step="0.1"
                    value={ttsConfig.pitch}
                    onChange={(e) => handleTTSChange('pitch', parseFloat(e.target.value))}
                    className="w-full accent-md-primary h-2 bg-md-surface-container rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>

        <button 
          onClick={testVoice}
          className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-full bg-md-secondary-container text-md-on-secondary-container font-medium hover:opacity-90 transition-opacity"
        >
          <Ripple />
          <Play size={18} fill="currentColor" className="relative z-10" />
          <span className="relative z-10">Test Voice</span>
        </button>
      </div>


      {/* --- Theme Section --- */}
      <div className="bg-white rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6 z-0">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-md-primary" />
          <h3 className="text-xl font-bold text-md-on-surface">App Theme</h3>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {(Object.keys(SEED_COLORS) as ThemeName[]).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`relative overflow-hidden aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all group ${
                currentTheme === theme 
                ? 'border-md-primary bg-md-primary-container/20' 
                : 'border-transparent hover:bg-md-surface-container'
              }`}
              title={theme}
            >
              <Ripple />
              <div 
                className="w-8 h-8 rounded-full shadow-sm relative z-10" 
                style={{ backgroundColor: SEED_COLORS[theme as keyof typeof SEED_COLORS] }}
              />
            </button>
          ))}
          
          <div
             onClick={() => handleThemeChange('custom')}
             className={`relative overflow-hidden aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                currentTheme === 'custom' 
                ? 'border-md-primary bg-md-primary-container/20' 
                : 'border-transparent hover:bg-md-surface-container'
              }`}
             title="Custom Color"
          >
             <Ripple />
             <div className="relative w-8 h-8 rounded-full shadow-sm overflow-hidden bg-gradient-to-br from-red-500 via-green-500 to-blue-500 z-10">
                <input 
                  type="color" 
                  value={customColor} 
                  onChange={handleColorChange}
                  className="absolute -top-4 -left-4 w-16 h-16 cursor-pointer opacity-0"
                />
             </div>
          </div>
        </div>
        <div className="mt-2 text-center text-sm text-md-outline capitalize">
            {currentTheme}
        </div>
      </div>

      {/* --- About Section --- */}
      <div className="bg-white rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="p-1 bg-md-surface-container rounded-2xl shrink-0">
            <Logo size={48} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Info className="text-md-primary" size={20} />
              <h3 className="text-xl font-bold text-md-on-surface">About</h3>
            </div>
            <p 
              className="text-md-on-surface cursor-default select-none active:scale-95 transition-transform"
              onClick={handleVersionClick}
            >
              <span className="font-bold">CineVocab</span> v1.0.0
            </p>
          </div>
        </div>
        <p className="text-md-outline mt-2 text-sm leading-relaxed">
          A Material You styled vocabulary learning application designed to help you learn English through the context of movies and TV shows.
        </p>
      </div>

      {/* --- Developer / Test Data Section --- */}
      <AnimatePresence>
        {isDevVisible && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-md-surface-container rounded-3xl p-6 border border-md-primary/20 shadow-inner overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FlaskConical className="text-md-primary" size={24} />
                <h3 className="text-xl font-bold text-md-on-surface">Developer Tools</h3>
              </div>
              <button 
                onClick={() => setIsDevVisible(false)}
                className="text-xs font-bold text-md-outline hover:text-md-error transition-colors uppercase px-2 py-1"
              >
                Disable
              </button>
            </div>
            
            <p className="text-xs font-bold text-md-outline uppercase mb-4 tracking-wider">Fetch Remote Test Data</p>
            
            <div className="flex flex-col gap-3 mb-6">
               <div className="relative">
                  <input 
                    type="text"
                    value={testFileName}
                    onChange={(e) => setTestFileName(e.target.value)}
                    placeholder="e.g. sample.tex"
                    className="w-full bg-white border border-md-outline/20 rounded-2xl px-12 py-4 focus:outline-none focus:border-md-primary transition-colors text-md-on-surface"
                    onKeyDown={(e) => e.key === 'Enter' && handleFileFetch()}
                  />
                  <FileCode className="absolute left-4 top-1/2 -translate-y-1/2 text-md-outline/50" size={20} />
               </div>

               <button
                  onClick={handleFileFetch}
                  disabled={isFetching || !testFileName.trim()}
                  className={`relative overflow-hidden w-full bg-md-primary text-md-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${isFetching || !testFileName.trim() ? 'opacity-50' : 'hover:shadow-lg active:scale-[0.98]'}`}
                >
                  <Ripple color="rgba(255,255,255,0.3)" />
                  {isFetching ? (
                    <Loader2 size={20} className="animate-spin relative z-10" />
                  ) : (
                    <Download size={20} className="relative z-10" />
                  )}
                  <span className="relative z-10">{isFetching ? 'Fetching...' : 'Fetch & Import'}</span>
                </button>
            </div>

            {/* Recent Files History */}
            <AnimatePresence>
              {recentFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/40 rounded-2xl p-4 border border-md-outline/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-md-outline">
                      <History size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Recent Files</span>
                    </div>
                    <button 
                      onClick={clearHistory}
                      className="flex items-center gap-1 text-[10px] font-bold text-md-error hover:bg-md-error-container/50 px-2 py-1 rounded-full transition-colors"
                    >
                      <Trash2 size={10} />
                      CLEAR
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentFiles.map((file) => (
                      <button
                        key={file}
                        onClick={() => setTestFileName(file)}
                        className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-md-outline/20 text-xs font-medium text-md-on-surface hover:border-md-primary hover:text-md-primary transition-all group"
                      >
                        <Ripple />
                        <Clock size={12} className="text-md-outline group-hover:text-md-primary transition-colors" />
                        <span>{file}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-[10px] text-md-outline text-center mt-6 opacity-50 italic">
              Files are fetched relative to <code className="bg-md-outline/10 px-1 rounded">/test_data/[filename]</code>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
