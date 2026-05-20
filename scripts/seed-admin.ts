/**
 * Скрипт для создания/обновления admin-пользователя в БД.
 * Запуск: npx tsx --env-file=.env.local scripts/seed-admin.ts
 */
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'wiki.db')
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
    console.error('❌ ADMIN_EMAIL и ADMIN_PASSWORD должны быть заданы')
    console.error('   Запуск: npx tsx --env-file=.env.local scripts/seed-admin.ts')
    process.exit(1)
}

const db = new Database(DB_PATH)

// Создаём таблицу если не существует
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
    )
`)

const hash = bcrypt.hashSync(password, 12)

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)

if (existing) {
    db.prepare("UPDATE users SET password_hash = ?, role = 'admin', email_verified = 1 WHERE email = ?")
        .run(hash, email)
    console.log(`✅ Admin обновлён: ${email}`)
} else {
    db.prepare("INSERT INTO users (email, password_hash, role, email_verified) VALUES (?, ?, 'admin', 1)")
        .run(email, hash)
    console.log(`✅ Admin создан: ${email}`)
}

db.close()
