import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    const res = NextResponse.next({
        request: {
            headers: new Headers(req.headers),
        },
    })

    if (token) {
        const headers = new Headers(req.headers)
        headers.set('Authorization', token)
        return NextResponse.next({ request: { headers } })
    }

    return res
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
