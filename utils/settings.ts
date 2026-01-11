
import { DictationGlobalSettings, ClozeGlobalSettings, MultipleChoiceGlobalSettings, GeneralSettings } from '../types';

const GENERAL_SETTINGS_KEY = 'cinevocab_general_settings';
const DICTATION_SETTINGS_KEY = 'cinevocab_dictation_settings';
const CLOZE_SETTINGS_KEY = 'cinevocab_cloze_settings';
const MC_SETTINGS_KEY = 'cinevocab_mc_settings';

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  historyLimit: 10,
};

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

export const DEFAULT_MC_SETTINGS: MultipleChoiceGlobalSettings = {
  defaultOptionCount: 4,
  defaultShowPhonetic: false,
  defaultShowPos: true,
  defaultShowDefinition: true,
  defaultShowTranslation: false,
};

export const getGeneralSettings = (): GeneralSettings => {
  if (typeof window === 'undefined') return DEFAULT_GENERAL_SETTINGS;
  const saved = localStorage.getItem(GENERAL_SETTINGS_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_GENERAL_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse general settings', e);
    }
  }
  return DEFAULT_GENERAL_SETTINGS;
};

export const saveGeneralSettings = (settings: GeneralSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GENERAL_SETTINGS_KEY, JSON.stringify(settings));
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

export const getMCSettings = (): MultipleChoiceGlobalSettings => {
  if (typeof window === 'undefined') return DEFAULT_MC_SETTINGS;
  const saved = localStorage.getItem(MC_SETTINGS_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_MC_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse MC settings', e);
    }
  }
  return DEFAULT_MC_SETTINGS;
};

export const saveMCSettings = (settings: MultipleChoiceGlobalSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MC_SETTINGS_KEY, JSON.stringify(settings));
};
