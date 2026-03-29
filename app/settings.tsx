import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Platform, Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { getDictionarySize } from '../lib/database';
import { useSettings } from '../hooks/useSettings';
import { SYLLABLE_DATA, MAX_SYLLABLE_COVERAGE } from '../constants/syllableData';

function countSyllables(maxWords: number) {
  return SYLLABLE_DATA.filter(([, c]) => c <= maxWords).length;
}

function difficultyLabel(maxWords: number): { label: string; color: string } {
  if (maxWords <= 10)    return { label: 'Extrême 💀',      color: '#ff3d71' };
  if (maxWords <= 100)   return { label: 'Très difficile 🔥', color: '#ff6b35' };
  if (maxWords <= 500)   return { label: 'Difficile 😤',    color: '#f5a623' };
  if (maxWords <= 2000)  return { label: 'Normal ⚡',       color: '#00d68f' };
  if (maxWords <= 10000) return { label: 'Facile 😊',       color: '#60a5fa' };
  return                        { label: 'Très facile 😴',  color: '#94a3b8' };
}

interface NumberInputProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  hint?: string;
  presets?: { label: string; value: number }[];
  onConfirm: (value: number) => void;
}

function NumberInput({ label, value, unit, min, max, hint, presets, onConfirm }: NumberInputProps) {
  const [text, setText] = useState(String(value));
  const [error, setError] = useState('');

  useEffect(() => { setText(String(value)); }, [value]);

  function handleConfirm() {
    const n = parseInt(text, 10);
    if (isNaN(n) || n < min || n > max) {
      setError(`Entre ${min} et ${max.toLocaleString('fr-FR')}`);
      return;
    }
    setError('');
    onConfirm(n);
    Keyboard.dismiss();
  }

  return (
    <View style={ni.container}>
      <Text style={ni.label}>{label}</Text>
      <View style={ni.row}>
        <TextInput
          style={[ni.input, error ? ni.inputError : null]}
          value={text}
          onChangeText={t => { setText(t); setError(''); }}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
          selectTextOnFocus
        />
        <Text style={ni.unit}>{unit}</Text>
        <TouchableOpacity style={ni.btn} onPress={handleConfirm}>
          <Text style={ni.btnText}>OK</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={ni.error}>{error}</Text> : null}
      {hint  ? <Text style={ni.hint}>{hint}</Text>  : null}
      {presets && (
        <View style={ni.presets}>
          {presets.map(p => (
            <TouchableOpacity
              key={p.value}
              style={[ni.preset, value === p.value && ni.presetActive]}
              onPress={() => { setText(String(p.value)); onConfirm(p.value); }}
            >
              <Text style={ni.presetText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { settings, setMaxWords, setInitialTimerSec } = useSettings();
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => { getDictionarySize().then(setWordCount); }, []);

  const { label: diffLabel, color: diffColor } = difficultyLabel(settings.maxWords);
  const syllablesAvailable = countSyllables(settings.maxWords);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.back}>← Retour</Text>
          </TouchableOpacity>
          <Text style={s.title}>Paramètres</Text>
        </View>

        {/* ── Difficulté des syllabes ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>SYLLABES</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.cardLabel}>Difficulté actuelle</Text>
              <Text style={[s.badge, { color: diffColor }]}>{diffLabel}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.cardLabel}>Syllabes disponibles</Text>
              <Text style={s.cardValue}>{syllablesAvailable.toLocaleString('fr-FR')}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.cardLabel}>Mots dans le dico</Text>
              <Text style={s.cardValue}>{wordCount.toLocaleString('fr-FR')}</Text>
            </View>
          </View>

          <NumberInput
            label="Mots max par syllabe"
            value={settings.maxWords}
            unit="mots"
            min={1}
            max={MAX_SYLLABLE_COVERAGE}
            hint={`Syllabes dont au plus N mots les contiennent. Plus petit = plus rare.`}
            presets={[
              { label: '💀 1',      value: 1 },
              { label: '🔥 50',    value: 50 },
              { label: '⚡ 1000',  value: 1000 },
              { label: '😊 10000', value: 10000 },
              { label: '😴 Max',   value: MAX_SYLLABLE_COVERAGE },
            ]}
            onConfirm={setMaxWords}
          />
        </View>

        {/* ── Timer ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>TIMER</Text>
          <NumberInput
            label="Temps par syllabe"
            value={settings.initialTimerSec}
            unit="secondes"
            min={3}
            max={60}
            hint="Durée initiale du timer. Minimum 3s, maximum 60s. Il accélère au fil de la partie."
            presets={[
              { label: '3s',  value: 3 },
              { label: '5s',  value: 5 },
              { label: '10s', value: 10 },
              { label: '20s', value: 20 },
              { label: '30s', value: 30 },
            ]}
            onConfirm={setInitialTimerSec}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0f1a' },
  container: { padding: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  back: { color: '#e94560', fontSize: 15 },
  title: { color: '#e2e8f0', fontSize: 22, fontWeight: '700' },
  section: { gap: 10 },
  sectionTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  card: { backgroundColor: '#16213e', borderRadius: 14, borderWidth: 1, borderColor: '#0f3460', padding: 16, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: '#94a3b8', fontSize: 14 },
  cardValue: { color: '#e2e8f0', fontSize: 15, fontWeight: '700' },
  badge: { fontSize: 15, fontWeight: '700' },
});

const ni = StyleSheet.create({
  container: { backgroundColor: '#16213e', borderRadius: 14, borderWidth: 1, borderColor: '#0f3460', padding: 16, gap: 10 },
  label: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 10,
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontVariant: ['tabular-nums'],
  },
  inputError: { borderColor: '#ff3d71' },
  unit: { color: '#64748b', fontSize: 14 },
  btn: { backgroundColor: '#e94560', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  error: { color: '#ff3d71', fontSize: 12 },
  hint: { color: '#64748b', fontSize: 12, lineHeight: 18 },
  presets: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  preset: { borderWidth: 1, borderColor: '#0f3460', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#0f0f1a' },
  presetActive: { borderColor: '#e94560', backgroundColor: '#16213e' },
  presetText: { color: '#94a3b8', fontSize: 12 },
});
