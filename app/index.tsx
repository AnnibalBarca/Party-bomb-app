import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { isDictionaryReady, getDictionarySize, autoImportBundledDictionary } from '../lib/database';

type DictStatus = 'checking' | 'importing' | 'ready';

export default function HomeScreen() {
  const [dictStatus, setDictStatus] = useState<DictStatus>('checking');
  const [wordCount, setWordCount] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    checkAndImport();
  }, []);

  async function checkAndImport() {
    const ready = await isDictionaryReady();
    if (ready) {
      const count = await getDictionarySize();
      setWordCount(count);
      setDictStatus('ready');
    } else {
      // Auto-import the bundled 319k word list on first launch
      setDictStatus('importing');
      try {
        const count = await autoImportBundledDictionary((pct) => setImportProgress(pct));
        setWordCount(count);
        setDictStatus('ready');
      } catch (e) {
        // Fallback: still allow play with in-memory words
        setDictStatus('ready');
      }
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
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
        {dictStatus === 'checking' && (
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, styles.dotYellow]} />
            <Text style={styles.statusText}>Vérification du dictionnaire...</Text>
          </View>
        )}

        {dictStatus === 'importing' && (
          <View style={styles.importingContainer}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, styles.dotYellow]} />
              <Text style={styles.statusText}>Import du dictionnaire ODS ({importProgress}%)...</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${importProgress}%` }]} />
            </View>
            <Text style={styles.importHint}>319 000 mots — première installation uniquement</Text>
          </View>
        )}

        {dictStatus === 'ready' && (
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, styles.dotGreen]} />
            <Text style={styles.statusText}>
              {wordCount.toLocaleString('fr-FR')} mots chargés (ODS)
            </Text>
          </View>
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
          <Text style={styles.ruleText}>3 vies — chaque erreur ou timeout en enlève une</Text>
        </View>
        <View style={styles.rule}>
          <Text style={styles.ruleIcon}>🚀</Text>
          <Text style={styles.ruleText}>Le timer accélère à chaque mot réussi !</Text>
        </View>
      </View>

      {/* Play button */}
      <TouchableOpacity
        style={[styles.playBtn, dictStatus !== 'ready' && styles.playBtnDisabled]}
        onPress={() => router.push('/game')}
        disabled={dictStatus !== 'ready'}
        activeOpacity={0.8}
      >
        <Text style={styles.playBtnText}>
          {dictStatus === 'ready' ? '▶  JOUER' : '⏳  Chargement...'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsLink} onPress={() => router.push('/settings')}>
        <Text style={styles.settingsLinkText}>⚙️  Paramètres</Text>
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
  title: { color: '#e2e8f0', fontSize: 36, fontWeight: '900', letterSpacing: 8 },
  subtitle: { color: '#64748b', fontSize: 13, marginTop: 6, letterSpacing: 2 },
  statusCard: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    padding: 16,
    marginBottom: 16,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotGreen: { backgroundColor: '#00d68f' },
  dotYellow: { backgroundColor: '#f5a623' },
  dotRed: { backgroundColor: '#ff3d71' },
  statusText: { color: '#e2e8f0', fontSize: 14, flex: 1 },
  importingContainer: { gap: 10 },
  progressBar: {
    height: 6,
    backgroundColor: '#0f3460',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#f5a623', borderRadius: 3 },
  importHint: { color: '#64748b', fontSize: 12 },
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
