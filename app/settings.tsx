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
import { router } from 'expo-router';
import { getDictionarySize, importWords } from '../lib/database';
import { SAMPLE_FRENCH_WORDS } from '../lib/sampleWords';

export default function SettingsScreen() {
  const [wordCount, setWordCount] = useState(0);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    getDictionarySize().then(setWordCount);
  }, []);

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

        {/* Dictionary section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DICTIONNAIRE</Text>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Mots chargés</Text>
              <Text style={styles.cardValue}>{wordCount.toLocaleString('fr-FR')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, importing && styles.actionBtnDisabled]}
            onPress={handleImportSample}
            disabled={importing}
          >
            <Text style={styles.actionBtnText}>
              {importing ? '⏳ Import en cours...' : '📥 Charger dictionnaire de base (~3 000 mots)'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📁 Importer un dictionnaire personnalisé</Text>
            <Text style={styles.infoText}>
              Pour importer votre propre liste de mots français (frgut.txt, ODS, CSV) :
            </Text>
            <Text style={styles.infoStep}>1. Installez Node.js sur votre ordinateur</Text>
            <Text style={styles.infoStep}>2. Copiez votre fichier dans <Text style={styles.code}>assets/french-words.txt</Text></Text>
            <Text style={styles.infoStep}>3. Lancez : <Text style={styles.code}>npm run import-dict</Text></Text>
            <Text style={styles.infoStep}>4. Relancez l'application</Text>
            <Text style={styles.infoLink}>
              Source recommandée : github.com/LostExcalibur/Bomb_Party (frgut.txt)
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À PROPOS</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              Bomb Party Offline est une version locale du célèbre jeu JKLM.fun, jouable entièrement sans connexion internet.
            </Text>
            <Text style={styles.aboutText}>
              Les syllabes sont issues du projet open-source github.com/RealCyGuy/jklmbombpartystuff.
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
  sectionTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    padding: 16,
    gap: 8,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: '#94a3b8', fontSize: 14 },
  cardValue: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
  actionBtn: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  infoBox: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    padding: 16,
    gap: 6,
  },
  infoTitle: { color: '#f5a623', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  infoText: { color: '#94a3b8', fontSize: 13, lineHeight: 18 },
  infoStep: { color: '#94a3b8', fontSize: 13, paddingLeft: 8 },
  code: { color: '#e94560', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  infoLink: { color: '#64748b', fontSize: 12, marginTop: 4 },
  aboutText: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
});
