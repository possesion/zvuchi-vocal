import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'wiki.db');

let db: Database.Database;

function getDb(): Database.Database {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.exec(`
            CREATE TABLE IF NOT EXISTS wiki_terms (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        `);
    }
    return db;
}

export interface WikiTermRow {
    id: string;
    title: string;
    description: string;
    category: string;
    updated_at: string;
}

export function getTermOverride(id: string): WikiTermRow | undefined {
    return getDb()
        .prepare('SELECT * FROM wiki_terms WHERE id = ?')
        .get(id) as WikiTermRow | undefined;
}

export function upsertTerm(term: Omit<WikiTermRow, 'updated_at'>): WikiTermRow {
    getDb()
        .prepare(`
            INSERT INTO wiki_terms (id, title, description, category, updated_at)
            VALUES (@id, @title, @description, @category, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                category = excluded.category,
                updated_at = excluded.updated_at
        `)
        .run(term);

    return getDb()
        .prepare('SELECT * FROM wiki_terms WHERE id = ?')
        .get(term.id) as WikiTermRow;
}
