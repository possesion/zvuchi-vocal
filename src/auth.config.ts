/**
 * Конфигурация Auth.js без Node.js зависимостей — безопасна для Edge Runtime.
 * Используется в middleware.ts.
 * Credentials provider с логикой БД вынесен в src/auth.ts (только Node.js runtime).
 */
import type { NextAuthConfig } from 'next-auth'
import { UserRole } from './lib/types'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            phone?: string | null
            role: UserRole
        }
    }
    interface User {
        id?: string
        email?: string | null
        name?: string | null
        phone?: string | null
        emailVerified?: boolean
        role: UserRole
    }
}

export const authConfig: NextAuthConfig = {
    session: {
        strategy: 'jwt',
        maxAge: 60 * 60 * 24, // 1 день по умолчанию (без "запомнить меня")
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    providers: [],
    trustHost: true,
    callbacks: {
        // jwt намеренно не определён здесь — вся логика в src/auth.ts
        session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.name = token.name as string | null
                session.user.phone = token.phone as string | null
                session.user.role = token.role as UserRole
            }
            return session
        },
        authorized({ auth }) {
            // Базовая проверка — детальная логика в middleware.ts
            return !!auth
        },
    },
}
