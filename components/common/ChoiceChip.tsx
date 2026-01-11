import React from 'react';
import { Ripple } from './Ripple';

interface ChoiceChipProps {
  label: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export const ChoiceChip: React.FC<ChoiceChipProps> = ({ label, selected, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden px-4 py-2 rounded-xl text-sm font-medium border ${
        selected
          ? 'bg-md-primary text-md-on-primary shadow-md border-md-primary'
          : 'bg-white dark:bg-md-surface-container text-md-on-surface border-md-outline/20 hover:bg-md-surface-container-high'
      } ${className}`}
    >
      <Ripple color={selected ? "rgba(255,255,255,0.3)" : "var(--md-primary)"} />
      <span className="relative z-10">{label}</span>
    </button>
  );
};