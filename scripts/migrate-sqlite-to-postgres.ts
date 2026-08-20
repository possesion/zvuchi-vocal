/**
 * SQLite → PostgreSQL Migration Script
 *
 * Переносит все данные из data/wiki.db в PostgreSQL.
 * Запуск: npx tsx scripts/migrate-sqlite-to-postgres.ts
 *
 * Перед запуском:
 *  1. Убедитесь, что POSTGRES_URL задан в переменных окружения.
 *  2. Выполните `prisma migrate deploy` на PostgreSQL-базе, чтобы схема была актуальной.
 *  3. Убедитесь, что data/wiki.db существует.
 *
 * Конфликты типов данных SQLite → PostgreSQL:
 *  - DATETIME  → TIMESTAMP WITH TIME ZONE  (ISO-строки конвертируются явно)
 *  - BOOLEAN   → BOOLEAN  (SQLite хранит 0/1, приводим к true/false)
 *  - INTEGER   → INT / SERIAL  (совместимы)
 *  - TEXT      → TEXT  (совместимы)
 *  - TEXT JSON → TEXT JSON  (Prisma хранит массивы как строки — оставляем как есть)
 *  - MentorLevel enum  → PostgreSQL enum  (значения 'expert' | 'master' — совместимы)
 *  - NULL в level  → default 'expert'  (в SQLite поле было добавлено без NOT NULL)
 */

import Database from 'better-sqlite3';
import { Client } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Config ───────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQLITE_PATH = path.resolve(__dirname, '../data/wiki.db');
const POSTGRES_URL = 'postgresql://zvuchi:s1003067@localhost:5433/zvuchi_vocal'; // process.env.POSTGRES_URL || process.env.DATABASE_URL;
console.log('HEHEHEHE ', POSTGRES_URL);
if (!POSTGRES_URL || POSTGRES_URL.startsWith('file:')) {
    console.error(
        '❌  Задайте POSTGRES_URL (или DATABASE_URL) в переменных окружения.\n' +
            '    Текущее значение DATABASE_URL указывает на SQLite, а не PostgreSQL.'
    );
    process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * SQLite хранит DATETIME как строку "YYYY-MM-DD HH:MM:SS" без timezone.
 * PostgreSQL ожидает ISO 8601 или объект Date.
 * Возвращаем null для пустых/невалидных значений.
 */
function toDate(value: unknown): Date | null {
    if (value == null || value === '') return null;
    const d = new Date(value as string);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * SQLite хранит BOOLEAN как 0/1 (INTEGER).
 * Приводим к настоящему boolean.
 */
function toBool(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    return value === 1 || value === '1' || value === 'true';
}

/**
 * MentorLevel: поле было добавлено ALTER TABLE без NOT NULL,
 * поэтому теоретически может быть NULL. Дефолт — 'expert'.
 */
function toMentorLevel(value: unknown): 'expert' | 'master' {
    if (value === 'master') return 'master';
    return 'expert'; // NULL и любые неизвестные значения → expert
}

async function runMigration(): Promise<void> {
    console.log('🔌  Подключаемся к SQLite:', SQLITE_PATH);
    const sqlite = new Database(SQLITE_PATH, { readonly: true });

    console.log('🔌  Подключаемся к PostgreSQL...');
    const pg = new Client({ connectionString: POSTGRES_URL });
    await pg.connect();

    try {
        // Проверяем, что схема уже накатана в PostgreSQL
        const tables = await pg.query<{ tablename: string }>(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
        );
        const existingTables = tables.rows.map((r) => r.tablename);
        const required = ['WikiCategory', 'WikiTerm', 'News', 'Short', 'Instructor', 'User', 'SmsLog', 'Program'];
        const missing = required.filter((t) => !existingTables.includes(t));
        if (missing.length > 0) {
            throw new Error(
                `В PostgreSQL отсутствуют таблицы: ${missing.join(', ')}.\n` +
                    'Запустите "npx prisma migrate deploy" перед миграцией данных.'
            );
        }

        // Миграция выполняется внутри одной транзакции — при ошибке откатится всё
        await pg.query('BEGIN');

        // ─── 1. WikiCategory ────────────────────────────────────────────────
        await migrateWikiCategory(sqlite, pg);

        // ─── 2. WikiTerm ────────────────────────────────────────────────────
        await migrateWikiTerm(sqlite, pg);

        // ─── 3. News ────────────────────────────────────────────────────────
        await migrateNews(sqlite, pg);

        // ─── 4. Short ───────────────────────────────────────────────────────
        await migrateShort(sqlite, pg);

        // ─── 5. Instructor ──────────────────────────────────────────────────
        await migrateInstructor(sqlite, pg);

        // ─── 6. User ────────────────────────────────────────────────────────
        await migrateUser(sqlite, pg);

        // ─── 7. SmsLog ──────────────────────────────────────────────────────
        await migrateSmsLog(sqlite, pg);

        // ─── 8. Program ─────────────────────────────────────────────────────
        await migrateProgram(sqlite, pg);

        // Обновляем SERIAL-последовательности, чтобы следующий INSERT не конфликтовал
        await resetSequences(pg);

        await pg.query('COMMIT');
        console.log('\n✅  Миграция завершена успешно!');
    } catch (err) {
        await pg.query('ROLLBACK');
        console.error('\n❌  Ошибка миграции, транзакция откатана:', err);
        process.exit(1);
    } finally {
        sqlite.close();
        await pg.end();
    }
}

// ─── Table migrators ──────────────────────────────────────────────────────────

async function migrateWikiCategory(sqlite: Database.Database, pg: Client): Promise<void> {
    const rows = sqlite.prepare('SELECT * FROM WikiCategory').all() as {
        id: string;
        label: string;
    }[];

    console.log(`\n📋  WikiCategory: ${rows.length} записей`);
    for (const row of rows) {
        await pg.query(
            `INSERT INTO "WikiCategory" (id, label)
             VALUES ($1, $2)
             ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label`,
            [row.id, row.label]
        );
    }
}

async function migrateWikiTerm(sqlite: Database.Database, pg: Client): Promise<void> {
    const rows = sqlite.prepare('SELECT * FROM WikiTerm').all() as {
        id: string;
        title: string;
        description: string;
        category: string;
        author: string;
        coverUrl: string;
        updatedAt: string;
    }[];

    console.log(`📋  WikiTerm: ${rows.length} записей`);
    for (const row of rows) {
        // SQLite хранит updatedAt как строку без timezone → конвертируем
        const updatedAt = toDate(row.updatedAt) ?? new Date();
        await pg.query(
            `INSERT INTO "WikiTerm" (id, title, description, category, author, "coverUrl", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               title       = EXCLUDED.title,
               description = EXCLUDED.description,
               category    = EXCLUDED.category,
               author      = EXCLUDED.author,
               "coverUrl"  = EXCLUDED."coverUrl",
               "updatedAt" = EXCLUDED."updatedAt"`,
            [row.id, row.title, row.description, row.category, row.author, row.coverUrl, updatedAt]
        );
    }
}

async function migrateNews(sqlite: Database.Database, pg: Client): Promise<void> {
    const rows = sqlite.prepare('SELECT * FROM News').all() as {
        id: number;
        title: string;
        summary: string;
        content: string;
        coverUrl: string;
        views: number;
        publishedAt: string;
    }[];

    console.log(`📋  News: ${rows.length} записей`);
    for (const row of rows) {
        const publishedAt = toDate(row.publishedAt) ?? new Date();
        await pg.query(
            `INSERT INTO "News" (id, title, summary, content, "coverUrl", views, "publishedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               title       = EXCLUDED.title,
               summary     = EXCLUDED.summary,
               content     = EXCLUDED.content,
               "coverUrl"  = EXCLUDED."coverUrl",
               views       = EXCLUDED.views,
               "publishedAt" = EXCLUDED."publishedAt"`,
            [row.id, row.title, row.summary, row.content, row.coverUrl, row.views, publishedAt]
        );
    }
}

async function migrateShort(sqlite: Database.Database, pg: Client): Promise<void> {
    const rows = sqlite.prepare('SELECT * FROM Short').all() as {
        id: number;
        url: string;
        createdAt: string;
    }[];

    console.log(`📋  Short: ${rows.length} записей`);
    for (const row of rows) {
        const createdAt = toDate(row.createdAt) ?? new Date();
        await pg.query(
            `INSERT INTO "Short" (id, url, "createdAt")
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET
               url       = EXCLUDED.url,
               "createdAt" = EXCLUDED."createdAt"`,
            [row.id, row.url, createdAt]
        );
    }
}

async function migrateInstructor(sqlite: Database.Database, pg: Client): Promise<void> {
    const rows = sqlite.prepare('SELECT * FROM Instructor').all() as {
        id: number;
        name: string;
        specialty: string;
        feature: string;
        experience: string;
        bio: string;
        image: string;
        video: string;
        slug: string;
        presentationVideo: string;
        performanceVideos: string;
        techniques: string;
        level: string | null;
        sortOrder: number;
    }[];

    console.log(`📋  Instructor: ${rows.length} записей`);

    // Предупреждаем о записях с NULL level
    const nullLevels = rows.filter((r) => r.level == null);
    if (nullLevels.length > 0) {
        console.warn(
            `  ⚠️  ${nullLevels.length} инструктор(ов) имеют NULL в поле level → будет установлено 'expert'`
        );
    }

    for (const row of rows) {
        const level = toMentorLevel(row.level);
        await pg.query(
            `INSERT INTO "Instructor" (id, name, specialty, feature, experience, bio, image, video,
               slug, "presentationVideo", "performanceVideos", techniques, level, "sortOrder")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::\"MentorLevel\",$14)
             ON CONFLICT (id) DO UPDATE SET
               name               = EXCLUDED.name,
               specialty          = EXCLUDED.specialty,
               feature            = EXCLUDED.feature,
               experience         = EXCLUDED.experience,
               bio                = EXCLUDED.bio,
               image              = EXCLUDED.image,
               video              = EXCLUDED.video,
               slug               = EXCLUDED.slug,
               "presentationVideo" = EXCLUDED."presentationVideo",
               "performanceVideos" = EXCLUDED."performanceVideos",
               techniques         = EXCLUDED.techniques,
               level              = EXCLUDED.level,
               "sortOrder"        = EXCLUDED."sortOrder"`,
            [
                row.id, row.name, row.specialty, row.feature, row.experience,
                row.bio, row.image, row.video, row.slug, row.presentationVideo,
                row.performanceVideos, row.techniques, level, row.sortOrder,
            ]
        );
    }
}

async function migrateUser(sqlite: Database.Database, pg: Client): Promise<void> {
    const rows = sqlite.prepare('SELECT * FROM User').all() as {
        id: number;
        email: string;
        passwordHash: string;
        name: string | null;
        phone: string | null;
        phoneVerified: number | boolean;
        phoneVerifyCode: string | null;
        phoneCodeExpires: string | null;
        role: string;
        emailVerified: number | boolean;
        verificationToken: string | null;
        tokenExpiresAt: string | null;
        resetToken: string | null;
        resetTokenExpires: string | null;
        createdAt: string;
    }[];

    console.log(`📋  User: ${rows.length} записей`);
    for (const row of rows) {
        // SQLite хранит BOOLEAN как 0/1 — явно приводим
        const emailVerified = toBool(row.emailVerified);
        const phoneVerified = toBool(row.phoneVerified);

        await pg.query(
            `INSERT INTO "User" (id, email, "passwordHash", name, phone,
               "phoneVerified", "phoneVerifyCode", "phoneCodeExpires",
               role, "emailVerified", "verificationToken", "tokenExpiresAt",
               "resetToken", "resetTokenExpires", "createdAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
             ON CONFLICT (id) DO UPDATE SET
               email             = EXCLUDED.email,
               "passwordHash"    = EXCLUDED."passwordHash",
               name              = EXCLUDED.name,
               phone             = EXCLUDED.phone,
               "phoneVerified"   = EXCLUDED."phoneVerified",
               "phoneVerifyCode" = EXCLUDED."phoneVerifyCode",
               "phoneCodeExpires" = EXCLUDED."phoneCodeExpires",
               role              = EXCLUDED.role,
               "emailVerified"   = EXCLUDED."emailVerified",
               "verificationToken" = EXCLUDED."verificationToken",
               "tokenExpiresAt"  = EXCLUDED."tokenExpiresAt",
               "resetToken"      = EXCLUDED."resetToken",
               "resetTokenExpires" = EXCLUDED."resetTokenExpires",
               "createdAt"       = EXCLUDED."createdAt"`,
            [
                row.id, row.email, row.passwordHash, row.name ?? null, row.phone ?? null,
                phoneVerified, row.phoneVerifyCode ?? null, toDate(row.phoneCodeExpires),
                row.role, emailVerified, row.verificationToken ?? null, toDate(row.tokenExpiresAt),
                row.resetToken ?? null, toDate(row.resetTokenExpires), toDate(row.createdAt) ?? new Date(),
            ]
        );
    }
}

async function migrateSmsLog(sqlite: Database.Database, pg: Client): Promise<void> {
    const rows = sqlite.prepare('SELECT * FROM SmsLog').all() as {
        id: number;
        phone: string;
        ip: string | null;
        userId: number | null;
        createdAt: string;
    }[];

    console.log(`📋  SmsLog: ${rows.length} записей`);
    for (const row of rows) {
        const createdAt = toDate(row.createdAt) ?? new Date();
        await pg.query(
            `INSERT INTO "SmsLog" (id, phone, ip, "userId", "createdAt")
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET
               phone     = EXCLUDED.phone,
               ip        = EXCLUDED.ip,
               "userId"  = EXCLUDED."userId",
               "createdAt" = EXCLUDED."createdAt"`,
            [row.id, row.phone, row.ip ?? null, row.userId ?? null, createdAt]
        );
    }
}

async function migrateProgram(sqlite: Database.Database, pg: Client): Promise<void> {
    const rows = sqlite.prepare('SELECT * FROM Program').all() as {
        id: number;
        slug: string;
        title: string;
        shortDescription: string;
        fullDescription: string;
        packages: string;
        lessonDuration: number;
        programDuration: number;
        features: string;
        isPopular: number | boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    }[];

    console.log(`📋  Program: ${rows.length} записей`);
    for (const row of rows) {
        // SQLite хранит isPopular как 0/1 (INTEGER — без настоящего BOOLEAN)
        const isPopular = toBool(row.isPopular);
        const createdAt = toDate(row.createdAt) ?? new Date();
        const updatedAt = toDate(row.updatedAt) ?? new Date();

        await pg.query(
            `INSERT INTO "Program" (id, slug, title, "shortDescription", "fullDescription",
               packages, "lessonDuration", "programDuration", features,
               "isPopular", "sortOrder", "createdAt", "updatedAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
             ON CONFLICT (id) DO UPDATE SET
               slug             = EXCLUDED.slug,
               title            = EXCLUDED.title,
               "shortDescription" = EXCLUDED."shortDescription",
               "fullDescription"  = EXCLUDED."fullDescription",
               packages         = EXCLUDED.packages,
               "lessonDuration" = EXCLUDED."lessonDuration",
               "programDuration" = EXCLUDED."programDuration",
               features         = EXCLUDED.features,
               "isPopular"      = EXCLUDED."isPopular",
               "sortOrder"      = EXCLUDED."sortOrder",
               "createdAt"      = EXCLUDED."createdAt",
               "updatedAt"      = EXCLUDED."updatedAt"`,
            [
                row.id, row.slug, row.title, row.shortDescription, row.fullDescription,
                row.packages, row.lessonDuration, row.programDuration, row.features,
                isPopular, row.sortOrder, createdAt, updatedAt,
            ]
        );
    }
}

/**
 * После вставки данных с явными ID нужно сбросить SERIAL-последовательности,
 * чтобы следующий автоинкремент не конфликтовал с уже существующими ID.
 */
async function resetSequences(pg: Client): Promise<void> {
    console.log('\n🔄  Сбрасываем SERIAL-последовательности...');
    const serialTables: Array<[string, string]> = [
        ['News',       'id'],
        ['Short',      'id'],
        ['Instructor', 'id'],
        ['User',       'id'],
        ['SmsLog',     'id'],
        ['Program',    'id'],
    ];

    for (const [table, col] of serialTables) {
        await pg.query(
            `SELECT setval(
               pg_get_serial_sequence('"${table}"', '${col}'),
               COALESCE((SELECT MAX("${col}") FROM "${table}"), 0) + 1,
               false
             )`
        );
        console.log(`  ✓  ${table}.${col} sequence обновлена`);
    }
}

// ─── Entry point ──────────────────────────────────────────────────────────────
runMigration();
