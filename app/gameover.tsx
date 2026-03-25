import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function GameOverScreen() {
  const params = useLocalSearchParams<{
    score: string;
    wordCount: string;
    lastWord: string;
  }>();

  const score = parseInt(params.score ?? '0', 10);
  const wordCount = parseInt(params.wordCount ?? '0', 10);
  const lastWord = params.lastWord ?? '';

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getRating = () => {
    if (wordCount === 0) return { emoji: '😬', label: 'Oops...' };
    if (wordCount < 5) return { emoji: '😅', label: 'Pas mal !' };
    if (wordCount < 10) return { emoji: '😊', label: 'Bien joué !' };
    if (wordCount < 20) return { emoji: '🔥', label: 'Excellent !' };
    return { emoji: '🏆', label: 'Maître de la bombe !' };
  };

  const { emoji, label } = getRating();

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        style={[
          styles.container,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Explosion */}
        <Text style={styles.explosion}>💥</Text>
        <Text style={styles.title}>BOOM !</Text>
        <Text style={styles.subtitle}>La bombe a explosé</Text>

        {/* Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingEmoji}>{emoji}</Text>
          <Text style={styles.ratingLabel}>{label}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{score.toLocaleString('fr-FR')}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{wordCount}</Text>
            <Text style={styles.statLabel}>Mots</Text>
          </View>
        </View>

        {lastWord && (
          <View style={styles.lastWordContainer}>
            <Text style={styles.lastWordLabel}>Dernier mot</Text>
            <Text style={styles.lastWord}>{lastWord}</Text>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.replayBtn}
          onPress={() => router.replace('/game')}
          activeOpacity={0.8}
        >
          <Text style={styles.replayBtnText}>🔄  REJOUER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeBtnText}>🏠  Accueil</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0f1a' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  explosion: { fontSize: 80, marginBottom: 8 },
  title: {
    color: '#e94560',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 6,
  },
  subtitle: { color: '#64748b', fontSize: 15, marginTop: -8 },
  ratingCard: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginVertical: 8,
  },
  ratingEmoji: { fontSize: 40, marginBottom: 4 },
  ratingLabel: { color: '#f5a623', fontSize: 18, fontWeight: '700' },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    width: '100%',
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    color: '#e2e8f0',
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statLabel: { color: '#64748b', fontSize: 12, marginTop: 4, letterSpacing: 1 },
  statDivider: { width: 1, backgroundColor: '#0f3460', marginVertical: 16 },
  lastWordContainer: {
    alignItems: 'center',
    gap: 4,
  },
  lastWordLabel: { color: '#64748b', fontSize: 12, letterSpacing: 1 },
  lastWord: {
    color: '#94a3b8',
    fontSize: 20,
    fontStyle: 'italic',
  },
  replayBtn: {
    width: '100%',
    backgroundColor: '#e94560',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 8,
  },
  replayBtnText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 3 },
  homeBtn: {
    paddingVertical: 12,
  },
  homeBtnText: { color: '#64748b', fontSize: 15 },
});
