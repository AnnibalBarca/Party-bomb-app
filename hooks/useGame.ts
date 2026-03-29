import { useReducer, useCallback, useRef, useEffect } from 'react';
import { GameState, GameAction } from '../lib/types';
import { GAME_CONFIG } from '../constants/gameConfig';
import { getNextSyllable } from '../constants/syllableData';
import { validateWord } from '../lib/database';

// ─── Initial State ────────────────────────────────────────────────────────────

const firstSyllable = getNextSyllable(null);

const INITIAL_STATE: GameState = {
  status: 'idle',
  currentSyllable: firstSyllable,
  timerMs: GAME_CONFIG.INITIAL_TIMER_MS,
  maxTimerMs: GAME_CONFIG.INITIAL_TIMER_MS,
  lives: GAME_CONFIG.INITIAL_LIVES,
  score: 0,
  wordsUsed: new Set(),
  wordCount: 0,
  feedbackType: null,
  feedbackMessage: '',
  lastWord: '',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START': {
      const syllable = getNextSyllable(null);
      return {
        ...INITIAL_STATE,
        status: 'playing',
        currentSyllable: syllable,
        wordsUsed: new Set(),
      };
    }

    case 'TICK': {
      if (state.status !== 'playing') return state;
      const elapsed = action.payload?.elapsed ?? 100;
      const newTimer = Math.max(0, state.timerMs - elapsed);
      return { ...state, timerMs: newTimer };
    }

    case 'TIMEOUT': {
      if (state.status !== 'playing') return state;
      const newLives = state.lives - 1;
      const nextSyllable = getNextSyllable(state.currentSyllable);

      if (newLives <= 0) {
        return {
          ...state,
          status: 'lost',
          lives: 0,
          feedbackType: 'timeout',
          feedbackMessage: 'Temps écoulé ! 💥',
        };
      }

      return {
        ...state,
        lives: newLives,
        currentSyllable: nextSyllable,
        timerMs: state.maxTimerMs,
        feedbackType: 'timeout',
        feedbackMessage: `Temps écoulé ! -1 ❤️`,
        lastWord: '',
      };
    }

    case 'SUBMIT_WORD': {
      if (state.status !== 'playing') return state;

      const { correct, reason, word = '', syllable, score = 0 } = action.payload ?? {};

      if (!correct) {
        const newLives = state.lives - 1;
        if (newLives <= 0) {
          return {
            ...state,
            status: 'lost',
            lives: 0,
            feedbackType: 'wrong',
            feedbackMessage: reason ?? 'Mot invalide',
            lastWord: word,
          };
        }
        return {
          ...state,
          lives: newLives,
          feedbackType: 'wrong',
          feedbackMessage: reason ?? 'Mot invalide',
          lastWord: word,
        };
      }

      // Correct word
      const newWordsUsed = new Set(state.wordsUsed);
      newWordsUsed.add(word.toLowerCase());

      const newWordCount = state.wordCount + 1;
      const newScore = state.score + score;

      // Speed up timer every N words
      let newMaxTimer = state.maxTimerMs;
      if (newWordCount % GAME_CONFIG.SPEED_UP_EVERY_N_WORDS === 0) {
        newMaxTimer = Math.max(
          GAME_CONFIG.MIN_TIMER_MS,
          state.maxTimerMs - GAME_CONFIG.TIMER_DECREMENT_MS * GAME_CONFIG.SPEED_UP_EVERY_N_WORDS
        );
      }

      const nextSyllable = syllable ?? getNextSyllable(state.currentSyllable);

      return {
        ...state,
        currentSyllable: nextSyllable,
        timerMs: newMaxTimer,
        maxTimerMs: newMaxTimer,
        score: newScore,
        wordsUsed: newWordsUsed,
        wordCount: newWordCount,
        feedbackType: 'correct',
        feedbackMessage: `✓ ${word}`,
        lastWord: word,
      };
    }

    case 'PAUSE':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;

    case 'RESUME':
      return state.status === 'paused' ? { ...state, status: 'playing' } : state;

    case 'RESET':
      return { ...INITIAL_STATE, currentSyllable: getNextSyllable(null) };

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(maxWords: number = GAME_CONFIG.DEFAULT_MAX_SYLLABLE_COVERAGE) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TICK_MS = 100;

  // ── Timer management ──
  useEffect(() => {
    if (state.status === 'playing') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK', payload: { elapsed: TICK_MS } });
      }, TICK_MS);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status]);

  // ── Timeout detection ──
  useEffect(() => {
    if (state.status === 'playing' && state.timerMs <= 0) {
      dispatch({ type: 'TIMEOUT' });
    }
  }, [state.timerMs, state.status]);

  // ── Actions ──
  const startGame = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const submitWord = useCallback(
    async (word: string) => {
      if (state.status !== 'playing') return;

      const trimmed = word.trim().toLowerCase();

      // Check if already used
      if (state.wordsUsed.has(trimmed)) {
        dispatch({
          type: 'SUBMIT_WORD',
          payload: {
            word: trimmed,
            correct: false,
            reason: `"${trimmed}" déjà utilisé !`,
          },
        });
        return;
      }

      // Validate via SQLite
      const { valid, reason } = await validateWord(trimmed, state.currentSyllable);

      if (!valid) {
        dispatch({
          type: 'SUBMIT_WORD',
          payload: { word: trimmed, correct: false, reason },
        });
        return;
      }

      // Calculate score: base + time bonus
      const timeRatio = state.timerMs / state.maxTimerMs;
      const timeBonus = timeRatio > 0.5 ? GAME_CONFIG.FAST_ANSWER_BONUS : 1.0;
      const wordScore = Math.round(
        GAME_CONFIG.BASE_SCORE_PER_WORD * timeBonus * (trimmed.length / 5)
      );

      const nextSyllable = getNextSyllable(state.currentSyllable, maxWords);
      dispatch({
        type: 'SUBMIT_WORD',
        payload: {
          word: trimmed,
          correct: true,
          syllable: nextSyllable,
          score: wordScore,
        },
      });
    },
    [state]
  );

  const pauseGame = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resumeGame = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), []);

  // Progress 0–1
  const timerProgress = state.timerMs / state.maxTimerMs;

  return {
    state,
    timerProgress,
    startGame,
    submitWord,
    pauseGame,
    resumeGame,
    resetGame,
  };
}
