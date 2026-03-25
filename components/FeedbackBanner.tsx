import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { FeedbackType } from '../lib/types';

interface FeedbackBannerProps {
  type: FeedbackType;
  message: string;
}

export function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (!type) return;

    opacityAnim.setValue(0);
    translateAnim.setValue(-10);

    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(translateAnim, { toValue: 0, useNativeDriver: true, tension: 200 }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
      }, 1200);
    });
  }, [type, message]);

  if (!type) return null;

  const color =
    type === 'correct' ? '#00d68f' :
    type === 'timeout' ? '#f5a623' :
    '#ff3d71';

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ translateY: translateAnim }], borderColor: color },
      ]}
    >
      <Text style={[styles.text, { color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 100,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
