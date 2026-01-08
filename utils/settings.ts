
import { DictationGlobalSettings, ClozeGlobalSettings } from '../types';

const DICTATION_SETTINGS_KEY = 'cinevocab_dictation_settings';
const CLOZE_SETTINGS_KEY = 'cinevocab_cloze_settings';

export const DEFAULT_DICTATION_SETTINGS: DictationGlobalSettings = {
  defaultShowPhonetic: true,
  defaultShowPos: true,
  defaultShowDefinition: true,
  defaultShowTranslation: false,
  defaultShowSentence: false,
  correctDelay: 1500,
  incorrectDelay: 3000,
};

export const DEFAULT_CLOZE_SETTINGS: ClozeGlobalSettings = {
  defaultShowPhonetic: false,
  defaultShowPos: true,
  defaultShowDefinition: true,
  defaultShowTranslation: true,
};

export const getDictationSettings = (): DictationGlobalSettings => {
  if (typeof window === 'undefined') return DEFAULT_DICTATION_SETTINGS;
  const saved = localStorage.getItem(DICTATION_SETTINGS_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_DICTATION_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse dictation settings', e);
    }
  }
  return DEFAULT_DICTATION_SETTINGS;
};

export const saveDictationSettings = (settings: DictationGlobalSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DICTATION_SETTINGS_KEY, JSON.stringify(settings));
};

export const getClozeSettings = (): ClozeGlobalSettings => {
  if (typeof window === 'undefined') return DEFAULT_CLOZE_SETTINGS;
  const saved = localStorage.getItem(CLOZE_SETTINGS_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_CLOZE_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse cloze settings', e);
    }
  }
  return DEFAULT_CLOZE_SETTINGS;
};

export const saveClozeSettings = (settings: ClozeGlobalSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLOZE_SETTINGS_KEY, JSON.stringify(settings));
};
