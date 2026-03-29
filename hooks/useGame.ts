import { useReducer, useCallback, useRef, useEffect } from 'react';
import { GameState, GameAction } from '../lib/types';
import { GAME_CONFIG } from '../constants/gameConfig';
import { getNextSyllable } from '../constants/syllableData';
import { validateWord } from '../lib/database';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInitialState(timerMs: number): GameState {
  return {
    status: 'idle',
    currentSyllable: getNextSyllable(null),
    timerMs,
    maxTimerMs: timerMs,
    lives: GAME_CONFIG.INITIAL_LIVES,
    score: 0,
    wordsUsed: new Set(),
    wordCount: 0,
    feedbackType: null,
    feedbackMessage: '',
    lastWord: '',
    lastFailedSyllable: null,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START': {
      const timerMs = action.payload?.initialTimerMs ?? GAME_CONFIG.INITIAL_TIMER_MS;
      return {
        ...makeInitialState(timerMs),
        status: 'playing',
        currentSyllable: getNextSyllable(null),
        wordsUsed: new Set(),
      };
    }

    case 'TICK': {
      if (state.status !== 'playing') return state;
      const elapsed = action.payload?.elapsed ?? 100;
      return { ...state, timerMs: Math.max(0, state.timerMs - elapsed) };
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
          lastFailedSyllable: state.currentSyllable,
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
        lastFailedSyllable: state.currentSyllable,
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
            lastFailedSyllable: state.currentSyllable,
          };
        }
        return {
          ...state,
          lives: newLives,
          feedbackType: 'wrong',
          feedbackMessage: reason ?? 'Mot invalide',
          lastWord: word,
          lastFailedSyllable: state.currentSyllable,
        };
      }

      // Correct word
      const newWordsUsed = new Set(state.wordsUsed);
      newWordsUsed.add(word.toLowerCase());
      const newWordCount = state.wordCount + 1;
      const newScore = state.score + score;

      let newMaxTimer = state.maxTimerMs;
      if (newWordCount % GAME_CONFIG.SPEED_UP_EVERY_N_WORDS === 0) {
        newMaxTimer = Math.max(
          GAME_CONFIG.MIN_TIMER_MS,
          state.maxTimerMs - GAME_CONFIG.TIMER_DECREMENT_MS * GAME_CONFIG.SPEED_UP_EVERY_N_WORDS
        );
      }

      return {
        ...state,
        currentSyllable: syllable ?? getNextSyllable(state.currentSyllable),
        timerMs: newMaxTimer,
        maxTimerMs: newMaxTimer,
        score: newScore,
        wordsUsed: newWordsUsed,
        wordCount: newWordCount,
        feedbackType: 'correct',
        feedbackMessage: `✓ ${word}`,
        lastWord: word,
        lastFailedSyllable: null,
      };
    }

    case 'PAUSE':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;

    case 'RESUME':
      return state.status === 'paused' ? { ...state, status: 'playing' } : state;

    case 'RESET':
      return makeInitialState(action.payload?.initialTimerMs ?? GAME_CONFIG.INITIAL_TIMER_MS);

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(
  maxWords: number = GAME_CONFIG.DEFAULT_MAX_SYLLABLE_COVERAGE,
  initialTimerMs: number = GAME_CONFIG.INITIAL_TIMER_MS,
) {
  const [state, dispatch] = useReducer(gameReducer, makeInitialState(initialTimerMs));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TICK_MS = 100;

  // ── Timer ──
  useEffect(() => {
    if (state.status === 'playing') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK', payload: { elapsed: TICK_MS } });
      }, TICK_MS);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.status]);

  // ── Timeout detection ──
  useEffect(() => {
    if (state.status === 'playing' && state.timerMs <= 0) {
      dispatch({ type: 'TIMEOUT' });
    }
  }, [state.timerMs, state.status]);

  // ── Actions ──
  const startGame = useCallback(() => {
    dispatch({ type: 'START', payload: { initialTimerMs } });
  }, [initialTimerMs]);

  const submitWord = useCallback(async (word: string) => {
    if (state.status !== 'playing') return;
    const trimmed = word.trim().toLowerCase();

    if (state.wordsUsed.has(trimmed)) {
      dispatch({ type: 'SUBMIT_WORD', payload: { word: trimmed, correct: false, reason: `"${trimmed}" déjà utilisé !` } });
      return;
    }

    const { valid, reason } = await validateWord(trimmed, state.currentSyllable);
    if (!valid) {
      dispatch({ type: 'SUBMIT_WORD', payload: { word: trimmed, correct: false, reason } });
      return;
    }

    const timeRatio = state.timerMs / state.maxTimerMs;
    const timeBonus = timeRatio > 0.5 ? GAME_CONFIG.FAST_ANSWER_BONUS : 1.0;
    const wordScore = Math.round(GAME_CONFIG.BASE_SCORE_PER_WORD * timeBonus * (trimmed.length / 5));
    const nextSyllable = getNextSyllable(state.currentSyllable, maxWords);

    dispatch({ type: 'SUBMIT_WORD', payload: { word: trimmed, correct: true, syllable: nextSyllable, score: wordScore } });
  }, [state, maxWords]);

  const pauseGame  = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resumeGame = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const resetGame  = useCallback(() => dispatch({ type: 'RESET', payload: { initialTimerMs } }), [initialTimerMs]);

  return {
    state,
    timerProgress: state.timerMs / state.maxTimerMs,
    startGame,
    submitWord,
    pauseGame,
    resumeGame,
    resetGame,
  };
}
