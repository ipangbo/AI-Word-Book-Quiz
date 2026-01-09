
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ClipboardPaste, FileUp, FileText, X } from 'lucide-react';
import { parseInputData } from '../utils/parser';
import { WordEntry } from '../types';
import { Ripple } from './Ripple';
import { Logo } from './Logo';
import { ToastType } from './Toast';

interface ImportScreenProps {
  onDataLoaded: (data: WordEntry[]) => void;
  showToast: (msg: string, type: ToastType) => void;
}

export const ImportScreen: React.FC<ImportScreenProps> = ({ onDataLoaded, showToast }) => {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = () => {
    if (!text.trim()) {
      showToast('Please paste or upload some content first.', 'error');
      return;
    }

    try {
      const parsed = parseInputData(text);
      if (parsed.length === 0) {
        showToast('No valid \\SentenceBlock found. Please check your format.', 'error');
        return;
      }
      onDataLoaded(parsed);
    } catch (e) {
      console.error(e);
      showToast('An error occurred while parsing. Please check the syntax.', 'error');
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(prev => (prev ? prev + '\n\n' + clipboardText : clipboardText));
        showToast('Content appended from clipboard.', 'info');
      } else {
        showToast('Clipboard is empty.', 'info');
      }
    } catch (err) {
      showToast('Failed to read from clipboard. Please paste manually.', 'error');
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsText(file);
      });
    });

    try {
      const contents = await Promise.all(filePromises);
      const mergedContent = contents.join('\n\n');
      setText(prev => (prev ? prev + '\n\n' + mergedContent : mergedContent));
      showToast(`Successfully loaded ${files.length} file(s).`, 'success');
    } catch (err) {
      showToast('Error reading one or more files.', 'error');
      console.error(err);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center w-full max-w-2xl mx-auto p-6 relative"
    >
      <div className="mb-6 text-center mt-4">
        <Logo size={80} className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-md-on-surface mb-2">Import Source</h1>
        <p className="text-md-outline">Paste content or upload .tex/.txt files to begin your learning session.</p>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full mb-6 p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group ${
          isDragging 
            ? 'border-md-primary bg-md-primary/5' 
            : 'border-md-outline/30 bg-md-surface-container/30 hover:bg-md-surface-container/50 hover:border-md-primary/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Ripple />
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept=".tex,.txt" 
          className="hidden" 
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-md-primary text-md-on-primary' : 'bg-md-primary-container text-md-primary'}`}>
          <FileUp size={32} />
        </div>
        <p className="font-bold text-md-on-surface">Click to upload or drag & drop</p>
        <p className="text-xs text-md-outline mt-1 uppercase tracking-widest font-medium">Supports multiple .tex or .txt files</p>
      </div>

      <div className="w-full relative group mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-md-outline uppercase ml-2">Raw TeX Data</label>
          <div className="flex gap-2">
            {text && (
              <button
                onClick={() => setText('')}
                className="relative overflow-hidden flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-md-error hover:bg-md-error-container/50 transition-colors"
              >
                <Ripple color="rgba(179, 38, 30, 0.1)" />
                <X size={14} />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={handlePaste}
              className="relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-md-primary hover:bg-md-primary/10 transition-colors"
            >
              <Ripple />
              <ClipboardPaste size={18} />
              <span>Paste</span>
            </button>
          </div>
        </div>
        <div className="relative">
          <textarea
            className="w-full h-48 p-4 rounded-3xl bg-md-surface-container border-2 border-transparent focus:border-md-primary focus:outline-none transition-all resize-none text-md-on-surface font-mono text-sm shadow-sm placeholder:text-md-outline/50"
            placeholder="\SentenceBlock[0:09:57]{...}{...}{ ... }"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {!text && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <FileText size={48} className="text-md-outline" />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleParse}
        className="relative overflow-hidden w-full sm:w-auto bg-md-primary text-md-on-primary px-10 py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
      >
        <Ripple color="rgba(255,255,255,0.3)" />
        <span className="relative z-10">Parse Data</span>
        <ArrowRight size={20} className="relative z-10" />
      </button>
    </motion.div>
  );
};
