import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_API_PATHS = [
    '/api/v1/concert-photos',
    '/api/v1/wiki',
    '/api/v1/shorts',
    '/api/v1/news',
    '/api/v1/instructors',
]

function isProtectedMutation(req: NextRequest): boolean {
    const { pathname } = req.nextUrl
    const method = req.method
    if (method === 'GET') return false
    return PROTECTED_API_PATHS.some((p) => pathname.startsWith(p))
}

export function middleware(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value

    // Прокидываем токен из куки в заголовок для серверных компонентов
    if (token) {
        const headers = new Headers(req.headers)
        headers.set('Authorization', token)
        const res = NextResponse.next({ request: { headers } })

        // Защита мутирующих API-запросов
        if (isProtectedMutation(req) && token !== process.env.ADMIN_TOKEN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return res
    }

    // Нет куки — блокируем защищённые мутации
    if (isProtectedMutation(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
