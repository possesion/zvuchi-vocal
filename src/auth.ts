/**
 * Полная конфигурация Auth.js с Credentials и Google провайдерами.
 * Использует Node.js модули (db.ts, bcryptjs) — только для Node.js runtime.
 * НЕ импортировать в middleware.ts напрямую.
 */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser, updateUser } from '@/lib/db-prisma'
import { authConfig } from '@/auth.config'
import { UserRole } from './lib/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    logger: {
        error(code, ...args) {
            // Подавляем ожидаемую ошибку при неверном пароле/логине
            if (String(code) === 'CredentialsSignin') return
            console.error('[auth][error]', code, ...args)
        },
        warn(code, ...args) {
            console.warn('[auth][warn]', code, ...args)
        },
    },
    callbacks: {
        // Единственное место для jwt — не дублируем в authConfig
        async jwt({ token, user, account }) {
            // Вход через Google: создаём пользователя в БД если его нет
            if (account?.provider === 'google' && user?.email) {
                let dbUser = await getUserByEmail(user.email)
                if (!dbUser) {
                    // Генерируем невалидный хеш — bcrypt никогда не подберёт к нему пароль.
                    // Формат bcrypt требует '$2b$' + cost + 53 символа соли/хеша.
                    // Строка ниже намеренно не является валидным bcrypt-хешем.
                    const unusableHash = `google:${crypto.randomUUID()}`
                    dbUser = await createUser({
                        email: user.email,
                        passwordHash: unusableHash,
                        role: 'client',
                    })
                    await updateUser(dbUser.id, { email_verified: 1 })
                }
                token.id = String(dbUser.id)
                token.name = dbUser.name
                token.phone = dbUser.phone
                token.emailVerified = dbUser.email_verified === 1
                token.role = dbUser.role as UserRole
                // Устанавливаем долгий срок жизни для Google OAuth (6 месяцев)
                // JWT токен автоматически обновится при активности
                return token
            }

            // Вход через credentials: user заполнен только при первом входе
            if (user) {
                token.id = user.id as string
                token.name = user.name
                token.phone = user.phone
                token.emailVerified = user.emailVerified
                token.role = user.role as UserRole
            }

            return token
        },
        // session и authorized берём из authConfig без изменений
        session: authConfig.callbacks!.session!,
        authorized: authConfig.callbacks!.authorized!,
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = credentials?.email as string | undefined
                const password = credentials?.password as string | undefined

                if (!email || !password) return null

                const user = await getUserByEmail(email)
                if (!user) return null

                // Google-пользователи имеют невалидный хеш с префиксом 'google:'
                if (!user.password_hash || user.password_hash.startsWith('google:')) {
                    throw new Error('UseGoogle')
                }

                const passwordMatch = await bcrypt.compare(password, user.password_hash)
                if (!passwordMatch) return null

                if (user.email_verified !== 1) {
                    throw new Error('EmailNotVerified')
                }

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    emailVerified: user.email_verified === 1,
                    role: user.role as UserRole,
                }
            },
        }),
    ],
})
