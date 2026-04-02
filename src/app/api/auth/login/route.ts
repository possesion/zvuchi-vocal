import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { login, password } = await req.json()

    if (login === 'valeria' && password === process.env.ZVUCHI_PASSWORD) {
        const res = NextResponse.json({ success: true })
        res.cookies.set('auth_token', 'Bearer zvuchi', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 дней
        })
        return res
    }

    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
}
