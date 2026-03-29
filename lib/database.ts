import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { GAME_CONFIG } from '../constants/gameConfig';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(GAME_CONFIG.DB_NAME);
    await initSchema(_db);
  }
  return _db;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS mots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mot TEXT NOT NULL UNIQUE COLLATE NOCASE
    );

    CREATE INDEX IF NOT EXISTS idx_mot ON mots(mot COLLATE NOCASE);

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

/**
 * Auto-import the bundled french-words.txt on first launch.
 * Uses multi-row INSERT batches for speed (~10-15s for 319k words).
 */
export async function autoImportBundledDictionary(
  onProgress?: (pct: number) => void
): Promise<number> {
  const db = await getDatabase();

  // Resolve bundled asset URI
  const [asset] = await Asset.loadAsync(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../assets/french-words.txt')
  );
  const uri = asset.localUri ?? asset.uri;
  if (!uri) throw new Error('Could not resolve french-words.txt asset URI');

  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const words = content
    .split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length >= 2 && /^[a-záàâäéèêëîïôùûüçœæ'-]+$/i.test(w));

  // Batch multi-row inserts: INSERT INTO mots (mot) VALUES (?),(?),...
  const BATCH = 500;
  let imported = 0;

  for (let i = 0; i < words.length; i += BATCH) {
    const batch = words.slice(i, i + BATCH);
    const placeholders = batch.map(() => '(?)').join(',');
    await db.runAsync(
      `INSERT OR IGNORE INTO mots (mot) VALUES ${placeholders}`,
      batch
    );
    imported += batch.length;
    onProgress?.(Math.round((imported / words.length) * 100));
    // Yield to UI thread between batches
    await new Promise(r => setTimeout(r, 0));
  }

  await db.runAsync(
    "INSERT OR REPLACE INTO meta (key, value) VALUES ('last_import', ?)",
    [new Date().toISOString()]
  );

  return imported;
}

/**
 * Check if a word exists in the dictionary AND contains the syllable.
 * Target: < 50ms using SQLite indexed lookup.
 */
export async function validateWord(
  word: string,
  syllable: string
): Promise<{ valid: boolean; reason?: string }> {
  const normalized = word.trim().toLowerCase();

  if (normalized.length < GAME_CONFIG.MIN_WORD_LENGTH) {
    return { valid: false, reason: `Mot trop court (min. ${GAME_CONFIG.MIN_WORD_LENGTH} lettres)` };
  }

  if (!normalized.includes(syllable.toLowerCase())) {
    return { valid: false, reason: `Le mot ne contient pas "${syllable.toUpperCase()}"` };
  }

  const db = await getDatabase();
  const result = await db.getFirstAsync<{ mot: string }>(
    'SELECT mot FROM mots WHERE mot = ? LIMIT 1',
    [normalized]
  );

  if (!result) {
    return { valid: false, reason: `"${word}" n'est pas dans le dictionnaire` };
  }

  return { valid: true };
}

export async function importWords(words: string[]): Promise<number> {
  const db = await getDatabase();
  let imported = 0;

  await db.withTransactionAsync(async () => {
    for (const word of words) {
      const normalized = word.trim().toLowerCase();
      if (normalized.length >= 2 && /^[a-záàâäéèêëîïôùûüçœæ'-]+$/i.test(normalized)) {
        await db.runAsync('INSERT OR IGNORE INTO mots (mot) VALUES (?)', [normalized]);
        imported++;
      }
    }
    await db.runAsync(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('last_import', ?)",
      [new Date().toISOString()]
    );
  });

  return imported;
}

export async function isDictionaryReady(): Promise<boolean> {
  const db = await getDatabase();
  const meta = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM meta WHERE key = 'last_import'"
  );
  if (!meta) return false;

  const count = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM mots');
  return (count?.n ?? 0) > 0;
}

export async function getDictionarySize(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM mots');
  return result?.n ?? 0;
}

/** Return up to `limit` words containing the given syllable */
export async function getWordsForSyllable(syllable: string, limit = 8): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ mot: string }>(
    `SELECT mot FROM mots WHERE mot LIKE ? ORDER BY LENGTH(mot) ASC LIMIT ?`,
    [`%${syllable.toLowerCase()}%`, limit]
  );
  return rows.map(r => r.mot);
}
