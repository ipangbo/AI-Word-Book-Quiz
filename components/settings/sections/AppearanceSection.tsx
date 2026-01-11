import React from 'react';
import { Palette, Sun, Moon, Monitor, Type } from 'lucide-react';
import { ThemeName, ThemeMode, FontSizeLevel, SEED_COLORS } from '../../../utils/theme';
import { Ripple } from '../../common/Ripple';
import { ChoiceChip } from '../../common/ChoiceChip';

interface AppearanceSectionProps {
  currentTheme: ThemeName;
  themeMode: ThemeMode;
  customColor: string;
  fontSize: FontSizeLevel;
  onThemeChange: (name: ThemeName) => void;
  onModeChange: (mode: ThemeMode) => void;
  onColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFontSizeChange: (level: FontSizeLevel) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  currentTheme,
  themeMode,
  customColor,
  fontSize,
  onThemeChange,
  onModeChange,
  onColorChange,
  onFontSizeChange
}) => {
  return (
    <div className="bg-white dark:bg-md-surface-container rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6 z-0">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="text-md-primary" />
        <h3 className="text-xl font-bold text-md-on-surface">Appearance</h3>
      </div>

      {/* Mode Selector */}
      <div className="bg-md-surface-container/50 p-1 rounded-full flex mb-6 relative">
        <div className="absolute inset-y-1 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] bg-md-secondary-container shadow-sm rounded-full" 
          style={{ 
            width: '33.33%', 
            left: themeMode === 'light' ? '0.5%' : themeMode === 'dark' ? '33.33%' : '66.16%' 
          }} 
        />
        {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-colors ${themeMode === mode ? 'text-md-on-secondary-container' : 'text-md-outline hover:text-md-on-surface/80'}`}
          >
            <Ripple />
            {mode === 'light' && <Sun size={18} />}
            {mode === 'dark' && <Moon size={18} />}
            {mode === 'system' && <Monitor size={18} />}
            <span className="capitalize">{mode}</span>
          </button>
        ))}
      </div>

      {/* Color Selector */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-6">
        {(Object.keys(SEED_COLORS) as ThemeName[]).map((theme) => (
          <button
            key={theme}
            onClick={() => onThemeChange(theme)}
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
          onClick={() => onThemeChange('custom')}
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
              onChange={onColorChange}
              className="absolute -top-4 -left-4 w-16 h-16 cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>

      {/* Font Size Selector */}
      <div className="pt-6 border-t border-md-outline/10">
        <div className="flex items-center gap-2 mb-3">
          <Type className="text-md-outline" size={18} />
          <span className="text-sm font-bold uppercase tracking-wider text-md-outline">UI Scale / Font Size</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['small', 'medium', 'large', 'xl'] as FontSizeLevel[]).map(size => (
            <ChoiceChip
              key={size}
              label={size === 'xl' ? 'Extra Large' : size.charAt(0).toUpperCase() + size.slice(1)}
              selected={fontSize === size}
              onClick={() => onFontSizeChange(size)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};