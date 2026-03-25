/**
 * Syllables curated from jklmbombpartystuff + filtered for French compatibility.
 * Sourced from: https://github.com/RealCyGuy/jklmbombpartystuff
 *
 * Organized in 3 tiers of difficulty based on frequency in French words.
 */

export const EASY_SYLLABLES: string[] = [
  // Very common in French words
  'er', 'en', 'an', 'on', 'in', 'ar', 'or', 'ir', 'es', 'al',
  'ai', 'au', 'eu', 'ou', 'le', 'la', 'de', 'me', 'ne', 'se',
  'te', 've', 're', 'ur', 'ul', 'il', 'el', 'ol', 'oi', 'ie',
  'nt', 'st', 'tr', 'pr', 'bl', 'br', 'cl', 'cr', 'pl', 'fl',
];

export const MEDIUM_SYLLABLES: string[] = [
  // Common 2-3 letter combos in French
  'ion', 'ant', 'ent', 'ing', 'ons', 'tion', 'aire', 'eur', 'eur',
  'ier', 'ire', 'ite', 'age', 'ace', 'ance', 'ence', 'eau', 'oir',
  'and', 'ard', 'art', 'ore', 'ard', 'all', 'ell', 'ill', 'ull',
  'ter', 'ner', 'ser', 'ver', 'per', 'mer', 'ler', 'ger', 'der',
  'tat', 'nat', 'rat', 'mat', 'pat', 'bat', 'cat', 'dat', 'fat',
  'men', 'ven', 'ten', 'den', 'pen', 'ben', 'ken', 'len', 'ren',
  'our', 'sur', 'pur', 'dur', 'cur', 'mur', 'tur', 'lur', 'nur',
  'pre', 'pro', 'tra', 'dis', 'con', 'com', 'par', 'per', 'mar',
];

export const HARD_SYLLABLES: string[] = [
  // Less common, challenging combinations
  'ght', 'str', 'spr', 'scr', 'thr', 'sch', 'chr',
  'xir', 'xer', 'eux', 'aux', 'oux', 'eaux',
  'mph', 'nch', 'nge', 'nce', 'nse', 'nde',
  'cci', 'tti', 'rri', 'ssi', 'mmi', 'nni',
  'qui', 'que', 'gue', 'gui', 'gua',
  'phi', 'pho', 'phy', 'thi', 'the',
  'cri', 'gri', 'pri', 'bri', 'dri', 'fri',
  'ique', 'tion', 'sion', 'ment', 'ness',
];

export const ALL_SYLLABLES: string[] = [
  ...EASY_SYLLABLES,
  ...MEDIUM_SYLLABLES,
  ...HARD_SYLLABLES,
];

/** Returns a random syllable weighted by difficulty tier */
export function getRandomSyllable(difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'): string {
  let pool: string[];

  switch (difficulty) {
    case 'easy':
      pool = EASY_SYLLABLES;
      break;
    case 'medium':
      pool = MEDIUM_SYLLABLES;
      break;
    case 'hard':
      pool = HARD_SYLLABLES;
      break;
    case 'mixed':
    default: {
      // Weighted: 40% easy, 45% medium, 15% hard
      const roll = Math.random();
      if (roll < 0.40) pool = EASY_SYLLABLES;
      else if (roll < 0.85) pool = MEDIUM_SYLLABLES;
      else pool = HARD_SYLLABLES;
    }
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/** Get a syllable different from the last one used */
export function getNextSyllable(lastSyllable: string | null, difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'): string {
  let syllable = getRandomSyllable(difficulty);
  let attempts = 0;
  while (syllable === lastSyllable && attempts < 10) {
    syllable = getRandomSyllable(difficulty);
    attempts++;
  }
  return syllable;
}
