/**
 * Полная конфигурация Auth.js с Credentials provider.
 * Использует Node.js модули (db.ts, bcryptjs) — только для Node.js runtime.
 * НЕ импортировать в middleware.ts напрямую.
 */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db-prisma'
import { authConfig } from '@/auth.config'
import { UserRole } from './lib/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = credentials?.email as string | undefined
                const password = credentials?.password as string | undefined

                if (!email || !password) {
                    console.error('[auth] Missing email or password')
                    return null
                }

                const user = await getUserByEmail(email)
                if (!user) {
                    console.error('[auth] User not found:', email)
                    return null
                }

                const passwordMatch = await bcrypt.compare(password, user.password_hash)
                if (!passwordMatch) {
                    console.error('[auth] Password mismatch for:', email)
                    return null
                }

                if (user.email_verified !== 1) {
                    console.error('[auth] Email not verified for:', email)
                    throw new Error('EmailNotVerified')
                }

                console.info('[auth] Login success:', email, 'role:', user.role)
                return {
                    id: String(user.id),
                    email: user.email,
                    role: user.role as UserRole,
                }
            },
        }),
    ],
})
