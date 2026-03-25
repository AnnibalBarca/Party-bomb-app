import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { GAME_CONFIG } from '../constants/gameConfig';

interface LivesDisplayProps {
  lives: number;
}

export function LivesDisplay({ lives }: LivesDisplayProps) {
  const prevLivesRef = useRef(lives);
  const lostAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (lives < prevLivesRef.current) {
      // Heart lost animation
      Animated.sequence([
        Animated.timing(lostAnim, { toValue: 1.4, duration: 100, useNativeDriver: true }),
        Animated.timing(lostAnim, { toValue: 0.6, duration: 100, useNativeDriver: true }),
        Animated.timing(lostAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
    prevLivesRef.current = lives;
  }, [lives]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: lostAnim }] }]}>
      {Array.from({ length: GAME_CONFIG.INITIAL_LIVES }).map((_, i) => (
        <Text key={i} style={[styles.heart, i < lives ? styles.heartFull : styles.heartEmpty]}>
          {i < lives ? '❤️' : '🖤'}
        </Text>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 28,
  },
  heartFull: {
    opacity: 1,
  },
  heartEmpty: {
    opacity: 0.3,
  },
});
