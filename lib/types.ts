export type GameStatus = 'idle' | 'playing' | 'paused' | 'lost' | 'won';

export type FeedbackType = 'correct' | 'wrong' | 'timeout' | null;

export interface GameState {
  status: GameStatus;
  currentSyllable: string;
  timerMs: number;
  maxTimerMs: number;
  lives: number;
  score: number;
  wordsUsed: Set<string>;
  wordCount: number;
  feedbackType: FeedbackType;
  feedbackMessage: string;
  lastWord: string;
}

export interface GameAction {
  type:
    | 'START'
    | 'SUBMIT_WORD'
    | 'TICK'
    | 'TIMEOUT'
    | 'PAUSE'
    | 'RESUME'
    | 'RESET';
  payload?: {
    word?: string;
    correct?: boolean;
    reason?: string;
    elapsed?: number;
    syllable?: string;
    score?: number;
  };
}

export interface HighScore {
  score: number;
  wordCount: number;
  date: string;
}
