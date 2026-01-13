import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThemeName, ThemeMode, FontSizeLevel, FONT_SIZE_KEY, applyTheme, applyFontSize } from '../utils/theme';
import { getEnglishVoices, getTTSConfig, saveTTSConfig, TTSConfig } from '../utils/tts';
import { getDictationSettings, saveDictationSettings, getMCSettings, saveMCSettings, getGeneralSettings, saveGeneralSettings } from '../utils/settings';
import { DictationGlobalSettings, MultipleChoiceGlobalSettings, GeneralSettings, WordEntry } from '../types';
import { Logo } from './common/Logo';
import { ToastType } from './common/Toast';
import { GeneralSection } from './settings/sections/GeneralSection';
import { AppearanceSection } from './settings/sections/AppearanceSection';
import { DictationDefaultsSection } from './settings/sections/DictationDefaultsSection';
import { MCDefaultsSection } from './settings/sections/MCDefaultsSection';
import { TTSSection } from './settings/sections/TTSSection';
import { DevToolsSection } from './settings/sections/DevToolsSection';

const THEME_MODE_KEY = 'cinevocab_theme_mode';
const THEME_NAME_KEY = 'cinevocab_theme_name';
const CUSTOM_COLOR_KEY = 'cinevocab_custom_color';

interface SettingsScreenProps {
  onQuickImport?: (data: WordEntry[]) => void;
  showToast?: (msg: string, type: ToastType) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onQuickImport, showToast }) => {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('violet');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [customColor, setCustomColor] = useState('#6750A4');
  const [fontSize, setFontSize] = useState<FontSizeLevel>('medium');
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(getGeneralSettings());

  // TTS State
  const [ttsConfig, setTtsConfig] = useState<TTSConfig>(getTTSConfig());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Settings State
  const [dictSettings, setDictSettings] = useState<DictationGlobalSettings>(getDictationSettings());
  const [mcSettings, setMcSettings] = useState<MultipleChoiceGlobalSettings>(getMCSettings());

  // Dev Tools State
  const [isDevVisible, setIsDevVisible] = useState(false);
  const [devClickCount, setDevClickCount] = useState(0);

  // Load Settings on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_NAME_KEY) as ThemeName;
    const savedMode = localStorage.getItem(THEME_MODE_KEY) as ThemeMode;
    const savedColor = localStorage.getItem(CUSTOM_COLOR_KEY);
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSizeLevel;

    if (savedTheme) setCurrentTheme(savedTheme);
    if (savedMode) setThemeMode(savedMode);
    if (savedColor) setCustomColor(savedColor);
    if (savedFontSize) setFontSize(savedFontSize);
  }, []);

  // System Theme Listener
  useEffect(() => {
    if (themeMode !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme(currentTheme, 'system', currentTheme === 'custom' ? customColor : undefined);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, currentTheme, customColor]);

  // Apply Theme Effect
  const updateTheme = (name: ThemeName, mode: ThemeMode, color?: string) => {
    applyTheme(name, mode, color);
    localStorage.setItem(THEME_NAME_KEY, name);
    localStorage.setItem(THEME_MODE_KEY, mode);
    if (color) localStorage.setItem(CUSTOM_COLOR_KEY, color);
  };

  const handleThemeChange = (name: ThemeName) => {
    setCurrentTheme(name);
    updateTheme(name, themeMode, name === 'custom' ? customColor : undefined);
  };

  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    updateTheme(currentTheme, mode, currentTheme === 'custom' ? customColor : undefined);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (currentTheme === 'custom') {
      updateTheme('custom', themeMode, color);
    }
  };

  const handleFontSizeChange = (level: FontSizeLevel) => {
    setFontSize(level);
    applyFontSize(level);
    localStorage.setItem(FONT_SIZE_KEY, level);
  };

  // TTS Logic
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

  const handleGeneralSettingChange = (key: keyof GeneralSettings, value: any) => {
      const newSettings = { ...generalSettings, [key]: value };
      setGeneralSettings(newSettings);
      saveGeneralSettings(newSettings);
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

  const handleMCSettingChange = (key: keyof MultipleChoiceGlobalSettings, value: any) => {
      const newSettings = { ...mcSettings, [key]: value };
      setMcSettings(newSettings);
      saveMCSettings(newSettings);
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

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 max-w-2xl mx-auto pb-20"
    >
      <h2 className="text-3xl font-bold text-md-on-surface mb-8">Settings</h2>

      <GeneralSection settings={generalSettings} onChange={handleGeneralSettingChange} />

      <AppearanceSection 
        currentTheme={currentTheme}
        themeMode={themeMode}
        customColor={customColor}
        fontSize={fontSize}
        onThemeChange={handleThemeChange}
        onModeChange={handleModeChange}
        onColorChange={handleColorChange}
        onFontSizeChange={handleFontSizeChange}
      />

      <DictationDefaultsSection settings={dictSettings} onChange={handleDictSettingChange} />

      <MCDefaultsSection settings={mcSettings} onChange={handleMCSettingChange} />

      <TTSSection config={ttsConfig} voices={voices} onChange={handleTTSChange} />

      {/* --- About Section --- */}
      <div className="bg-white dark:bg-md-surface-container rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="p-1 bg-md-surface-container rounded-2xl shrink-0">
            <Logo size={48} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-xl font-bold text-md-on-surface">About</h3>
            </div>
            <p 
              className="text-lg text-md-on-surface cursor-default select-none active:scale-95 transition-transform"
              onClick={handleVersionClick}
            >
              <span className="font-bold">CineVocab</span> v1.2.7
            </p>
          </div>
        </div>
        <p className="text-md-outline mt-3 text-base leading-relaxed">
          A Material You styled vocabulary learning application designed to help you learn English through the context of movies and TV shows.
        </p>
        <div className="mt-4 pt-4 border-t border-md-outline/10 flex items-center justify-between">
           <p className="text-xs text-md-outline">
             © {new Date().getFullYear()} <a href="https://ipangbo.cn" target="_blank" rel="noopener noreferrer" className="text-md-primary hover:underline font-medium">ipangbo.cn</a>
           </p>
           <span className="text-[10px] text-md-outline/40 font-mono">MIT License</span>
        </div>
      </div>

      <DevToolsSection 
        isVisible={isDevVisible} 
        onClose={() => setIsDevVisible(false)} 
        onImport={(d) => { onQuickImport && onQuickImport(d); }}
        showToast={showToast}
      />
    </motion.div>
  );
};