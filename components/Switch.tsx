
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Ripple } from './Ripple';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  iconOn?: React.ReactNode;
  iconOff?: React.ReactNode;
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  label, 
  iconOn = <Check size={14} className="text-md-on-primary-container" />, 
  iconOff = <X size={14} className="text-md-surface-container" /> 
}) => {
  return (
    <div 
      className="flex items-center justify-between py-3 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      {label && <span className="text-md-on-surface font-medium text-sm flex-1 mr-4">{label}</span>}
      
      <div className={`relative w-[52px] h-[32px] rounded-full transition-colors duration-300 border-2 overflow-hidden ${
        checked 
          ? 'bg-md-primary border-md-primary' 
          : 'bg-md-surface-container border-md-outline'
      }`}>
        {/* Ripple Container for the whole switch track */}
        <div className="absolute inset-0">
             <Ripple color={checked ? "rgba(255,255,255,0.2)" : "var(--md-on-surface)"} />
        </div>

        {/* Thumb */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 rounded-full shadow-sm flex items-center justify-center z-10"
          initial={false}
          animate={{
            left: checked ? 'calc(100% - 28px)' : '4px',
            width: checked ? 24 : 16,
            height: checked ? 24 : 16,
            backgroundColor: checked ? 'var(--md-on-primary)' : 'var(--md-outline)',
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
           {/* Icon inside thumb (only when checked typically in M3, but customizable) */}
           <motion.div 
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0 }}
             className="text-md-primary-container"
           >
             {iconOn}
           </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
