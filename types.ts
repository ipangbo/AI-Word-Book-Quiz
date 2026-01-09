
export interface RawSentenceBlock {
  timestamp: string;
  sentence: string;
  translation: string;
  rawWordsBlock: string;
}

export interface WordEntry {
  id: string; // Unique ID for React keys
  timestamp: string; // e.g. 0:09:57
  sentence: string;
  translation: string;
  
  // Word specific data
  word: string;
  pos: string; // Part of speech
  definition: string;
  phonetic?: string;
}

export type QuizMode = 'flashcard' | 'dictation' | 'cloze' | 'multiple_choice';

export interface QuizConfig {
  itemCount: number;
  isRandom: boolean;
}

export interface DictationConfig extends QuizConfig {
  showPhonetic: boolean;
  showPos: boolean;
  showDefinition: boolean;
  showTranslation: boolean; // Sentence translation
  showSentence: boolean; // Masked sentence
}

export interface ClozeConfig extends QuizConfig {
  showPhonetic: boolean;
  showPos: boolean;
  showDefinition: boolean;
  showTranslation: boolean;
}

export interface MultipleChoiceConfig extends QuizConfig {
  optionCount: number; // e.g. 4
  showPhonetic: boolean;
  showPos: boolean;
  showDefinition: boolean;
  showTranslation: boolean;
}

export type DictationMistake = {
  wordId: string;
  userInput: string;
  isSkipped: boolean;
  usedHint?: boolean; // For Cloze mode: true if sentence audio was played
};

export interface DictationGlobalSettings {
  defaultShowPhonetic: boolean;
  defaultShowPos: boolean;
  defaultShowDefinition: boolean;
  defaultShowTranslation: boolean;
  defaultShowSentence: boolean;
  correctDelay: number; // ms
  incorrectDelay: number; // ms
}

export interface ClozeGlobalSettings {
  defaultShowPhonetic: boolean;
  defaultShowPos: boolean;
  defaultShowDefinition: boolean;
  defaultShowTranslation: boolean;
}

export interface MultipleChoiceGlobalSettings {
  defaultOptionCount: number;
  defaultShowPhonetic: boolean;
  defaultShowPos: boolean;
  defaultShowDefinition: boolean;
  defaultShowTranslation: boolean;
}
