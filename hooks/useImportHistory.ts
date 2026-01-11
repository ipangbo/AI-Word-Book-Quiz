import { useState, useEffect } from 'react';
import { getGeneralSettings } from '../utils/settings';
import { extractMetadata } from '../utils/parser';
import { WordEntry } from '../types';

const HISTORY_KEY = 'cinevocab_import_history';

export interface HistoryItem {
  id: string;
  alias: string;
  preview: string;
  content: string;
  timestamp: number;
}

export const useImportHistory = (showToast: (msg: string, type: any) => void) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveHistoryItem = (content: string, parsedData: WordEntry[]) => {
    if (!content.trim()) return;
    if (history.length > 0 && history[0].content === content) return;

    const previewWords = parsedData.slice(0, 8).map(w => w.word).join(', ');
    const preview = previewWords + (parsedData.length > 8 ? '...' : '');

    const { title, subtitle } = extractMetadata(content);
    let alias = '';
    if (title) {
        alias = title;
        if (subtitle) alias += ` - ${subtitle}`;
    } else {
        const now = new Date();
        alias = `Import ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      alias,
      preview,
      content,
      timestamp: Date.now(),
    };

    const limit = getGeneralSettings().historyLimit;
    const newHistory = [newItem, ...history].slice(0, limit);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    showToast('History cleared', 'info');
  };

  const updateAlias = (id: string, newAlias: string) => {
    const newHistory = history.map(h => 
      h.id === id ? { ...h, alias: newAlias.trim() || h.alias } : h
    );
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  return {
    history,
    saveHistoryItem,
    deleteHistoryItem,
    clearHistory,
    updateAlias
  };
};