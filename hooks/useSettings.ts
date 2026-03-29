import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAME_CONFIG } from '../constants/gameConfig';
import { MAX_SYLLABLE_COVERAGE } from '../constants/syllableData';

export interface Settings {
  maxWords: number;
}

const DEFAULT_SETTINGS: Settings = {
  maxWords: GAME_CONFIG.DEFAULT_MAX_SYLLABLE_COVERAGE,
};

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(GAME_CONFIG.STORAGE_KEY_MAX_WORDS).then(val => {
      if (val !== null) {
        setSettingsState({ maxWords: parseInt(val, 10) });
      }
      setLoaded(true);
    });
  }, []);

  const setMaxWords = useCallback(async (value: number) => {
    const clamped = Math.max(1, Math.min(MAX_SYLLABLE_COVERAGE, value));
    setSettingsState(s => ({ ...s, maxWords: clamped }));
    await AsyncStorage.setItem(GAME_CONFIG.STORAGE_KEY_MAX_WORDS, String(clamped));
  }, []);

  return { settings, setMaxWords, loaded, MAX_SYLLABLE_COVERAGE };
}
