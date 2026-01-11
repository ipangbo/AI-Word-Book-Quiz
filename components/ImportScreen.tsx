import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ClipboardPaste, FileUp, FileText, X, History, Trash2, Edit2, Check, Clock } from 'lucide-react';
import { parseInputData } from '../utils/parser';
import { WordEntry } from '../types';
import { Ripple } from './common/Ripple';
import { Logo } from './common/Logo';
import { ToastType } from './common/Toast';
import { useImportHistory, HistoryItem } from '../hooks/useImportHistory';

interface ImportScreenProps {
  onDataLoaded: (data: WordEntry[]) => void;
  showToast: (msg: string, type: ToastType) => void;
}

export const ImportScreen: React.FC<ImportScreenProps> = ({ onDataLoaded, showToast }) => {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { history, saveHistoryItem, deleteHistoryItem, clearHistory, updateAlias } = useImportHistory(showToast);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditValue(item.alias);
  };

  const handleSaveAlias = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (!editingId) return;
    updateAlias(editingId, editValue);
    setEditingId(null);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setText(item.content);
    showToast(`Loaded "${item.alias}"`, 'info');
  };

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
      saveHistoryItem(text, parsed);
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
      className="w-full max-w-7xl mx-auto p-4 md:p-6 pb-24"
    >
      <div className="mb-8 text-center mt-4">
        <Logo size={80} className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-md-on-surface mb-2">Import Source</h1>
        <p className="text-md-outline">Paste content or upload .tex/.txt files to begin your learning session.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN: Input Area */}
        <div className="flex-1 w-full min-w-0">
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
                className="w-full h-64 p-4 rounded-3xl bg-md-surface-container border-2 border-transparent focus:border-md-primary focus:outline-none transition-all resize-none text-md-on-surface font-mono text-sm shadow-sm placeholder:text-md-outline/50"
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
            className="relative overflow-hidden w-full bg-md-primary text-md-on-primary px-10 py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Ripple color="rgba(255,255,255,0.3)" />
            <span className="relative z-10">Parse Data</span>
            <ArrowRight size={20} className="relative z-10" />
          </button>
        </div>

        {/* RIGHT COLUMN: History Area */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-md-primary">
                 <History size={20} />
                 <h2 className="font-bold text-lg">Recent Imports</h2>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs font-medium text-md-error hover:bg-md-error-container/20 px-2 py-1 rounded transition-colors"
                >
                  Clear All
                </button>
              )}
           </div>

           {history.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-md-surface-container/30 border border-md-outline/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
             >
                <div className="p-3 bg-md-surface-container rounded-full mb-3 text-md-outline/50">
                    <History size={24} />
                </div>
                <p className="text-md-outline text-sm">Parsed data will automatically appear here for quick access.</p>
             </motion.div>
           ) : (
             <div className="flex flex-col">
               <AnimatePresence mode="popLayout" initial={false}>
               {history.map(item => (
                 <motion.div
                   key={item.id}
                   layout
                   initial={{ opacity: 0, scale: 0.8, height: 0 }}
                   animate={{ opacity: 1, scale: 1, height: 'auto', marginBottom: 12 }}
                   exit={{ 
                     opacity: 0, 
                     scale: 0.5, 
                     height: 0,
                     marginBottom: 0,
                     transition: { duration: 0.3, ease: "backIn" } 
                   }}
                   onClick={() => loadFromHistory(item)}
                   className="bg-white dark:bg-md-surface-container border border-md-surface-container hover:border-md-primary/30 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                 >
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 mb-2 relative z-20" onClick={e => e.stopPropagation()}>
                         <input 
                           type="text" 
                           autoFocus
                           value={editValue}
                           onChange={(e) => setEditValue(e.target.value)}
                           onKeyDown={(e) => {
                             if(e.key === 'Enter') handleSaveAlias(e);
                             if(e.key === 'Escape') setEditingId(null);
                           }}
                           onBlur={handleSaveAlias} 
                           className="flex-1 bg-transparent border-b-2 border-md-primary text-md-on-surface font-bold text-sm focus:outline-none"
                         />
                         <button onClick={handleSaveAlias} className="text-green-600 p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                           <Check size={16} />
                         </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between mb-2 relative z-10">
                         <h3 className="font-bold text-sm text-md-on-surface truncate pr-2 flex-1" title={item.alias}>
                           {item.alias}
                         </h3>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => startEditing(e, item)}
                              className="p-1.5 text-md-outline hover:text-md-primary hover:bg-md-primary-container/30 rounded-lg transition-colors"
                              title="Rename"
                            >
                              <Ripple />
                              <Edit2 size={14} className="relative z-10" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHistoryItem(item.id);
                              }}
                              className="p-1.5 text-md-outline hover:text-md-error hover:bg-md-error-container/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Ripple color="var(--md-error)" />
                              <Trash2 size={14} className="relative z-10" />
                            </button>
                         </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-md-outline font-medium mb-3 line-clamp-3 bg-md-surface-container/50 p-2 rounded-lg leading-relaxed select-none relative z-0">
                      {item.preview}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-md-outline/60">
                       <Clock size={10} />
                       <span>{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                 </motion.div>
               ))}
               </AnimatePresence>
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};