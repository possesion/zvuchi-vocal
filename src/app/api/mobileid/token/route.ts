import { NextRequest, NextResponse } from 'next/server';
import { getMobileIDToken } from '@/lib/mobileid';
import { auth } from '@/auth';

/**
 * POST /api/mobileid/token
 * Endpoint для получения токена MobileID SDK
 * SDK отправляет { fingerprint_hash: string }
 * Возвращает { token: string }
 */
export async function POST(request: NextRequest) {
    try {
        // Проверяем авторизацию пользователя
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Получаем fingerprint_hash из тела запроса
        const body = await request.json();
        const { fingerprint_hash } = body;

        if (!fingerprint_hash) {
            return NextResponse.json(
                { error: 'fingerprint_hash is required' },
                { status: 400 }
            );
        }

        // Получаем токен от MobileID API
        const result = await getMobileIDToken(fingerprint_hash);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({ token: result.token });
    } catch (error) {
        console.error('MobileID token endpoint error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
