
import { WordEntry } from '../types';

/**
 * Helper to find balanced brace content starting from a specific position.
 * Returns the content inside the braces and the index after the closing brace.
 */
const extractBalanced = (str: string, startIndex: number, openChar: string, closeChar: string) => {
  let count = 0;
  let i = startIndex;
  let contentStart = -1;
  
  // First, find the opening brace (ignoring whitespace is handled by caller usually, but let's be safe if we start exactly on it)
  // Actually, the caller should position us at or before the opening brace, but to be robust let's skip whitespace until openChar.
  while (i < str.length && /\s/.test(str[i])) i++;

  if (i >= str.length || str[i] !== openChar) return null;
  
  contentStart = i + 1;
  count = 1;
  i++;

  while (i < str.length) {
    if (str[i] === openChar) {
      count++;
    } else if (str[i] === closeChar) {
      count--;
      if (count === 0) {
        return {
          content: str.substring(contentStart, i),
          endIndex: i + 1
        };
      }
    }
    i++;
  }
  return null;
};

const generateId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Parses the raw TeX string into structured WordEntry objects.
 * Flattens the hierarchy: 1 Sentence with 2 Words becomes 2 WordEntries.
 * Uses a stateful parser to handle nested braces correctly.
 */
export const parseInputData = (rawText: string): WordEntry[] => {
  const entries: WordEntry[] = [];
  const blockMarker = "\\SentenceBlock";
  let currentIndex = 0;
  
  // Track unique keys to prevent duplicates
  // Key composition: Timestamp + Sentence + Word + Definition
  const uniqueKeys = new Set<string>();

  while (true) {
    const blockStart = rawText.indexOf(blockMarker, currentIndex);
    if (blockStart === -1) break;

    // Move pointer just after \SentenceBlock
    let ptr = blockStart + blockMarker.length;
    
    // 1. Parse optional Timestamp [ ... ]
    let timestamp = "";
    // Check next non-whitespace char
    let tempPtr = ptr;
    while (tempPtr < rawText.length && /\s/.test(rawText[tempPtr])) tempPtr++;
    
    if (tempPtr < rawText.length && rawText[tempPtr] === '[') {
      const res = extractBalanced(rawText, tempPtr, '[', ']');
      if (res) {
        timestamp = res.content;
        ptr = res.endIndex;
      } else {
        // Malformed bracket, maybe not a timestamp, skip block
        currentIndex = blockStart + 1;
        continue;
      }
    } else {
        // No timestamp found, ensure we continue from after whitespace
        ptr = tempPtr; 
    }

    // 2. Parse Sentence { ... }
    let sentence = "";
    const sentenceRes = extractBalanced(rawText, ptr, '{', '}');
    if (sentenceRes) {
        sentence = sentenceRes.content;
        ptr = sentenceRes.endIndex;
    } else {
        currentIndex = blockStart + 1;
        continue;
    }

    // 3. Parse Translation { ... }
    let translation = "";
    const transRes = extractBalanced(rawText, ptr, '{', '}');
    if (transRes) {
        translation = transRes.content;
        ptr = transRes.endIndex;
    } else {
        currentIndex = blockStart + 1;
        continue;
    }

    // 4. Parse Words Block { ... }
    let rawWordsBlock = "";
    const wordsRes = extractBalanced(rawText, ptr, '{', '}');
    if (wordsRes) {
        rawWordsBlock = wordsRes.content;
        ptr = wordsRes.endIndex;
    } else {
        currentIndex = blockStart + 1;
        continue;
    }
    
    // Now parse words inside rawWordsBlock
    let wIdx = 0;
    while(true) {
        const wordMarker = "\\Word";
        const wStart = rawWordsBlock.indexOf(wordMarker, wIdx);
        if (wStart === -1) break;
        
        let wPtr = wStart + wordMarker.length;
        
        // Word
        let word = "";
        const wRes = extractBalanced(rawWordsBlock, wPtr, '{', '}');
        if (wRes) { word = wRes.content; wPtr = wRes.endIndex; }
        else { wIdx = wStart + 1; continue; }

        // POS
        let pos = "";
        const pRes = extractBalanced(rawWordsBlock, wPtr, '{', '}');
        if (pRes) { pos = pRes.content; wPtr = pRes.endIndex; }
        else { wIdx = wStart + 1; continue; }

        // Def
        let def = "";
        const dRes = extractBalanced(rawWordsBlock, wPtr, '{', '}');
        if (dRes) { def = dRes.content; wPtr = dRes.endIndex; }
        else { wIdx = wStart + 1; continue; }
        
        // Phonetic (Optional)
        let phonetic: string | undefined = undefined;
        // Check for [
        let tempWPtr = wPtr;
        while (tempWPtr < rawWordsBlock.length && /\s/.test(rawWordsBlock[tempWPtr])) tempWPtr++;
        
        if (tempWPtr < rawWordsBlock.length && rawWordsBlock[tempWPtr] === '[') {
             const phRes = extractBalanced(rawWordsBlock, tempWPtr, '[', ']');
             if (phRes) { 
                 phonetic = phRes.content; 
                 wPtr = phRes.endIndex; 
             }
        }

        const trimmedT = timestamp.trim();
        const trimmedS = sentence.trim();
        const trimmedW = word.trim();
        const trimmedD = def.trim();

        // Deduplication Logic:
        // We consider a word entry a duplicate only if:
        // 1. It belongs to the same sentence block (Same Timestamp + Sentence)
        // 2. It is the same word definition (Same Word + Definition)
        const key = JSON.stringify({ t: trimmedT, s: trimmedS, w: trimmedW, d: trimmedD });

        if (!uniqueKeys.has(key)) {
            uniqueKeys.add(key);
            entries.push({
                id: generateId(),
                timestamp: trimmedT,
                sentence: trimmedS,
                translation: translation.trim(),
                word: trimmedW,
                pos: pos.trim(),
                definition: trimmedD,
                phonetic: phonetic ? phonetic.trim() : undefined
            });
        }
        
        wIdx = wPtr;
    }

    currentIndex = ptr;
  }

  return entries;
};

/**
 * Reconstructs the LaTeX format from a list of WordEntries.
 */
export const exportFailedWords = (entries: WordEntry[]): string => {
  // Group by sentence+timestamp to reconstruct blocks
  const groups: Record<string, { entry: WordEntry; words: WordEntry[] }> = {};

  entries.forEach(entry => {
    // specific key to identify unique sentence context
    const key = `${entry.timestamp}|${entry.sentence}`;
    if (!groups[key]) {
      groups[key] = { entry, words: [] };
    }
    groups[key].words.push(entry);
  });

  let output = '';

  Object.values(groups).forEach(group => {
    const { timestamp, sentence, translation } = group.entry;
    
    output += `\\SentenceBlock[${timestamp}]{${sentence}}{${translation}}{\n`;
    
    group.words.forEach(w => {
      const phoneticPart = w.phonetic ? `[${w.phonetic}]` : '';
      output += `    \\Word{${w.word}}{${w.pos}}{${w.definition}}${phoneticPart}\n`;
    });
    
    output += `}\n\n`;
  });

  return output;
};
