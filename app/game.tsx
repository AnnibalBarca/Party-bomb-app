import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useGame } from '../hooks/useGame';
import { BombTimer } from '../components/BombTimer';
import { SyllableDisplay } from '../components/SyllableDisplay';
import { WordInput } from '../components/WordInput';
import { LivesDisplay } from '../components/LivesDisplay';
import { FeedbackBanner } from '../components/FeedbackBanner';

export default function GameScreen() {
  const { state, timerProgress, startGame, submitWord, pauseGame, resumeGame } = useGame();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startGame();
    }
  }, []);

  // Navigate to game-over when lost
  useEffect(() => {
    if (state.status === 'lost') {
      router.replace({
        pathname: '/gameover',
        params: {
          score: String(state.score),
          wordCount: String(state.wordCount),
          lastWord: state.lastWord,
        },
      });
    }
  }, [state.status]);

  const handlePause = () => {
    if (state.status === 'playing') pauseGame();
    else if (state.status === 'paused') resumeGame();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{state.score.toLocaleString('fr-FR')}</Text>
          </View>

          <TouchableOpacity onPress={handlePause} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>{state.status === 'paused' ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
        </View>

        {/* Lives */}
        <LivesDisplay lives={state.lives} />

        {/* Word count streak */}
        <Text style={styles.wordCount}>
          {state.wordCount > 0
            ? `🔥 ${state.wordCount} mot${state.wordCount > 1 ? 's' : ''}`
            : 'Commencez !'}
        </Text>

        {/* Feedback banner */}
        <View style={styles.feedbackContainer}>
          <FeedbackBanner type={state.feedbackType} message={state.feedbackMessage} />
        </View>

        {/* Bomb */}
        <BombTimer
          progress={timerProgress}
          timerMs={state.timerMs}
          isPlaying={state.status === 'playing'}
        />

        {/* Syllable */}
        <SyllableDisplay syllable={state.currentSyllable} />

        {/* Input */}
        <WordInput
          syllable={state.currentSyllable}
          onSubmit={submitWord}
          disabled={state.status !== 'playing'}
          feedbackType={state.feedbackType}
        />

        {/* Pause overlay */}
        {state.status === 'paused' && (
          <View style={styles.pauseOverlay}>
            <Text style={styles.pauseTitle}>⏸ PAUSE</Text>
            <TouchableOpacity style={styles.resumeBtn} onPress={resumeGame}>
              <Text style={styles.resumeBtnText}>▶  REPRENDRE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quitBtn} onPress={() => router.replace('/')}>
              <Text style={styles.quitBtnText}>Quitter la partie</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0f1a' },
  container: { flex: 1, alignItems: 'center', paddingBottom: 20 },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: '#94a3b8', fontSize: 16 },
  scoreContainer: { alignItems: 'center' },
  scoreLabel: { color: '#64748b', fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  scoreValue: { color: '#f5a623', fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  wordCount: { color: '#64748b', fontSize: 13, marginTop: 4, marginBottom: 8 },
  feedbackContainer: {
    width: '100%',
    height: 50,
    position: 'relative',
    marginBottom: 4,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,26,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 200,
  },
  pauseTitle: {
    color: '#e2e8f0',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 24,
  },
  resumeBtn: {
    backgroundColor: '#e94560',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  resumeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 3 },
  quitBtn: { marginTop: 8 },
  quitBtnText: { color: '#64748b', fontSize: 15 },
});
