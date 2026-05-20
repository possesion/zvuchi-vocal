import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createSlug } from '@/app/api/v1/utils';
import { WikiCategoryRow, WikiTermRow, NewsRow, InstructorRow, InstructorDbRow, UserRow, UserRole } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'wiki.db');

let db: Database.Database;

const SEED_TERMS = [
    { id: 'evt', title: 'Estill Voice Training – EVT', category: 'method', description: 'Усовершенствованная система обучения вокалу, разработанная американским педагогом и голосовым экспертом Джо Эстилл. Этот метод основан на глубоких знаниях анатомии и физиологии голосообразования, что позволяет каждому ученику понять, как правильно управлять своим голосом. EVT помогает раскрыть истинный потенциал вашего вокала, научиться управлять им с максимальной эффективностью и при этом сохранять здоровье голосовых складок.' },
    { id: 'vocal-attack', title: 'Типы атак', category: 'concept', description: '• Мягкая атака (Attacked/Even onset): Складки смыкаются одновременно с началом выдоха, создавая сбалансированное, плавное звучание.\n• Твердая атака (Glottal onset/Hard): Голосовые складки плотно смыкаются до начала выдоха, создавая энергичное, точное начало звука.\n• Придыхательная атака (Breathy/Aspirate): Воздух начинает идти до смыкания складок, что создает придыхательный, мягкий звук (субтон).' },
    { id: 'belting', title: 'Бэлтинг – Belting', category: 'technique', description: 'Контролируемая техника пения на высоких нотах, сочетающая громкий, «кричащий» звук с плотным смыканием голосовых связок, высоким уровнем твэнга и приподнятой гортанью. Это «речевой» звук на верхнем регистре, требующий высокого давления, сильной опоры и активного использования грудного резонатора для создания мощного, яркого тембра без вреда для связок.' },
    { id: 'break', title: 'Брейк – Vocal break', category: 'technique', description: 'Это неуправляемый переход между регистрами (обычно грудным и фальцетом), вызванный резким изменением натяжения голосовых складок и работы резонаторов.' },
    { id: 'copmressed-mixed-vocal', title: 'Скомпрессированный микст – Compressed mixed Voice', category: 'technique', description: 'Это вокальный прием, сочетающий высокую позицию (головное звучание) с плотным смыканием голосовых складок, достигаемым за счет компрессии (увеличения подсвязочного давления). Этот метод обеспечивает мощный, яркий звук, напоминающий бэлтинг, но с безопасным, управляемым поведением связок.' },
    { id: 'cry', title: 'Край – Cry', category: 'technique', description: 'Это безопасный способ добавить эмоциональную окраску, мягкость и "глубину" голосу. Она основана на легком опускании гортани, создании мягкой атаки и формировании "плаксивого", но управляемого звука, что часто используется для создания интимности в пении.' },
    { id: 'drive', title: 'Драйв – Drive', category: 'technique', description: 'Это контролируемое добавление «шума» к основному тону за счет сужения надгортанника и ложных связок, обеспечивающее безопасный перегруз. Техника основана на управлении 13 структурами аппарата (особенно твангом) для защиты истинных связок при высокой громкости и интенсивности.' },
    { id: 'falsetto', title: 'Фальцет – Falsetto', category: 'technique', description: 'Это контролируемое вокальное качество, при котором вибрируют только края голосовых связок, создавая легкий, высокий звук. Оно достигается за счет высокого положения гортани, небольшого смыкания складок и специфического тванга (сужения надгортанного сфинктера).' },
    { id: 'fry', title: 'Фрай – Fry', category: 'technique', description: 'Это низкочастотный, скрипучий звук, возникающий при максимальном расслаблении голосовых складок. В EVT-системе он используется как безопасный приём для тренировки смыкания, снятия напряжения и добавления стилистической окраски («хрипцы»), обеспечивая здоровое функционирование гортани.' },
    { id: 'mixed-vocal', title: 'Микст – Mixed voice', category: 'technique', description: 'Осознанное управление структурами для смешивания грудного и головного звучания, создающее ровный переход между регистрами (M1/M2). Техника основана на точном контроле смыкания связок, позиции гортани и тванга, что обеспечивает безопасное пение высоких нот с мощным тембром.' },
    { id: 'rattle', title: 'Рэтл – Rattle', category: 'technique', description: 'Это безопасное создание хриплого, «скрипучего» звука за счет контролируемого управления черпало-надгортанным сфинктером, гортанью и дыханием. Техника изолирует компоненты вокального аппарата, позволяя добавлять экстремальные эффекты (дисторшн, скрим) без повреждения связок, используя специальные упражнения (фигуры) для настройки.' },
    { id: 'ring', title: 'Ринг – Ring', category: 'technique', description: 'Это создание яркого, пробивного звука путем фокусировки резонанса в верхних отделах лица (носовые пазухи, лобная область). Она достигается за счет точного управления вокальными структурами, включая оральный тванг, что придает голосу объем, звонкость и мощь без перенапряжения.' },
    { id: 'twang', title: 'Твэнг – Twang', category: 'technique', description: 'Техника создания яркого, звонкого звука путем сужения черпало-надгортанной воронки (сфинктера надгортанных складок), расположенной над голосовыми связками. Он обеспечивает высокую резонансную эффективность, облегчает пение высоких нот, добавляет объем без напряжения и является фундаментальным элементом современного вокала.' },
    { id: 'vocal-run', title: 'Мелизматика – Vocal run', category: 'technique', description: 'Техничный навык, требующий точного контроля над структурами гортани, голосовыми складками и дыханием для исполнения нескольких нот на один слог. EVT тренирует скорость переключения между регистрами (смыканием) и высокую подвижность гортани.' },
];

function getDb(): Database.Database {
    if (!db) {
        // Ensure data directory exists
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.exec(`
            CREATE TABLE IF NOT EXISTS shorts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                summary TEXT NOT NULL,
                content TEXT NOT NULL,
                cover_url TEXT NOT NULL DEFAULT '',
                views INTEGER NOT NULL DEFAULT 0,
                published_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS instructors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                specialty TEXT NOT NULL DEFAULT '',
                feature TEXT NOT NULL DEFAULT '',
                experience TEXT NOT NULL DEFAULT '',
                bio TEXT NOT NULL DEFAULT '',
                image TEXT NOT NULL DEFAULT '',
                video TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS wiki_categories (
                id TEXT PRIMARY KEY,
                label TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS wiki_terms (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                author TEXT NOT NULL DEFAULT '',
                cover_url TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        `);

        // Seed categories
        const insertCat = db.prepare('INSERT OR IGNORE INTO wiki_categories (id, label) VALUES (?, ?)');
        db.transaction(() => {
            insertCat.run('technique', 'Техника');
            insertCat.run('method', 'Методика');
            insertCat.run('concept', 'Анатомия');
        })();

        // Migration: add cover_url if missing
        const cols = db.prepare('PRAGMA table_info(wiki_terms)').all() as { name: string }[];
        if (!cols.some((c) => c.name === 'cover_url')) {
            db.exec("ALTER TABLE wiki_terms ADD COLUMN cover_url TEXT NOT NULL DEFAULT ''");
        }

        // Migration: add views to news if missing
        const newsCols = db.prepare('PRAGMA table_info(news)').all() as { name: string }[];
        if (!newsCols.some((c) => c.name === 'views')) {
            db.exec('ALTER TABLE news ADD COLUMN views INTEGER NOT NULL DEFAULT 0');
        }

        // Migration: add new instructor fields if missing
        const instrCols = db.prepare('PRAGMA table_info(instructors)').all() as { name: string }[];
        if (!instrCols.some((c) => c.name === 'slug')) {
            db.exec("ALTER TABLE instructors ADD COLUMN slug TEXT NOT NULL DEFAULT ''");
        }
        if (!instrCols.some((c) => c.name === 'presentation_video')) {
            db.exec("ALTER TABLE instructors ADD COLUMN presentation_video TEXT NOT NULL DEFAULT ''");
        }
        if (!instrCols.some((c) => c.name === 'performance_videos')) {
            db.exec("ALTER TABLE instructors ADD COLUMN performance_videos TEXT NOT NULL DEFAULT '[]'");
        }
        if (!instrCols.some((c) => c.name === 'techniques')) {
            db.exec("ALTER TABLE instructors ADD COLUMN techniques TEXT NOT NULL DEFAULT '[]'");
        }

        // Backfill slugs for existing rows where slug is empty
        const slugRows = db.prepare("SELECT id, name FROM instructors WHERE slug = ''").all() as { id: number; name: string }[];
        if (slugRows.length > 0) {
            const updateSlug = db.prepare("UPDATE instructors SET slug = ? WHERE id = ?");
            db.transaction(() => {
                for (const row of slugRows) {
                    updateSlug.run(createSlug(row.name), row.id);
                }
            })();
        }

        // Migration: create users table
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                email              TEXT    NOT NULL UNIQUE,
                password_hash      TEXT    NOT NULL,
                role               TEXT    NOT NULL DEFAULT 'client',
                email_verified     INTEGER NOT NULL DEFAULT 0,
                verification_token TEXT,
                token_expires_at   TEXT,
                created_at         TEXT    NOT NULL DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
        `);

        // Seed admin user from env if table is empty
        const userCount = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
        if (userCount === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const bcrypt = require('bcryptjs') as typeof import('bcryptjs');
            const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);
            db.prepare(
                "INSERT OR IGNORE INTO users (email, password_hash, role, email_verified) VALUES (?, ?, 'admin', 1)"
            ).run(process.env.ADMIN_EMAIL, hash);
        }

        // Seed terms
        const insertTerm = db.prepare(
            'INSERT OR IGNORE INTO wiki_terms (id, title, description, category, author, updated_at) VALUES (@id, @title, @description, @category, \'\', datetime(\'now\'))'
        );
        db.transaction(() => {
            for (const term of SEED_TERMS) insertTerm.run(term);
        })();

    }
    return db;
}

export function getCategories(): WikiCategoryRow[] {
    return getDb()
        .prepare('SELECT * FROM wiki_categories ORDER BY id')
        .all() as WikiCategoryRow[];
}

export function getCategoryLabel(id: string): string {
    const row = getDb()
        .prepare('SELECT label FROM wiki_categories WHERE id = ?')
        .get(id) as { label: string } | undefined;
    return row?.label ?? id;
}

export function getAllTerms(): WikiTermRow[] {
    return getDb()
        .prepare('SELECT * FROM wiki_terms ORDER BY updated_at DESC')
        .all() as WikiTermRow[];
}

export function getTermById(id: string): WikiTermRow | undefined {
    return getDb()
        .prepare('SELECT * FROM wiki_terms WHERE id = ?')
        .get(id) as WikiTermRow | undefined;
}

export function upsertTerm(term: Omit<WikiTermRow, 'updated_at'>): WikiTermRow {
    getDb()
        .prepare(`
            INSERT INTO wiki_terms (id, title, description, category, author, cover_url, updated_at)
            VALUES (@id, @title, @description, @category, @author, @cover_url, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                category = excluded.category,
                author = excluded.author,
                cover_url = excluded.cover_url,
                updated_at = excluded.updated_at
        `)
        .run(term);
    return getTermById(term.id)!;
}

export function deleteTermById(id: string): void {
    getDb().prepare('DELETE FROM wiki_terms WHERE id = ?').run(id);
}

export function getShortsFromDb(): string[] {
    return (getDb()
        .prepare('SELECT url FROM shorts ORDER BY created_at DESC')
        .all() as { url: string }[])
        .map((r) => r.url);
}

export function addShortToDb(url: string): void {
    getDb().prepare('INSERT OR IGNORE INTO shorts (url) VALUES (?)').run(url);
}

export function deleteShortFromDb(url: string): void {
    getDb().prepare('DELETE FROM shorts WHERE url = ?').run(url);
}

export function getLatestNews(limit = 5): NewsRow[] {
    return getDb()
        .prepare('SELECT * FROM news ORDER BY published_at DESC LIMIT ?')
        .all(limit) as NewsRow[];
}

export function getNewsById(id: number): NewsRow | undefined {
    return getDb()
        .prepare('SELECT * FROM news WHERE id = ?')
        .get(id) as NewsRow | undefined;
}

export function createNews(news: Omit<NewsRow, 'id' | 'views'>): NewsRow {
    const result = getDb()
        .prepare('INSERT INTO news (title, summary, content, cover_url, views, published_at) VALUES (@title, @summary, @content, @cover_url, 0, @published_at)')
        .run(news);
    return getNewsById(result.lastInsertRowid as number)!;
}

export function updateNews(news: NewsRow): NewsRow {
    getDb()
        .prepare('UPDATE news SET title=@title, summary=@summary, content=@content, cover_url=@cover_url, published_at=@published_at WHERE id=@id')
        .run(news);
    return getNewsById(news.id)!;
}

export function deleteNews(id: number): void {
    getDb().prepare('DELETE FROM news WHERE id = ?').run(id);
}

export function incrementNewsViews(id: number): void {
    getDb().prepare('UPDATE news SET views = views + 1 WHERE id = ?').run(id);
}



/** Raw DB row before JSON parsing */

function parseInstructorRow(row: InstructorDbRow): InstructorRow {
    let performance_videos: string[] = [];
    let techniques: string[] = [];
    try { performance_videos = JSON.parse(row.performance_videos); } catch { performance_videos = []; }
    try { techniques = JSON.parse(row.techniques); } catch { techniques = []; }
    return { ...row, performance_videos, techniques };
}

export function getAllInstructors(): InstructorRow[] {
    return (getDb()
        .prepare('SELECT * FROM instructors ORDER BY sort_order ASC, id ASC')
        .all() as InstructorDbRow[])
        .map(parseInstructorRow);
}

export function getInstructorById(id: number): InstructorRow | undefined {
    const row = getDb()
        .prepare('SELECT * FROM instructors WHERE id = ?')
        .get(id) as InstructorDbRow | undefined;
    return row ? parseInstructorRow(row) : undefined;
}

export function getInstructorBySlug(slug: string): InstructorRow | undefined {
    const row = getDb()
        .prepare('SELECT * FROM instructors WHERE slug = ?')
        .get(slug) as InstructorDbRow | undefined;
    return row ? parseInstructorRow(row) : undefined;
}

export function createInstructor(data: Omit<InstructorRow, 'id'>): InstructorRow {
    const slug = data.slug || createSlug(data.name);
    const result = getDb()
        .prepare('INSERT INTO instructors (name, specialty, feature, experience, bio, image, video, sort_order, slug, presentation_video, performance_videos, techniques) VALUES (@name, @specialty, @feature, @experience, @bio, @image, @video, @sort_order, @slug, @presentation_video, @performance_videos, @techniques)')
        .run({
            ...data,
            slug,
            presentation_video: data.presentation_video ?? '',
            performance_videos: JSON.stringify(data.performance_videos ?? []),
            techniques: JSON.stringify(data.techniques ?? []),
        });
    return getInstructorById(result.lastInsertRowid as number)!;
}

export function updateInstructor(data: InstructorRow): InstructorRow {
    getDb()
        .prepare('UPDATE instructors SET name=@name, specialty=@specialty, feature=@feature, experience=@experience, bio=@bio, image=@image, video=@video, sort_order=@sort_order, slug=@slug, presentation_video=@presentation_video, performance_videos=@performance_videos, techniques=@techniques WHERE id=@id')
        .run({
            ...data,
            performance_videos: JSON.stringify(data.performance_videos ?? []),
            techniques: JSON.stringify(data.techniques ?? []),
        });
    return getInstructorById(data.id)!;
}

export function deleteInstructor(id: number): void {
    getDb().prepare('DELETE FROM instructors WHERE id = ?').run(id);
}

// ─── Users ───────────────────────────────────────────────────────────────────



export function getUserByEmail(email: string): UserRow | undefined {
    return getDb()
        .prepare('SELECT * FROM users WHERE email = ?')
        .get(email) as UserRow | undefined
}

export function getUserById(id: number): UserRow | undefined {
    return getDb()
        .prepare('SELECT * FROM users WHERE id = ?')
        .get(id) as UserRow | undefined
}

export function createUser(data: {
    email: string
    passwordHash: string
    role?: UserRole
    verificationToken?: string
    tokenExpiresAt?: string
}): UserRow {
    const result = getDb()
        .prepare(
            'INSERT INTO users (email, password_hash, role, email_verified, verification_token, token_expires_at) VALUES (@email, @passwordHash, @role, 0, @verificationToken, @tokenExpiresAt)'
        )
        .run({
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role ?? 'client',
            verificationToken: data.verificationToken ?? null,
            tokenExpiresAt: data.tokenExpiresAt ?? null,
        })
    return getUserById(result.lastInsertRowid as number)!
}

export function updateUser(
    id: number,
    data: Partial<Pick<UserRow, 'email_verified' | 'verification_token' | 'token_expires_at' | 'role' | 'password_hash'>>
): void {
    const fields = Object.keys(data) as (keyof typeof data)[]
    if (fields.length === 0) return
    const setClause = fields.map((f) => `${f} = @${f}`).join(', ')
    getDb()
        .prepare(`UPDATE users SET ${setClause} WHERE id = @id`)
        .run({ ...data, id })
}

export function deleteUser(id: number): void {
    getDb().prepare('DELETE FROM users WHERE id = ?').run(id)
}

export function getAllUsers(): UserRow[] {
    return getDb()
        .prepare('SELECT * FROM users ORDER BY created_at DESC')
        .all() as UserRow[]
}

export function getUserByVerificationToken(token: string): UserRow | undefined {
    return getDb()
        .prepare('SELECT * FROM users WHERE verification_token = ?')
        .get(token) as UserRow | undefined
}
