/**
 * Advanced Text-to-Speech utility with Config Management
 */

export interface TTSConfig {
  voiceURI: string | null;
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
}

const STORAGE_KEY = 'cinevocab_tts_config';

const DEFAULT_CONFIG: TTSConfig = {
  voiceURI: null,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

// --- Helper: Get Configuration ---
export const getTTSConfig = (): TTSConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse TTS config', e);
    }
  }
  return DEFAULT_CONFIG;
};

// --- Helper: Save Configuration ---
export const saveTTSConfig = (config: TTSConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// --- Helper: Get Available English Voices ---
export const getEnglishVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  
  const voices = window.speechSynthesis.getVoices();
  // Filter for English voices, prioritize US, then GB, then others
  return voices
    .filter(v => v.lang.startsWith('en'))
    .sort((a, b) => {
       // Heuristic sorting: LocalService often sounds better/faster, Google/Microsoft often sound more natural
       const aScore = (a.localService ? 2 : 0) + (a.name.includes('Google') || a.name.includes('Microsoft') ? 1 : 0);
       const bScore = (b.localService ? 2 : 0) + (b.name.includes('Google') || b.name.includes('Microsoft') ? 1 : 0);
       return bScore - aScore;
    });
};

// Pre-load voices to handle Safari/Chrome async loading
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
}

// --- Main Speak Function ---
export const speak = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const config = getTTSConfig();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const voices = window.speechSynthesis.getVoices();
  
  // 1. Try to find the specific saved voice
  let selectedVoice = voices.find(v => v.voiceURI === config.voiceURI);

  // 2. If saved voice not found (or not set), try to find a good default English voice
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang === 'en-US' && !v.name.includes('Archive')) || 
                    voices.find(v => v.lang.startsWith('en'));
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  utterance.volume = config.volume;

  window.speechSynthesis.speak(utterance);
};
