import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { getDictionarySize, importWords } from '../lib/database';
import { SAMPLE_FRENCH_WORDS } from '../lib/sampleWords';
import { useSettings } from '../hooks/useSettings';
import { SYLLABLE_DATA, MAX_SYLLABLE_COVERAGE } from '../constants/syllableData';
import { GAME_CONFIG } from '../constants/gameConfig';

function countSyllablesAvailable(maxWords: number): number {
  return SYLLABLE_DATA.filter(([, count]) => count <= maxWords).length;
}

export default function SettingsScreen() {
  const { settings, setMaxWords } = useSettings();
  const [wordCount, setWordCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [sliderValue, setSliderValue] = useState(settings.maxWords);

  useEffect(() => {
    getDictionarySize().then(setWordCount);
  }, []);

  useEffect(() => {
    setSliderValue(settings.maxWords);
  }, [settings.maxWords]);

  const syllablesAvailable = countSyllablesAvailable(sliderValue);

  const difficultyLabel = () => {
    if (sliderValue <= 10)    return { label: 'Extrême 💀', color: '#ff3d71' };
    if (sliderValue <= 100)   return { label: 'Très difficile 🔥', color: '#ff6b35' };
    if (sliderValue <= 500)   return { label: 'Difficile 😤', color: '#f5a623' };
    if (sliderValue <= 2000)  return { label: 'Normal ⚡', color: '#00d68f' };
    if (sliderValue <= 10000) return { label: 'Facile 😊', color: '#60a5fa' };
    return { label: 'Très facile 😴', color: '#94a3b8' };
  };

  const { label: diffLabel, color: diffColor } = difficultyLabel();

  async function handleImportSample() {
    setImporting(true);
    try {
      const count = await importWords(SAMPLE_FRENCH_WORDS);
      setWordCount(count);
      Alert.alert('✅ Succès', `${count.toLocaleString('fr-FR')} mots chargés.`);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger le dictionnaire.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Paramètres</Text>
        </View>

        {/* ── Difficulté des syllabes ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DIFFICULTÉ DES SYLLABES</Text>

          <View style={styles.card}>
            <View style={styles.diffRow}>
              <Text style={styles.diffLabel}>Difficulté</Text>
              <Text style={[styles.diffValue, { color: diffColor }]}>{diffLabel}</Text>
            </View>

            <View style={styles.sliderRow}>
              <Text style={styles.sliderMin}>1</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={MAX_SYLLABLE_COVERAGE}
                step={1}
                value={sliderValue}
                onValueChange={setSliderValue}
                onSlidingComplete={setMaxWords}
                minimumTrackTintColor={diffColor}
                maximumTrackTintColor="#0f3460"
                thumbTintColor={diffColor}
              />
              <Text style={styles.sliderMax}>{MAX_SYLLABLE_COVERAGE.toLocaleString('fr-FR')}</Text>
            </View>

            {/* Current value display */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: diffColor }]}>
                  ≤ {sliderValue.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.statLabel}>mots max / syllabe</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: diffColor }]}>
                  {syllablesAvailable.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.statLabel}>syllabes possibles</Text>
              </View>
            </View>

            <Text style={styles.hint}>
              {sliderValue <= 10
                ? '⚠️ Très peu de mots valides — bonne chance !'
                : sliderValue <= 100
                ? '💡 Syllabes rares, mots peu courants'
                : sliderValue <= 1000
                ? '💡 Équilibre idéal entre difficulté et jouabilité'
                : '💡 Syllabes très communes, beaucoup de choix'}
            </Text>
          </View>

          {/* Quick presets */}
          <View style={styles.presetsRow}>
            {[
              { label: '💀 1', value: 1 },
              { label: '🔥 50', value: 50 },
              { label: '⚡ 1 000', value: 1000 },
              { label: '😊 10 000', value: 10000 },
              { label: '😴 Max', value: MAX_SYLLABLE_COVERAGE },
            ].map(p => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.preset,
                  sliderValue === p.value && { borderColor: diffColor, backgroundColor: '#16213e' },
                ]}
                onPress={() => { setSliderValue(p.value); setMaxWords(p.value); }}
              >
                <Text style={styles.presetText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Dictionnaire ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DICTIONNAIRE</Text>
          <View style={styles.card}>
            <View style={styles.diffRow}>
              <Text style={styles.diffLabel}>Mots chargés</Text>
              <Text style={styles.statValue}>{wordCount.toLocaleString('fr-FR')}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📁 Importer un dictionnaire personnalisé</Text>
            <Text style={styles.infoStep}>1. Copiez votre fichier dans <Text style={styles.code}>assets/french-words.txt</Text></Text>
            <Text style={styles.infoStep}>2. Lancez : <Text style={styles.code}>python3 scripts/extract_syllables.py</Text></Text>
            <Text style={styles.infoStep}>3. Lancez : <Text style={styles.code}>npx expo start</Text></Text>
            <Text style={styles.infoLink}>Source : github.com/NiTrO0FuN/bomb-party-buddy (fr.txt)</Text>
          </View>
        </View>

        {/* ── À propos ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À PROPOS</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              Syllabes extraites du dictionnaire ODS via script Python.
              {'\n'}{SYLLABLE_DATA.length.toLocaleString('fr-FR')} syllabes uniques • {MAX_SYLLABLE_COVERAGE.toLocaleString('fr-FR')} mots max.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0f1a' },
  container: { padding: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  backBtn: { paddingVertical: 4 },
  backBtnText: { color: '#e94560', fontSize: 15 },
  title: { color: '#e2e8f0', fontSize: 22, fontWeight: '700' },
  section: { gap: 10 },
  sectionTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    padding: 16,
    gap: 12,
  },
  diffRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffLabel: { color: '#94a3b8', fontSize: 14 },
  diffValue: { fontSize: 16, fontWeight: '700' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderMin: { color: '#64748b', fontSize: 11, width: 14, textAlign: 'center' },
  sliderMax: { color: '#64748b', fontSize: 11, width: 50, textAlign: 'right' },
  slider: { flex: 1, height: 40 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#0f0f1a',
    borderRadius: 10,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statValue: { color: '#e2e8f0', fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { color: '#64748b', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#0f3460', marginVertical: 8 },
  hint: { color: '#64748b', fontSize: 12, lineHeight: 18 },
  presetsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  preset: {
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#0f0f1a',
  },
  presetText: { color: '#94a3b8', fontSize: 12 },
  infoBox: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    padding: 16,
    gap: 6,
  },
  infoTitle: { color: '#f5a623', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  infoStep: { color: '#94a3b8', fontSize: 13 },
  code: { color: '#e94560', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  infoLink: { color: '#64748b', fontSize: 12, marginTop: 4 },
  aboutText: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
});
