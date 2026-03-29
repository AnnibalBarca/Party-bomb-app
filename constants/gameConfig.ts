export const GAME_CONFIG = {
  /** Starting number of lives per game */
  INITIAL_LIVES: 3,

  /** Starting timer duration in milliseconds */
  INITIAL_TIMER_MS: 10_000,

  /** Minimum timer duration (ms) — never goes below this */
  MIN_TIMER_MS: 3_000,

  /** How much to subtract from timer per successful word (ms) */
  TIMER_DECREMENT_MS: 250,

  /** How often to accelerate timer (every N successful words) */
  SPEED_UP_EVERY_N_WORDS: 5,

  /** Score per correct word (base) */
  BASE_SCORE_PER_WORD: 100,

  /** Bonus multiplier for fast answers (< 3s remaining) */
  FAST_ANSWER_BONUS: 1.5,

  /** Minimum word length to be accepted */
  MIN_WORD_LENGTH: 3,

  /** SQLite database name */
  DB_NAME: 'bombparty.db',

  /**
   * Default max syllable coverage (nb de mots max qui contiennent la syllabe).
   * 1000 = syllabes moyennement communes.
   * Plus petit = plus rare/difficile. Plus grand = plus facile.
   */
  DEFAULT_MAX_SYLLABLE_COVERAGE: 1000,

  /** AsyncStorage key for persisting the maxWords setting */
  STORAGE_KEY_MAX_WORDS: '@bombparty:maxWords',
} as const;
