import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';

interface WordInputProps {
  syllable: string;
  onSubmit: (word: string) => void;
  disabled?: boolean;
  feedbackType: 'correct' | 'wrong' | 'timeout' | null;
}

export function WordInput({ syllable, onSubmit, disabled, feedbackType }: WordInputProps) {
  const [word, setWord] = useState('');
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  // Auto-focus
  useEffect(() => {
    if (!disabled) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [disabled, syllable]);

  // Clear input on new syllable
  useEffect(() => {
    setWord('');
  }, [syllable]);

  // Feedback animations
  useEffect(() => {
    if (feedbackType === 'wrong' || feedbackType === 'timeout') {
      // Shake
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    if (feedbackType === 'correct') {
      Animated.sequence([
        Animated.timing(borderAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(borderAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]).start();
    }
  }, [feedbackType]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0f3460', '#00d68f'],
  });

  const handleSubmit = () => {
    const trimmed = word.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setWord('');
    Keyboard.dismiss();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Highlight syllable in typed word
  const renderHighlightedWord = () => {
    if (!word) return null;
    const lower = word.toLowerCase();
    const syl = syllable.toLowerCase();
    const idx = lower.indexOf(syl);
    if (idx === -1) {
      return <Text style={styles.previewText}>{word}</Text>;
    }
    return (
      <Text style={styles.previewText}>
        <Text>{word.slice(0, idx)}</Text>
        <Text style={styles.previewHighlight}>{word.slice(idx, idx + syl.length)}</Text>
        <Text>{word.slice(idx + syl.length)}</Text>
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Live preview with syllable highlight */}
      {word.length > 0 && (
        <View style={styles.previewContainer}>
          {renderHighlightedWord()}
        </View>
      )}

      <Animated.View
        style={[
          styles.inputRow,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        <Animated.View style={[styles.inputWrapper, { borderColor }]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={word}
            onChangeText={setWord}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            placeholderTextColor="#374151"
            placeholder={`...${syllable.toLowerCase()}...`}
            editable={!disabled}
            maxLength={30}
          />
        </Animated.View>

        <TouchableOpacity
          style={[styles.submitBtn, (!word.trim() || disabled) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!word.trim() || disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.submitIcon}>→</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 24,
  },
  previewText: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  previewHighlight: {
    color: '#e94560',
    textDecorationLine: 'underline',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#16213e',
    overflow: 'hidden',
  },
  input: {
    color: '#e2e8f0',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#e94560',
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  submitIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
