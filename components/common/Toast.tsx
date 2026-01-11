import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { Ripple } from './Ripple';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
  duration?: number;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove, duration]);

  const config = {
    error: {
      bg: 'bg-md-error-container/85',
      border: 'border-md-error/30',
      text: 'text-md-error',
      icon: <AlertCircle size={20} />,
    },
    success: {
      bg: 'bg-md-primary-container/85',
      border: 'border-md-primary/30',
      text: 'text-md-on-primary-container',
      icon: <CheckCircle2 size={20} />,
    },
    info: {
      bg: 'bg-md-secondary-container/85',
      border: 'border-md-outline/30',
      text: 'text-md-on-secondary-container',
      icon: <Info size={20} />,
    },
  }[toast.type];

  return (
    <motion.div
      layout
      initial={{ y: 50, opacity: 0, scale: 0.85 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 0.9, 
        transition: { duration: 0.15 } 
      }}
      className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] border backdrop-blur-xl ${config.bg} ${config.border} ${config.text} min-w-[320px] max-w-md transition-shadow duration-300 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]`}
    >
      <span className="shrink-0 drop-shadow-sm">{config.icon}</span>
      <span className="flex-1 font-medium text-sm leading-tight tracking-tight">
        {toast.message}
      </span>
      <button 
        onClick={() => onRemove(toast.id)}
        className="relative overflow-hidden p-1.5 hover:bg-black/5 rounded-full transition-colors shrink-0 flex items-center justify-center"
      >
        <Ripple />
        <X size={16} className="relative z-10" />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] flex flex-col-reverse items-center gap-4 px-6 pointer-events-none pb-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};