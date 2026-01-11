import React from 'react';
import { Sliders } from 'lucide-react';
import { GeneralSettings } from '../../../types';
import { ChoiceChip } from '../../common/ChoiceChip';

interface GeneralSectionProps {
  settings: GeneralSettings;
  onChange: (key: keyof GeneralSettings, value: any) => void;
}

export const GeneralSection: React.FC<GeneralSectionProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-white dark:bg-md-surface-container rounded-3xl p-6 border border-md-surface-container shadow-sm mb-6 z-0">
      <div className="flex items-center gap-3 mb-6">
        <Sliders className="text-md-primary" />
        <h3 className="text-xl font-bold text-md-on-surface">General</h3>
      </div>
      <div>
        <p className="text-sm font-bold text-md-outline uppercase mb-2 tracking-wider">History Retention Count</p>
        <div className="flex gap-2">
          {[5, 10, 20, 50].map(opt => (
            <ChoiceChip
              key={opt}
              label={opt.toString()}
              selected={settings.historyLimit === opt}
              onClick={() => onChange('historyLimit', opt)}
            />
          ))}
        </div>
        <p className="text-xs text-md-outline mt-2">Maximum number of recent imports to save.</p>
      </div>
    </div>
  );
};