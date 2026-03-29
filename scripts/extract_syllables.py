"""
extract_syllables.py
====================
Extrait toutes les sous-chaînes de 2-4 lettres du dictionnaire français,
compte le nombre de mots qui les contiennent, et génère un fichier TypeScript.

Usage:
    python3 scripts/extract_syllables.py

Output:
    constants/syllableData.ts   — syllables + scores triés par fréquence
"""

import re
import json
from collections import defaultdict
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────
DICT_PATH   = Path(__file__).parent.parent / "assets" / "french-words.txt"
OUTPUT_TS   = Path(__file__).parent.parent / "constants" / "syllableData.ts"
MIN_LEN     = 2
MAX_LEN     = 4
# ────────────────────────────────────────────────────────────────────────────

def is_valid_french(w: str) -> bool:
    return bool(re.match(r"^[a-záàâäéèêëîïôùûüçœæ]+$", w, re.IGNORECASE))

def extract_substrings(word: str) -> set[str]:
    """All unique substrings of length MIN_LEN..MAX_LEN in word."""
    subs = set()
    n = len(word)
    for length in range(MIN_LEN, MAX_LEN + 1):
        for i in range(n - length + 1):
            subs.add(word[i:i+length])
    return subs

def main():
    print(f"📖 Lecture du dictionnaire : {DICT_PATH}")
    words = []
    with open(DICT_PATH, encoding="utf-8") as f:
        for line in f:
            w = line.strip().lower()
            if len(w) >= 3 and is_valid_french(w):
                words.append(w)

    print(f"✅ {len(words):,} mots valides chargés")

    # Count how many words contain each substring
    counts: dict[str, int] = defaultdict(int)
    for word in words:
        for sub in extract_substrings(word):
            if is_valid_french(sub):  # letters only, no accents issues
                counts[sub] += 1

    # Sort by count descending
    sorted_items = sorted(counts.items(), key=lambda x: -x[1])

    total = len(sorted_items)
    max_count = sorted_items[0][1] if sorted_items else 0
    print(f"✅ {total:,} syllabes uniques extraites")
    print(f"   Max coverage : '{sorted_items[0][0]}' → {max_count:,} mots")
    print(f"   Min coverage : '{sorted_items[-1][0]}' → {sorted_items[-1][1]} mot(s)")

    # Stats
    buckets = {"≥10000": 0, "1000-9999": 0, "100-999": 0, "10-99": 0, "2-9": 0, "1": 0}
    for _, c in sorted_items:
        if c >= 10000:    buckets["≥10000"] += 1
        elif c >= 1000:   buckets["1000-9999"] += 1
        elif c >= 100:    buckets["100-999"] += 1
        elif c >= 10:     buckets["10-99"] += 1
        elif c >= 2:      buckets["2-9"] += 1
        else:             buckets["1"] += 1

    print("\n📊 Distribution:")
    for label, n in buckets.items():
        print(f"   {label:>12} mots/syllabe : {n:,} syllabes")

    # Generate TypeScript
    print(f"\n💾 Génération de {OUTPUT_TS}")
    OUTPUT_TS.parent.mkdir(exist_ok=True)

    # Build JS object as array of [syllable, count] pairs
    entries = [f'  ["{s}", {c}],' for s, c in sorted_items]

    ts_content = f"""/**
 * syllableData.ts — Auto-généré par scripts/extract_syllables.py
 *
 * {total:,} syllabes extraites du dictionnaire ODS ({len(words):,} mots)
 * Chaque entrée : [syllabe, nombre_de_mots_qui_la_contiennent]
 * Triées par fréquence décroissante.
 *
 * Max coverage : '{sorted_items[0][0]}' → {max_count:,} mots
 * Min coverage : syllabe présente dans 1 seul mot
 */

export type SyllableEntry = [string, number];

/** Toutes les syllabes avec leur score de couverture, triées par fréquence */
export const SYLLABLE_DATA: SyllableEntry[] = [
{chr(10).join(entries)}
];

/** Nombre maximum de mots qu'une syllabe peut couvrir dans ce dictionnaire */
export const MAX_SYLLABLE_COVERAGE = {max_count};

/**
 * Retourne une syllabe aléatoire dont la couverture est ≤ maxWords.
 * Plus maxWords est petit, plus la syllabe est rare/difficile.
 */
export function getRandomSyllable(maxWords: number = {min(1000, max_count)}): string {{
  // Filtrer les syllabes dont la couverture est dans [1, maxWords]
  const candidates = SYLLABLE_DATA.filter(([, count]) => count <= maxWords);
  if (candidates.length === 0) {{
    // Fallback : syllabe la plus facile
    return SYLLABLE_DATA[0][0];
  }}
  // Pondérer légèrement vers les syllabes plus fréquentes pour équilibrer
  const idx = Math.floor(Math.random() * Math.min(candidates.length, candidates.length));
  return candidates[idx][0];
}}

/**
 * Retourne une syllabe différente de lastSyllable, couverture ≤ maxWords.
 */
export function getNextSyllable(lastSyllable: string | null, maxWords: number = {min(1000, max_count)}): string {{
  let syllable = getRandomSyllable(maxWords);
  let attempts = 0;
  while (syllable === lastSyllable && attempts < 10) {{
    syllable = getRandomSyllable(maxWords);
    attempts++;
  }}
  return syllable;
}}
"""

    with open(OUTPUT_TS, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"✅ Fichier généré : {OUTPUT_TS}")
    print(f"\nProchaines étapes :")
    print(f"  1. Le fichier constants/syllableData.ts est prêt")
    print(f"  2. Mettre à jour hooks/useGame.ts pour utiliser getNextSyllable de syllableData")
    print(f"  3. Ajouter le réglage maxWords dans settings.tsx")

if __name__ == "__main__":
    main()
