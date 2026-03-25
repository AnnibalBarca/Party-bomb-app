import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { isDictionaryReady, getDictionarySize, importWords } from '../lib/database';
import { SAMPLE_FRENCH_WORDS } from '../lib/sampleWords';

export default function HomeScreen() {
  const [dictionaryStatus, setDictionaryStatus] = useState<'checking' | 'ready' | 'empty'>('checking');
  const [wordCount, setWordCount] = useState(0);
  const [importing, setImporting] = useState(false);

  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    checkDictionary();

    // Pulse animation for the bomb emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  async function checkDictionary() {
    const ready = await isDictionaryReady();
    if (ready) {
      const count = await getDictionarySize();
      setWordCount(count);
      setDictionaryStatus('ready');
    } else {
      setDictionaryStatus('empty');
    }
  }

  async function loadSampleDictionary() {
    setImporting(true);
    try {
      const count = await importWords(SAMPLE_FRENCH_WORDS);
      setWordCount(count);
      setDictionaryStatus('ready');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de charger le dictionnaire.");
    } finally {
      setImporting(false);
    }
  }

  function handlePlay() {
    if (dictionaryStatus !== 'ready') {
      Alert.alert(
        'Dictionnaire manquant',
        'Chargez d\'abord le dictionnaire pour jouer.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('/game');
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Animated.Text style={[styles.bombEmoji, { transform: [{ scale: pulseAnim }] }]}>
          💣
        </Animated.Text>
        <Text style={styles.title}>BOMB PARTY</Text>
        <Text style={styles.subtitle}>Mode hors-ligne • Français</Text>
      </View>

      {/* Dictionary status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, dictionaryStatus === 'ready' ? styles.dotGreen : styles.dotRed]} />
          <Text style={styles.statusText}>
            {dictionaryStatus === 'checking' && 'Vérification du dictionnaire...'}
            {dictionaryStatus === 'ready' && `Dictionnaire prêt — ${wordCount.toLocaleString('fr-FR')} mots`}
            {dictionaryStatus === 'empty' && 'Dictionnaire non chargé'}
          </Text>
        </View>

        {dictionaryStatus === 'empty' && (
          <TouchableOpacity
            style={[styles.importBtn, importing && styles.importBtnDisabled]}
            onPress={loadSampleDictionary}
            disabled={importing}
          >
            <Text style={styles.importBtnText}>
              {importing ? '⏳ Chargement...' : '📥 Charger le dictionnaire de base'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rules */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>Comment jouer</Text>
        <View style={styles.rule}>
          <Text style={styles.ruleIcon}>🔤</Text>
          <Text style={styles.ruleText}>Une syllabe apparaît à l'écran</Text>
        </View>
        <View style={styles.rule}>
          <Text style={styles.ruleIcon}>⏱️</Text>
          <Text style={styles.ruleText}>Tapez un mot contenant cette syllabe avant que la bombe explose</Text>
        </View>
        <View style={styles.rule}>
          <Text style={styles.ruleIcon}>❤️</Text>
          <Text style={styles.ruleText}>Vous avez 3 vies — chaque erreur ou timeout en enlève une</Text>
        </View>
        <View style={styles.rule}>
          <Text style={styles.ruleIcon}>🚀</Text>
          <Text style={styles.ruleText}>Le timer accélère à chaque mot réussi !</Text>
        </View>
      </View>

      {/* Play button */}
      <TouchableOpacity
        style={[styles.playBtn, dictionaryStatus !== 'ready' && styles.playBtnDisabled]}
        onPress={handlePlay}
        activeOpacity={0.8}
      >
        <Text style={styles.playBtnText}>
          {dictionaryStatus === 'checking' ? '...' : '▶  JOUER'}
        </Text>
      </TouchableOpacity>

      {/* Settings link */}
      <TouchableOpacity
        style={styles.settingsLink}
        onPress={() => router.push('/settings')}
      >
        <Text style={styles.settingsLinkText}>⚙️  Paramètres & Import dictionnaire</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0f0f1a' },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  bombEmoji: { fontSize: 72, marginBottom: 12 },
  title: {
    color: '#e2e8f0',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 2,
  },
  statusCard: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    padding: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: { backgroundColor: '#00d68f' },
  dotRed: { backgroundColor: '#ff3d71' },
  statusText: { color: '#e2e8f0', fontSize: 14 },
  importBtn: {
    marginTop: 12,
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  importBtnDisabled: { opacity: 0.5 },
  importBtnText: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  rulesCard: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    padding: 16,
    marginBottom: 28,
    gap: 10,
  },
  rulesTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  rule: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  ruleIcon: { fontSize: 18, width: 24 },
  ruleText: { color: '#94a3b8', fontSize: 14, flex: 1, lineHeight: 20 },
  playBtn: {
    width: '100%',
    backgroundColor: '#e94560',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  playBtnDisabled: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#0f3460',
    shadowOpacity: 0,
  },
  playBtnText: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 4 },
  settingsLink: { paddingVertical: 8 },
  settingsLinkText: { color: '#64748b', fontSize: 14 },
});
