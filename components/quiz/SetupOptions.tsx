import React from 'react';
import { Shuffle, ListOrdered } from 'lucide-react';
import { ChoiceChip } from '../common/ChoiceChip';
import { Switch } from '../common/Switch';

interface SetupOptionsProps {
  totalWords: number;
  count: number;
  onCountChange: (count: number) => void;
  isRandom: boolean;
  onRandomChange: (isRandom: boolean) => void;
}

export const SetupOptions: React.FC<SetupOptionsProps> = ({ 
  totalWords, 
  count, 
  onCountChange, 
  isRandom, 
  onRandomChange 
}) => {
  const options = [5, 10, 20, 50].filter(n => n <= totalWords);
  if (!options.includes(totalWords)) options.push(totalWords);
  const uniqueOptions = Array.from(new Set(options)).sort((a, b) => a - b);

  return (
    <>
      <div className="mb-6 border-b border-md-outline/10 pb-6">
        <label className="block text-sm font-bold text-md-on-secondary-container mb-4">
          Number of Words ({totalWords} available)
        </label>
        <div className="flex flex-wrap gap-2">
          {uniqueOptions.map(opt => (
            <ChoiceChip
              key={opt}
              label={opt === totalWords ? 'All' : opt.toString()}
              selected={count === opt}
              onClick={() => onCountChange(opt)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 border-b border-md-outline/10 pb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isRandom ? 'bg-md-secondary-container text-md-on-secondary-container' : 'text-md-outline'}`}>
            {isRandom ? <Shuffle size={20} /> : <ListOrdered size={20} />}
          </div>
          <div className="flex flex-col">
            <span className="text-md-on-surface font-medium">Randomize Order</span>
            <span className="text-xs text-md-outline">{isRandom ? 'Shuffle words' : 'Sequential order'}</span>
          </div>
        </div>
        <Switch checked={isRandom} onChange={onRandomChange} />
      </div>
    </>
  );
};