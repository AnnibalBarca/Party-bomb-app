# 💣 Bomb Party — Offline (iOS / Expo)

Version locale et hors-ligne de [JKLM Bomb Party](https://jklm.fun/games/bombparty), construite avec **Expo + React Native + TypeScript + SQLite**.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Expo (React Native) + TypeScript |
| Navigation | Expo Router (file-based) |
| Base de données | expo-sqlite (WAL mode, < 50 ms) |
| Style | NativeWind (Tailwind CSS) |
| Animations | React Native Animated API |

---

## Fonctionnalités

- **Mode solo hors-ligne** : 100% sans internet
- **Dictionnaire français SQLite** : validation < 50 ms par mot
- **Game loop** : syllabe → timer 10s → validation → syllabe suivante
- **Accélération progressive** : le timer réduit à chaque série de 5 mots
- **3 vies** avec retour visuel animé (cœurs)
- **Score dynamique** : bonus selon la rapidité de la réponse
- **Pause** en cours de partie
- **Import de dictionnaire** personnalisé (frgut.txt, ODS → CSV, texte brut)

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer sur iOS (simulateur ou appareil physique via Expo Go)
npx expo start --ios
```

---

## Import du dictionnaire français complet

Le dictionnaire intégré contient ~3 000 mots courants.
Pour un dictionnaire complet (~150 000 mots ODS), utilisez la source recommandée :

### Depuis frgut.txt (source: LostExcalibur/Bomb_Party)

```bash
# Télécharger le fichier
curl -o assets/french-words.txt \
  https://raw.githubusercontent.com/LostExcalibur/Bomb_Party/main/frgut.txt

# Importer dans SQLite
npm run import-dict
```

### Depuis un fichier ODS (Officiel Du Scrabble)

```bash
# 1. Ouvrir le .ods dans LibreOffice → Exporter en CSV
# 2. Importer le CSV
npm run import-dict assets/mon-dictionnaire.csv
```

Le script lit la première colonne de chaque ligne, filtre les mots français valides, et génère le fichier SQL utilisé par l'app.

---

## Structure du projet

```
app/
  _layout.tsx        # Root layout (expo-router)
  index.tsx          # Écran d'accueil
  game.tsx           # Écran de jeu
  gameover.tsx       # Écran de fin de partie
  settings.tsx       # Paramètres & import dictionnaire

components/
  BombTimer.tsx      # Bombe animée avec timer
  SyllableDisplay.tsx # Affichage de la syllabe courante
  WordInput.tsx      # Champ de saisie avec highlight syllabe
  LivesDisplay.tsx   # Affichage des vies (cœurs)
  FeedbackBanner.tsx # Bannière retour correct/faux/timeout

hooks/
  useGame.ts         # Logique de jeu (reducer + timer)

lib/
  database.ts        # Service SQLite (validation, import)
  types.ts           # Types TypeScript
  sampleWords.ts     # Dictionnaire de base (~3 000 mots)

constants/
  syllables.ts       # 120+ syllabes (easy/medium/hard)
  gameConfig.ts      # Configuration du jeu

scripts/
  importDictionary.ts # Script d'import CLI
```

---

## Sources

- Logique de jeu : [sertdfyguhi/solo-bomb-party](https://github.com/sertdfyguhi/solo-bomb-party)
- Syllabes : [RealCyGuy/jklmbombpartystuff](https://github.com/RealCyGuy/jklmbombpartystuff)
- Dictionnaire français : [LostExcalibur/Bomb_Party](https://github.com/LostExcalibur/Bomb_Party)
