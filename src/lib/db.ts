import Database from 'better-sqlite3';
import path from 'path';

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
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.exec(`
            CREATE TABLE IF NOT EXISTS shorts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
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

export interface WikiTermRow {
    id: string;
    title: string;
    description: string;
    category: string;
    author: string;
    cover_url: string;
    updated_at: string;
}

export interface WikiCategoryRow {
    id: string;
    label: string;
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
