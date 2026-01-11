import React from 'react';
import { Keyboard } from 'lucide-react';
import { DictationGlobalSettings } from '../../../types';
import { Switch } from '../../common/Switch';

interface DictationDefaultsSectionProps {
  settings: DictationGlobalSettings;
  onChange: (key: keyof DictationGlobalSettings, value: any) => void;
}

export const DictationDefaultsSection: React.FC<DictationDefaultsSectionProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-white dark:bg-md-surface-container rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6">
        <Keyboard className="text-md-primary" />
        <h3 className="text-xl font-bold text-md-on-surface">Dictation Defaults</h3>
      </div>
      
      <div className="space-y-1 mb-6">
        <p className="text-sm font-bold text-md-outline uppercase mb-2 tracking-wider">Visible Hints</p>
        <Switch 
          checked={settings.defaultShowPhonetic} 
          onChange={(v) => onChange('defaultShowPhonetic', v)}
          label="Show Phonetic"
        />
        <Switch 
          checked={settings.defaultShowPos} 
          onChange={(v) => onChange('defaultShowPos', v)}
          label="Show Part of Speech"
        />
        <Switch 
          checked={settings.defaultShowDefinition} 
          onChange={(v) => onChange('defaultShowDefinition', v)}
          label="Show Definition"
        />
        <Switch 
          checked={settings.defaultShowTranslation} 
          onChange={(v) => onChange('defaultShowTranslation', v)}
          label="Show Translation (CN)"
        />
        <Switch 
          checked={settings.defaultShowSentence} 
          onChange={(v) => onChange('defaultShowSentence', v)}
          label="Show Masked Sentence"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-base font-medium text-md-outline">Correct Feedback</label>
            <span className="text-base font-mono text-md-primary">{(settings.correctDelay / 1000).toFixed(1)}s</span>
          </div>
          <input 
            type="range" min="500" max="5000" step="100"
            value={settings.correctDelay}
            onChange={(e) => onChange('correctDelay', parseInt(e.target.value))}
            className="w-full accent-md-primary h-2 bg-md-secondary-container rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-base font-medium text-md-outline">Error Feedback</label>
            <span className="text-base font-mono text-md-primary">{(settings.incorrectDelay / 1000).toFixed(1)}s</span>
          </div>
          <input 
            type="range" min="1000" max="10000" step="500"
            value={settings.incorrectDelay}
            onChange={(e) => onChange('incorrectDelay', parseInt(e.target.value))}
            className="w-full accent-md-primary h-2 bg-md-secondary-container rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};