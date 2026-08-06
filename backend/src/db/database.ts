import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
let db: Database;

export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      month TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      rule_id TEXT
    );

    CREATE TABLE IF NOT EXISTS allocation_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      percent REAL NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      default_category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      UNIQUE(month, type, category)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  saveDb();
  seedData();
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const results = queryAll<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export function execute(sql: string, params: any[] = []) {
  db.run(sql, params);
  saveDb();
}

function seedData() {
  // Seed default currency setting if missing
  const currencyRow = queryOne('SELECT * FROM settings WHERE key = ?', ['currency']);
  if (!currencyRow) {
    execute(
      'INSERT INTO settings (key, value) VALUES (?, ?)',
      ['currency', JSON.stringify({ id: 'USD', symbol: '$', name: 'Dólar US ($)', code: 'USD' })]
    );
  }

  // Seed essential starter rules (Diezmo 10% and Ahorro 15%) without fake transactions
  const rulesCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM allocation_rules');
  if (!rulesCount || rulesCount.count === 0) {
    execute(
      'INSERT INTO allocation_rules (id, name, percent, color, icon, default_category) VALUES (?, ?, ?, ?, ?, ?)',
      ['rule-tithe', 'Diezmo / Fidelidad', 10, '#a855f7', '⛪', 'Diezmo / Donaciones']
    );
    execute(
      'INSERT INTO allocation_rules (id, name, percent, color, icon, default_category) VALUES (?, ?, ?, ?, ?, ?)',
      ['rule-savings', 'Ahorro Principal', 15, '#059669', '🏦', 'Ahorro / Inversión']
    );
  }
}
