/**
 * Web stub for expo-sqlite — the real SQLite runs only on iOS/Android.
 * On web, we use a simple in-memory Set for word validation.
 */
import { SAMPLE_FRENCH_WORDS } from './sampleWords';
import { GAME_CONFIG } from '../constants/gameConfig';

const memoryDict = new Set<string>(SAMPLE_FRENCH_WORDS.map(w => w.toLowerCase()));
let _ready = false;

export async function getDatabase(): Promise<null> {
  return null;
}

export async function validateWord(
  word: string,
  syllable: string
): Promise<{ valid: boolean; reason?: string }> {
  const normalized = word.trim().toLowerCase();

  if (normalized.length < GAME_CONFIG.MIN_WORD_LENGTH) {
    return { valid: false, reason: `Mot trop court (min. ${GAME_CONFIG.MIN_WORD_LENGTH} lettres)` };
  }

  if (!normalized.includes(syllable.toLowerCase())) {
    return { valid: false, reason: `Le mot ne contient pas "${syllable.toUpperCase()}"` };
  }

  if (!memoryDict.has(normalized)) {
    return { valid: false, reason: `"${word}" n'est pas dans le dictionnaire` };
  }

  return { valid: true };
}

export async function importWords(words: string[]): Promise<number> {
  words.forEach(w => memoryDict.add(w.trim().toLowerCase()));
  _ready = true;
  return memoryDict.size;
}

export async function isDictionaryReady(): Promise<boolean> {
  return memoryDict.size > 0;
}

export async function getDictionarySize(): Promise<number> {
  return memoryDict.size;
}
