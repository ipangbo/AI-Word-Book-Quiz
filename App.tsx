
import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImportScreen } from './components/ImportScreen';
import { QuizSetup } from './components/QuizSetup';
import { QuizSession } from './components/QuizSession';
import { DictationSetup } from './components/DictationSetup';
import { DictationSession } from './components/DictationSession';
import { ClozeSetup } from './components/ClozeSetup';
import { ClozeSession } from './components/ClozeSession';
import { MultipleChoiceSetup } from './components/MultipleChoiceSetup';
import { MultipleChoiceSession } from './components/MultipleChoiceSession';
import { ResultsScreen } from './components/ResultsScreen';
import { TopBar } from './components/TopBar';
import { ReviewScreen } from './components/ReviewScreen';
import { QuizSelectionScreen } from './components/QuizSelectionScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { HelpModal } from './components/HelpModal';
import { EcosystemModal } from './components/EcosystemModal';
import { ToastContainer, ToastType, ToastMessage } from './components/common/Toast';
import { WordEntry, QuizConfig, DictationConfig, ClozeConfig, MultipleChoiceConfig, QuizMode, DictationMistake } from './types';
import { applyTheme, ThemeName, ThemeMode, applyFontSize, FontSizeLevel, FONT_SIZE_KEY } from './utils/theme';

type ScreenName = 'home' | 'review' | 'quiz_select' | 'quiz_setup' | 'quiz_session' | 'dictation_setup' | 'dictation_session' | 'cloze_setup' | 'cloze_session' | 'mc_setup' | 'mc_session' | 'results';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [previousScreen, setPreviousScreen] = useState<ScreenName>('home');
  
  const [data, setData] = useState<WordEntry[]>([]);
  
  const [quizMode, setQuizMode] = useState<QuizMode>('flashcard');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [dictationConfig, setDictationConfig] = useState<DictationConfig | null>(null);
  const [clozeConfig, setClozeConfig] = useState<ClozeConfig | null>(null);
  const [mcConfig, setMcConfig] = useState<MultipleChoiceConfig | null>(null);
  
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const [quizResults, setQuizResults] = useState<DictationMistake[]>([]);
  const [sessionEntries, setSessionEntries] = useState<WordEntry[]>([]);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // useLayoutEffect runs synchronously immediately after DOM updates but before paint.
  // This is critical for applying the theme without a visual flash of the default colors.
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('cinevocab_theme_name') as ThemeName || 'violet';
    const savedMode = localStorage.getItem('cinevocab_theme_mode') as ThemeMode || 'system';
    const savedColor = localStorage.getItem('cinevocab_custom_color') || undefined;
    
    // Apply theme logic
    applyTheme(savedTheme, savedMode, savedColor);

    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSizeLevel || 'medium';
    applyFontSize(savedFontSize);
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) {
        window.scrollTo(0, 0);
    }
  }, [screen, isSettingsOpen]);

  // FIX: Lock body scroll when settings is open to prevent double scrollbars
  useEffect(() => {
    if (isSettingsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSettingsOpen]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 11) + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const navigateTo = (target: ScreenName) => {
    setScreen(target);
  };

  const handleBack = () => {
    if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
    }

    switch (screen) {
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
      case 'cloze_setup':
        setScreen('quiz_select');
        break;
      case 'mc_setup':
        setScreen('quiz_select');
        break;
      case 'quiz_session':
        setScreen('quiz_setup');
        break;
      case 'dictation_session':
        setScreen('dictation_setup');
        break;
      case 'cloze_session':
        setScreen('cloze_setup');
        break;
      case 'mc_session':
        setScreen('mc_setup');
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
    } else if (mode === 'cloze') {
      navigateTo('cloze_setup');
    } else if (mode === 'multiple_choice') {
      navigateTo('mc_setup');
    }
  };

  const handleStartFlashcard = (config: QuizConfig) => {
    setQuizConfig(config);
    navigateTo('quiz_session');
  };

  const handleFinishFlashcard = (marked: Set<string>, entries: WordEntry[]) => {
    setMarkedIds(marked);
    setSessionEntries(entries);
    setQuizResults([]);
    navigateTo('results');
  };

  const handleStartDictation = (config: DictationConfig) => {
    setDictationConfig(config);
    navigateTo('dictation_session');
  };

  const handleStartCloze = (config: ClozeConfig) => {
      setClozeConfig(config);
      navigateTo('cloze_session');
  };

  const handleStartMC = (config: MultipleChoiceConfig) => {
      setMcConfig(config);
      navigateTo('mc_session');
  };

  const handleFinishQuiz = (mistakes: DictationMistake[], entries: WordEntry[]) => {
    const ids = new Set(mistakes.map(m => m.wordId));
    setMarkedIds(ids);
    setSessionEntries(entries);
    setQuizResults(mistakes);
    navigateTo('results');
  };

  const handleRestart = () => {
    if (quizMode === 'flashcard') {
      navigateTo('quiz_setup');
    } else if (quizMode === 'dictation') {
      navigateTo('dictation_setup');
    } else if (quizMode === 'cloze') {
      navigateTo('cloze_setup');
    } else if (quizMode === 'multiple_choice') {
      navigateTo('mc_setup');
    }
  };

  const handleHome = () => {
    setScreen('home');
  };

  const showBack = isSettingsOpen || screen !== 'home';
  const showHelp = screen === 'home' && !isSettingsOpen;
  const showSettings = !isSettingsOpen;
  
  const titleMap: Record<string, string> = {
    home: 'CineVocab',
    review: 'Review Data',
    quiz_select: 'Select Quiz',
    quiz_setup: 'Configure Flashcards',
    dictation_setup: 'Configure Dictation',
    cloze_setup: 'Configure Cloze Test',
    mc_setup: 'Configure Multiple Choice',
    quiz_session: 'Flashcards',
    dictation_session: 'Dictation',
    cloze_session: 'Cloze Test',
    mc_session: 'Multiple Choice',
    results: 'Results',
  };

  return (
    <div className="min-h-screen bg-md-surface text-md-on-surface font-sans selection:bg-md-primary-container selection:text-md-on-primary-container overflow-x-hidden transition-colors duration-300 pt-20">
      
      <TopBar 
        title={isSettingsOpen ? 'Settings' : titleMap[screen]} 
        showBack={showBack} 
        onBack={handleBack}
        onSettings={() => setIsSettingsOpen(true)}
        onHelp={() => setIsHelpOpen(true)}
        onEcosystem={() => setIsEcosystemOpen(true)}
        showHelp={showHelp}
        showSettings={showSettings}
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

          {screen === 'cloze_setup' && (
              <ClozeSetup
                key="cloze_setup"
                totalWords={data.length}
                onStart={handleStartCloze}
              />
          )}

          {screen === 'mc_setup' && (
              <MultipleChoiceSetup
                key="mc_setup"
                totalWords={data.length}
                onStart={handleStartMC}
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
              onFinish={handleFinishQuiz}
              onExit={handleRestart}
            />
          )}

          {screen === 'cloze_session' && clozeConfig && (
              <ClozeSession
                key="cloze_session"
                entries={data}
                config={clozeConfig}
                onFinish={handleFinishQuiz}
                onExit={handleRestart}
              />
          )}

          {screen === 'mc_session' && mcConfig && (
              <MultipleChoiceSession
                key="mc_session"
                entries={data}
                config={mcConfig}
                onFinish={handleFinishQuiz}
                onExit={handleRestart}
              />
          )}

          {screen === 'results' && (
            <ResultsScreen
              key="results"
              sessionEntries={sessionEntries}
              markedIds={markedIds}
              dictationMistakes={quizResults}
              onRestart={handleRestart}
              onHome={handleHome}
              showToast={showToast}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
            <motion.div 
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-0 z-40 bg-md-surface pt-20 overflow-y-auto"
                style={{ willChange: 'transform' }}
            >
                <div className="container mx-auto">
                     <SettingsScreen 
                        onQuickImport={(d) => {
                            handleDataLoaded(d);
                            setIsSettingsOpen(false);
                        }}
                        showToast={showToast}
                     />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <EcosystemModal isOpen={isEcosystemOpen} onClose={() => setIsEcosystemOpen(false)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
