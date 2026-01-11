import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, FileCode, Loader2, Download, History, Trash2, Clock } from 'lucide-react';
import { Ripple } from '../../common/Ripple';
import { parseInputData } from '../../../utils/parser';
import { WordEntry } from '../../../types';

interface DevToolsSectionProps {
  isVisible: boolean;
  onClose: () => void;
  onImport: (data: WordEntry[]) => void;
  showToast?: (msg: string, type: any) => void;
}

const RECENT_FILES_KEY = 'cinevocab_recent_test_files';
const PERMANENT_FILES = ['S05E04.tex'];

export const DevToolsSection: React.FC<DevToolsSectionProps> = ({ isVisible, onClose, onImport, showToast }) => {
  const [testFileName, setTestFileName] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [recentFiles, setRecentFiles] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_FILES_KEY);
    const history = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...PERMANENT_FILES, ...history]));
  });

  const saveToHistory = (fileName: string) => {
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f !== fileName);
      const updated = [fileName, ...filtered].slice(0, 10);
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated.filter(f => !PERMANENT_FILES.includes(f))));
      return Array.from(new Set([...PERMANENT_FILES, ...updated]));
    });
  };

  const clearHistory = () => {
    setRecentFiles(PERMANENT_FILES);
    localStorage.removeItem(RECENT_FILES_KEY);
    showToast?.('History cleared', 'info');
  };

  const handleFileFetch = async () => {
    if (isFetching || !testFileName.trim()) return;
    
    setIsFetching(true);
    const fileName = testFileName.trim().endsWith('.tex') ? testFileName.trim() : `${testFileName.trim()}.tex`;
    
    try {
      // Use relative path 'test_data/' instead of absolute '/test_data/'
      const response = await fetch(`test_data/${fileName}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File "${fileName}" not found in test_data/ folder.`);
        }
        throw new Error(`Server returned ${response.status}`);
      }
      
      const content = await response.text();
      const parsed = parseInputData(content);
      
      if (parsed.length > 0) {
        saveToHistory(fileName);
        onImport(parsed);
      } else {
        showToast?.('No valid CineVocab data found in the file.', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast?.(e.message || 'Failed to fetch test file.', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-md-surface-container rounded-3xl p-6 border border-md-primary/20 shadow-inner overflow-hidden mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FlaskConical className="text-md-primary" size={24} />
              <h3 className="text-xl font-bold text-md-on-surface">Developer Tools</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-sm font-bold text-md-outline hover:text-md-error transition-colors uppercase px-2 py-1"
            >
              Disable
            </button>
          </div>
          
          <p className="text-sm font-bold text-md-outline uppercase mb-4 tracking-wider">Fetch Remote Test Data</p>
          
          <div className="flex flex-col gap-3 mb-6">
            <div className="relative">
              <input 
                type="text"
                value={testFileName}
                onChange={(e) => setTestFileName(e.target.value)}
                placeholder="e.g. sample.tex"
                className="w-full bg-white dark:bg-md-surface border border-md-outline/20 rounded-2xl px-12 py-4 focus:outline-none focus:border-md-primary transition-colors text-md-on-surface text-base"
                onKeyDown={(e) => e.key === 'Enter' && handleFileFetch()}
              />
              <FileCode className="absolute left-4 top-1/2 -translate-y-1/2 text-md-outline/50" size={20} />
            </div>

            <button
              onClick={handleFileFetch}
              disabled={isFetching || !testFileName.trim()}
              className={`relative overflow-hidden w-full bg-md-primary text-md-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${isFetching || !testFileName.trim() ? 'opacity-50' : 'hover:shadow-lg active:scale-[0.98]'}`}
            >
              <Ripple color="rgba(255,255,255,0.3)" />
              {isFetching ? (
                <Loader2 size={20} className="animate-spin relative z-10" />
              ) : (
                <Download size={20} className="relative z-10" />
              )}
              <span className="relative z-10 text-base">{isFetching ? 'Fetching...' : 'Fetch & Import'}</span>
            </button>
          </div>

          <AnimatePresence>
            {recentFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/40 dark:bg-black/20 rounded-2xl p-4 border border-md-outline/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-md-outline">
                    <History size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Recent Files</span>
                  </div>
                  <button 
                    onClick={clearHistory}
                    className="relative overflow-hidden flex items-center gap-1 text-[10px] font-bold text-md-error hover:bg-md-error-container/50 px-2 py-1 rounded-full transition-colors"
                  >
                    <Ripple color="var(--md-error)" />
                    <Trash2 size={10} className="relative z-10" />
                    <span className="relative z-10">CLEAR</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentFiles.map((file) => (
                    <button
                      key={file}
                      onClick={() => setTestFileName(file)}
                      className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-md-surface border border-md-outline/20 text-xs font-medium text-md-on-surface hover:border-md-primary hover:text-md-primary transition-all group"
                    >
                      <Ripple />
                      <Clock size={12} className="text-md-outline group-hover:text-md-primary transition-colors" />
                      <span>{file}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="text-[10px] text-md-outline text-center mt-6 opacity-50 italic">
            Files are fetched relative to <code className="bg-md-outline/10 px-1 rounded">test_data/[filename]</code>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};