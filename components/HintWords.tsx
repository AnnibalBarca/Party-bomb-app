import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getWordsForSyllable } from '../lib/database';

interface HintWordsProps {
  failedSyllable: string | null;
}

export function HintWords({ failedSyllable }: HintWordsProps) {
  const [words, setWords] = useState<string[]>([]);
  const [syllable, setSyllable] = useState<string | null>(null);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    if (!failedSyllable) return;

    getWordsForSyllable(failedSyllable, 8).then(w => {
      setWords(w);
      setSyllable(failedSyllable);
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }, [failedSyllable]);

  if (!syllable || words.length === 0) return null;

  // Highlight the syllable within each word
  function renderWord(word: string) {
    const lower = word.toLowerCase();
    const idx = lower.indexOf(syllable!.toLowerCase());
    if (idx === -1) return <Text key={word} style={hw.word}>{word}</Text>;
    return (
      <Text key={word} style={hw.word}>
        {word.slice(0, idx)}
        <Text style={hw.highlight}>{word.slice(idx, idx + syllable!.length)}</Text>
        {word.slice(idx + syllable!.length)}
      </Text>
    );
  }

  return (
    <Animated.View style={[hw.container, { opacity: opacityAnim }]}>
      <Text style={hw.title}>
        Mots avec <Text style={hw.titleSyllable}>{syllable.toUpperCase()}</Text>
      </Text>
      <View style={hw.wordsList}>
        {words.map(renderWord)}
      </View>
    </Animated.View>
  );
}

const hw = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  title: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titleSyllable: {
    color: '#f5a623',
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  word: {
    color: '#94a3b8',
    fontSize: 13,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  highlight: {
    color: '#f5a623',
    fontWeight: '700',
  },
});
