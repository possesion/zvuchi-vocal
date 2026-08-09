import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'
import { canEdit, isAdmin } from '@/lib/roles'
import { UserRole } from './lib/types'

const { auth } = NextAuth(authConfig)

const ADMIN_ONLY_PATHS = ['/users']
const PROTECTED_PATHS = ['/users', '/profile']

function isProtectedPath(pathname: string): boolean {
    return PROTECTED_PATHS.some((p) => pathname.startsWith(p))
}

function isAdminOnlyPath(pathname: string): boolean {
    return ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))
}

const proxyHandler = auth((req) => {
    const { pathname } = req.nextUrl
    const session = req.auth
    const role = session?.user?.role as UserRole | undefined

    // Редирект неаутентифицированных на /login для защищённых маршрутов
    if (isProtectedPath(pathname) && !session) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Блокируем API мутации для пользователей без прав редактора
    if (pathname.startsWith('/api/v1') && req.method !== 'GET' && !canEdit(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Редирект не-admin с admin-маршрутов на главную
    if (isAdminOnlyPath(pathname) && !isAdmin(role)) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
})

// Named export as 'proxy' (Next.js 16 requirement)
export const proxy = proxyHandler

// Default export for backwards compatibility
export default proxyHandler

export const config = {
    matcher: [
        '/wiki/:path*/edit',
        '/users/:path*',
        '/api/v1/:path*',
        '/profile/:path*',
        '/profile',
        '/calculations',
    ],
}
