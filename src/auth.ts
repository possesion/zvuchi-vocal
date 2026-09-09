/**
 * Полная конфигурация Auth.js с Credentials и Google провайдерами.
 * Использует Node.js модули (db.ts, bcryptjs) — только для Node.js runtime.
 * НЕ импортировать в middleware.ts напрямую.
 */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import YandexProvider from 'next-auth/providers/yandex'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser, updateUser } from '@/lib/db-prisma'
import { authConfig } from '@/auth.config'
import { UserRole } from './lib/types'
import {
    isOAuthSyncProvider,
    mergeOAuthProfileIntoUser,
    extractYandexProviderData,
    extractGooglePrimaryPhone,
    resolveTokenImage,
    type OAuthProfileData,
} from './lib/oauth-sync'
import { fetchGooglePhoneNumbers } from './lib/google-people'

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
            // Вход через Google/Yandex: синхронизация телефона и аватара
            if (isOAuthSyncProvider(account?.provider) && user?.email) {
                let dbUser = await getUserByEmail(user.email)

                // Best-effort Google phone lookup — только когда результат
                // реально пригодится (телефон ещё не заполнен).
                let googlePhone: string | null = null
                if (account?.provider === 'google' && account.access_token && !dbUser?.phone) {
                    const phoneNumbers = await fetchGooglePhoneNumbers(account.access_token)
                    googlePhone = extractGooglePrimaryPhone(phoneNumbers)
                }

                const incoming: OAuthProfileData = {
                    phone:
                        account?.provider === 'yandex'
                            ? (user as { phoneNumber?: string | null }).phoneNumber ?? null
                            : googlePhone,
                    avatarUrl: user.image ?? null,
                }

                if (!dbUser) {
                    // Генерируем невалидный хеш — bcrypt никогда не подберёт к нему пароль.
                    // Формат bcrypt требует '$2b$' + cost + 53 символа соли/хеша.
                    // Строка ниже намеренно не является валидным bcrypt-хешем.
                    const unusableHash = `${account?.provider}:${crypto.randomUUID()}`
                    dbUser = await createUser({
                        email: user.email,
                        phone: incoming.phone,
                        avatarUrl: incoming.avatarUrl,
                        passwordHash: unusableHash,
                        role: 'client',
                    })
                    await updateUser(dbUser.id, { emailVerified: true })
                } else {
                    const { phoneChanged, avatarChanged, phone, avatarUrl } = mergeOAuthProfileIntoUser(
                        { phone: dbUser.phone, avatarUrl: dbUser.avatarUrl },
                        incoming
                    )
                    if (phoneChanged || avatarChanged) {
                        await updateUser(dbUser.id, {
                            ...(phoneChanged && { phone, phoneVerified: true }),
                            ...(avatarChanged && { avatarUrl }),
                        })
                    }
                    dbUser = { ...dbUser, phone, avatarUrl }
                }

                token.id = String(dbUser.id)
                token.name = dbUser.name
                token.phone = dbUser.phone
                token.image = resolveTokenImage(dbUser.avatarUrl)
                token.emailVerified = dbUser.emailVerified
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
                token.image = resolveTokenImage(user.image)
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
        YandexProvider({
            clientId: process.env.YANDEX_CLIENT_ID,
            clientSecret: process.env.YANDEX_CLIENT_SECRET,
            /** @see [Data access](https://yandex.com/dev/id/doc/en/register-client#access) */
            authorization: "https://oauth.yandex.ru/authorize?scope=login:info+login:email+login:avatar+login:default_phone",
            // authorization: {
            //     params: {
            //         scope: 'login:info login:email login:avatar login:default_phone',
            //     },
            // },
            profile(profile) {
                const { phone, avatarUrl } = extractYandexProviderData(profile)
                return {
                    id: profile.id,
                    name: profile.display_name ?? profile.real_name ?? profile.first_name,
                    email: profile.default_email ?? profile.emails?.[0] ?? null,
                    image: avatarUrl,
                    phoneNumber: phone,
                    role: 'client' as UserRole,
                }
            },
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
                if (!user.passwordHash || user.passwordHash.startsWith('google:')) {
                    throw new Error('UseGoogle')
                }

                const passwordMatch = await bcrypt.compare(password, user.passwordHash)
                if (!passwordMatch) return null

                if (!user.emailVerified) {
                    throw new Error('EmailNotVerified')
                }

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    image: user.avatarUrl,
                    emailVerified: user.emailVerified,
                    role: user.role as UserRole,
                }
            },
        }),
    ],
})
