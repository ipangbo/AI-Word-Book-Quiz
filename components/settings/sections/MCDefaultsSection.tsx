import React from 'react';
import { ListChecks } from 'lucide-react';
import { MultipleChoiceGlobalSettings } from '../../../types';
import { Switch } from '../../common/Switch';
import { ChoiceChip } from '../../common/ChoiceChip';

interface MCDefaultsSectionProps {
  settings: MultipleChoiceGlobalSettings;
  onChange: (key: keyof MultipleChoiceGlobalSettings, value: any) => void;
}

export const MCDefaultsSection: React.FC<MCDefaultsSectionProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-white dark:bg-md-surface-container rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6">
        <ListChecks className="text-md-primary" />
        <h3 className="text-xl font-bold text-md-on-surface">Multiple Choice Defaults</h3>
      </div>
      
      <div className="mb-6">
        <p className="text-sm font-bold text-md-outline uppercase mb-2 tracking-wider">Default Option Count</p>
        <div className="flex gap-2">
          {[2, 3, 4, 6].map(opt => (
            <ChoiceChip
              key={opt}
              label={opt.toString()}
              selected={settings.defaultOptionCount === opt}
              onClick={() => onChange('defaultOptionCount', opt)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1">
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
      </div>
    </div>
  );
};