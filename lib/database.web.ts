/**
 * Web implementation — uses in-memory Set loaded from the bundled french-words.txt.
 * Replaces expo-sqlite (not available on web).
 */
import { Asset } from 'expo-asset';
import { GAME_CONFIG } from '../constants/gameConfig';

let memoryDict: Set<string> | null = null;
let loadPromise: Promise<Set<string>> | null = null;

async function getDictionary(): Promise<Set<string>> {
  if (memoryDict) return memoryDict;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const [asset] = await Asset.loadAsync(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../assets/french-words.txt')
    );
    // On web, asset.uri is a bundled URL — fetch it as text
    const response = await fetch(asset.uri);
    const text = await response.text();

    const dict = new Set<string>();
    text
      .split('\n')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length >= 2 && /^[a-záàâäéèêëîïôùûüçœæ'-]+$/i.test(w))
      .forEach(w => dict.add(w));

    memoryDict = dict;
    return dict;
  })();

  return loadPromise;
}

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

  const dict = await getDictionary();
  if (!dict.has(normalized)) {
    return { valid: false, reason: `"${word}" n'est pas dans le dictionnaire` };
  }

  return { valid: true };
}

export async function importWords(words: string[]): Promise<number> {
  const dict = await getDictionary();
  words.forEach(w => dict.add(w.trim().toLowerCase()));
  return dict.size;
}

export async function isDictionaryReady(): Promise<boolean> {
  // Trigger load in background, report ready only when done
  const dict = await getDictionary();
  return dict.size > 0;
}

export async function getDictionarySize(): Promise<number> {
  const dict = await getDictionary();
  return dict.size;
}

export async function autoImportBundledDictionary(
  onProgress?: (pct: number) => void
): Promise<number> {
  onProgress?.(50);
  const dict = await getDictionary();
  onProgress?.(100);
  return dict.size;
}
