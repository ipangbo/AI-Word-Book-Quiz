
import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ImportScreen } from './components/ImportScreen';
import { QuizSetup } from './components/QuizSetup';
import { QuizSession } from './components/QuizSession';
import { DictationSetup } from './components/DictationSetup';
import { DictationSession } from './components/DictationSession';
import { ResultsScreen } from './components/ResultsScreen';
import { TopBar } from './components/TopBar';
import { ReviewScreen } from './components/ReviewScreen';
import { QuizSelectionScreen } from './components/QuizSelectionScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ToastContainer, ToastType, ToastMessage } from './components/Toast';
import { WordEntry, QuizConfig, DictationConfig, QuizMode, DictationMistake } from './types';

type ScreenName = 'home' | 'review' | 'quiz_select' | 'quiz_setup' | 'quiz_session' | 'dictation_setup' | 'dictation_session' | 'results' | 'settings';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [previousScreen, setPreviousScreen] = useState<ScreenName>('home');
  
  const [data, setData] = useState<WordEntry[]>([]);
  
  // Quiz State
  const [quizMode, setQuizMode] = useState<QuizMode>('flashcard');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [dictationConfig, setDictationConfig] = useState<DictationConfig | null>(null);
  
  // Results State
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const [dictationMistakes, setDictationMistakes] = useState<DictationMistake[]>([]);

  // Multi-Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 11) + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const navigateTo = (target: ScreenName) => {
    if (target === 'settings') {
      setPreviousScreen(screen);
    }
    setScreen(target);
  };

  const handleBack = () => {
    switch (screen) {
      case 'settings':
        setScreen(previousScreen);
        break;
      case 'review':
        setScreen('home');
        break;
      case 'quiz_select':
        setScreen('review');
        break;
      case 'quiz_setup':
        setScreen('quiz_select');
        break;
      case 'dictation_setup':
        setScreen('quiz_select');
        break;
      case 'quiz_session':
        setScreen('quiz_setup');
        break;
      case 'dictation_session':
        setScreen('dictation_setup');
        break;
      case 'results':
        setScreen('quiz_select');
        break;
      default:
        break;
    }
  };

  const handleDataLoaded = (parsedData: WordEntry[]) => {
    setData(parsedData);
    navigateTo('review');
    showToast(`Successfully imported ${parsedData.length} words.`, 'success');
  };

  const handleReviewConfirm = () => {
    navigateTo('quiz_select');
  };

  const handleQuizModeSelect = (mode: QuizMode) => {
    setQuizMode(mode);
    if (mode === 'flashcard') {
      navigateTo('quiz_setup');
    } else if (mode === 'dictation') {
      navigateTo('dictation_setup');
    }
  };

  // Flashcard Logic
  const handleStartFlashcard = (config: QuizConfig) => {
    setQuizConfig(config);
    navigateTo('quiz_session');
  };

  const handleFinishFlashcard = (marked: Set<string>) => {
    setMarkedIds(marked);
    setDictationMistakes([]); // Clear dictation mistakes
    navigateTo('results');
  };

  // Dictation Logic
  const handleStartDictation = (config: DictationConfig) => {
    setDictationConfig(config);
    navigateTo('dictation_session');
  };

  const handleFinishDictation = (mistakes: DictationMistake[]) => {
    // Map mistakes to IDs for common compatibility, but keep details separate
    const ids = new Set(mistakes.map(m => m.wordId));
    setMarkedIds(ids);
    setDictationMistakes(mistakes);
    navigateTo('results');
  };

  const handleRestart = () => {
    if (quizMode === 'flashcard') {
      navigateTo('quiz_setup');
    } else {
      navigateTo('dictation_setup');
    }
  };

  const handleHome = () => {
    setScreen('home');
  };

  const showBack = screen !== 'home';
  const titleMap: Record<string, string> = {
    home: 'CineVocab',
    review: 'Review Data',
    quiz_select: 'Select Quiz',
    quiz_setup: 'Configure Flashcards',
    dictation_setup: 'Configure Dictation',
    quiz_session: 'Flashcards',
    dictation_session: 'Dictation',
    results: 'Results',
    settings: 'Settings'
  };

  return (
    <div className="min-h-screen bg-md-surface text-md-on-surface font-sans selection:bg-md-primary-container selection:text-md-on-primary-container overflow-x-hidden">
      
      <TopBar 
        title={titleMap[screen]} 
        showBack={showBack} 
        onBack={handleBack}
        onSettings={() => navigateTo('settings')}
      />

      <div className="container mx-auto">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <ImportScreen key="home" onDataLoaded={handleDataLoaded} showToast={showToast} />
          )}

          {screen === 'review' && (
            <ReviewScreen key="review" data={data} onConfirm={handleReviewConfirm} />
          )}

          {screen === 'quiz_select' && (
            <QuizSelectionScreen key="select" onSelect={handleQuizModeSelect} />
          )}

          {screen === 'quiz_setup' && (
            <QuizSetup 
              key="setup" 
              totalWords={data.length} 
              onStart={handleStartFlashcard} 
            />
          )}

          {screen === 'dictation_setup' && (
             <DictationSetup
                key="dictation_setup"
                totalWords={data.length}
                onStart={handleStartDictation}
             />
          )}

          {screen === 'quiz_session' && quizConfig && (
            <QuizSession
              key="session"
              entries={data}
              config={quizConfig}
              onFinish={handleFinishFlashcard}
              onExit={handleRestart}
            />
          )}

          {screen === 'dictation_session' && dictationConfig && (
            <DictationSession
              key="dictation_session"
              entries={data}
              config={dictationConfig}
              onFinish={handleFinishDictation}
              onExit={handleRestart}
            />
          )}

          {screen === 'results' && (
            <ResultsScreen
              key="results"
              allEntries={data}
              markedIds={markedIds}
              dictationMistakes={dictationMistakes}
              onRestart={handleRestart}
              onHome={handleHome}
              showToast={showToast}
            />
          )}

          {screen === 'settings' && (
            <SettingsScreen key="settings" />
          )}
        </AnimatePresence>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
