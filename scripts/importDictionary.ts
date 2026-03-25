/**
 * Dictionary Import Script
 * ========================
 * Imports a French word list into the SQLite database used by the app.
 *
 * Usage:
 *   npx ts-node scripts/importDictionary.ts [path-to-wordlist.txt]
 *
 * Sources:
 *   - frgut.txt from https://github.com/LostExcalibur/Bomb_Party
 *   - Any plain-text word list (one word per line)
 *   - ODS (Officiel Du Scrabble) format: plain text, one word per line
 *
 * For ODS from LibreOffice Calc (.ods file):
 *   1. Open the .ods file in LibreOffice
 *   2. Export as CSV (comma-separated)
 *   3. Run: node scripts/importDictionary.ts path/to/export.csv
 *
 * The script can also be triggered from within the app via the Settings screen.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ─── Configuration ────────────────────────────────────────────────────────────

const DB_PATH = path.resolve(__dirname, '../assets/dictionary.sql');
const DEFAULT_WORD_LIST = path.resolve(__dirname, '../assets/french-words.txt');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidFrenchWord(word: string): boolean {
  const normalized = word.trim().toLowerCase();
  // Allow French characters, hyphens, apostrophes; min 2 chars
  return normalized.length >= 2 && /^[a-záàâäéèêëîïôùûüçœæ'-]+$/i.test(normalized);
}

async function readWordList(filePath: string): Promise<string[]> {
  const words: string[] = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    // Handle CSV (take first column), plain text, and whitespace-separated
    const parts = line.split(/[,;\t]/);
    const word = parts[0].trim().replace(/^["']|["']$/g, '');
    if (isValidFrenchWord(word)) {
      words.push(word.toLowerCase());
    }
  }

  return words;
}

// ─── SQL Export ───────────────────────────────────────────────────────────────

async function exportToSQL(words: string[], outputPath: string): Promise<void> {
  const stream = fs.createWriteStream(outputPath);

  stream.write('-- Bomb Party French Dictionary\n');
  stream.write(`-- Generated: ${new Date().toISOString()}\n`);
  stream.write(`-- Words: ${words.length}\n\n`);
  stream.write('CREATE TABLE IF NOT EXISTS mots (id INTEGER PRIMARY KEY AUTOINCREMENT, mot TEXT NOT NULL UNIQUE COLLATE NOCASE);\n');
  stream.write('CREATE INDEX IF NOT EXISTS idx_mot ON mots(mot COLLATE NOCASE);\n\n');
  stream.write('BEGIN TRANSACTION;\n');

  const BATCH_SIZE = 500;
  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    const values = batch.map(w => `('${w.replace(/'/g, "''")}')`).join(',\n  ');
    stream.write(`INSERT OR IGNORE INTO mots (mot) VALUES\n  ${values};\n`);
  }

  stream.write('COMMIT;\n');
  stream.write(`INSERT OR REPLACE INTO meta (key, value) VALUES ('last_import', '${new Date().toISOString()}');\n`);

  await new Promise<void>((resolve, reject) => {
    stream.end((err?: Error | null) => (err ? reject(err) : resolve()));
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const inputPath = process.argv[2] || DEFAULT_WORD_LIST;

  if (!fs.existsSync(inputPath)) {
    console.error(`\n❌ File not found: ${inputPath}`);
    console.log('\nUsage:');
    console.log('  npx ts-node scripts/importDictionary.ts <path-to-wordlist.txt>\n');
    console.log('Expected format: plain text file, one French word per line.');
    console.log('Also accepts: CSV (first column used), ODS exported as CSV.\n');
    console.log('Free French word lists:');
    console.log('  - https://github.com/LostExcalibur/Bomb_Party (frgut.txt)');
    console.log('  - https://github.com/chrplr/openlexicon (Lexique)');
    process.exit(1);
  }

  console.log(`\n📖 Reading word list from: ${inputPath}`);
  const words = await readWordList(inputPath);
  console.log(`✅ Found ${words.length.toLocaleString()} valid words`);

  // Deduplicate
  const unique = [...new Set(words)];
  console.log(`🔄 After deduplication: ${unique.length.toLocaleString()} words`);

  // Export SQL
  const outputDir = path.dirname(DB_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\n💾 Writing SQL to: ${DB_PATH}`);
  await exportToSQL(unique, DB_PATH);
  console.log(`✅ Export complete!\n`);

  console.log('Next steps:');
  console.log('1. The app will auto-load assets/dictionary.sql on first launch');
  console.log('2. Or use the "Import Dictionary" button in Settings\n');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
