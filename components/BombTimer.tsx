import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface BombTimerProps {
  progress: number;  // 0 (empty) → 1 (full)
  timerMs: number;
  isPlaying: boolean;
}

export function BombTimer({ progress, timerMs, isPlaying }: BombTimerProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const secondsLeft = Math.ceil(timerMs / 1000);
  const isCritical = progress < 0.25;
  const isDanger = progress < 0.10;

  // Shake animation when critical
  useEffect(() => {
    if (!isPlaying) return;

    if (isDanger) {
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ])
      );
      shake.start();
      return () => shake.stop();
    } else if (isCritical) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.08, duration: 400, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      shakeAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [isCritical, isDanger, isPlaying]);

  // Glow pulse
  useEffect(() => {
    if (!isPlaying) return;
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, [isPlaying]);

  const bombColor = isDanger
    ? '#ff3d71'
    : isCritical
    ? '#f5a623'
    : '#00d68f';

  const fuseLength = progress * 60;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: shakeAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Fuse */}
      <View style={styles.fuseContainer}>
        <View style={[styles.fuse, { height: fuseLength }]} />
        {isPlaying && (
          <Animated.View
            style={[
              styles.spark,
              {
                bottom: fuseLength - 4,
                opacity: glowAnim,
                backgroundColor: bombColor,
              },
            ]}
          />
        )}
      </View>

      {/* Bomb body */}
      <View style={[styles.bombBody, { borderColor: bombColor, shadowColor: bombColor }]}>
        <Text style={[styles.timerText, { color: bombColor }]}>
          {secondsLeft}
        </Text>
        <Text style={styles.timerLabel}>sec</Text>
      </View>

      {/* Progress arc indicator */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: bombColor },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  fuseContainer: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'flex-end',
  },
  fuse: {
    width: 4,
    backgroundColor: '#8b7355',
    borderRadius: 2,
    minHeight: 4,
  },
  spark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
  },
  bombBody: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1a1a2e',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  timerText: {
    fontSize: 40,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    color: '#64748b',
    fontSize: 12,
    marginTop: -4,
  },
  progressBar: {
    marginTop: 12,
    width: 140,
    height: 6,
    backgroundColor: '#1a1a2e',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
