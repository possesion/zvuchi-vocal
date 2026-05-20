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
            role: UserRole
        }
    }
    interface User {
        id?: string
        email?: string | null
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
        jwt({ token, user }) {
            if (user) {
                token.id = user.id as string
                token.role = user.role as UserRole
            }
            return token
        },
        session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
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
