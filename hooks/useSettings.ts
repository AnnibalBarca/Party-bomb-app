import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAME_CONFIG } from '../constants/gameConfig';
import { MAX_SYLLABLE_COVERAGE } from '../constants/syllableData';

export interface Settings {
  maxWords: number;
  initialTimerSec: number;
}

const DEFAULT_SETTINGS: Settings = {
  maxWords: GAME_CONFIG.DEFAULT_MAX_SYLLABLE_COVERAGE,
  initialTimerSec: GAME_CONFIG.INITIAL_TIMER_MS / 1000,
};

const KEY_MAX_WORDS   = '@bombparty:maxWords';
const KEY_TIMER_SEC   = '@bombparty:timerSec';

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEY_MAX_WORDS),
      AsyncStorage.getItem(KEY_TIMER_SEC),
    ]).then(([mw, ts]) => {
      setSettingsState({
        maxWords:       mw !== null ? parseInt(mw, 10)  : DEFAULT_SETTINGS.maxWords,
        initialTimerSec: ts !== null ? parseInt(ts, 10) : DEFAULT_SETTINGS.initialTimerSec,
      });
      setLoaded(true);
    });
  }, []);

  const setMaxWords = useCallback(async (value: number) => {
    const clamped = Math.max(1, Math.min(MAX_SYLLABLE_COVERAGE, value));
    setSettingsState(s => ({ ...s, maxWords: clamped }));
    await AsyncStorage.setItem(KEY_MAX_WORDS, String(clamped));
  }, []);

  const setInitialTimerSec = useCallback(async (value: number) => {
    const clamped = Math.max(3, Math.min(60, value));
    setSettingsState(s => ({ ...s, initialTimerSec: clamped }));
    await AsyncStorage.setItem(KEY_TIMER_SEC, String(clamped));
  }, []);

  return { settings, setMaxWords, setInitialTimerSec, loaded, MAX_SYLLABLE_COVERAGE };
}
