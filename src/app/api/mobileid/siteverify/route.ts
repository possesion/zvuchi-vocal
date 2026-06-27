import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileIDToken } from '@/lib/mobileid';
import { auth } from '@/auth';
import { getUserById, updateUser } from '@/lib/db-prisma';

/**
 * POST /api/mobileid/siteverify
 * Server-to-server верификация токена после успешной верификации на клиенте
 * SDK отправляет { session_id: string, verify_token: string | null }
 */
export async function POST(request: NextRequest) {
    try {
        // Проверяем авторизацию пользователя
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = parseInt(session.user.id);
        const user = await getUserById(userId);
        
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Получаем данные из запроса
        const body = await request.json();
        const { session_id, verify_token } = body;

        if (!session_id) {
            return NextResponse.json(
                { success: false, error: 'session_id is required' },
                { status: 400 }
            );
        }

        // Верифицируем токен на сервере MobileID
        const result = await verifyMobileIDToken(session_id, verify_token);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        // Подтверждаем телефон пользователя
        if (result.phone) {
            await updateUser(userId, {
                phone: `+${result.phone}`,
                phoneVerified: true,
                phoneVerifyCode: null,
                phoneCodeExpires: null,
            });
        }

        return NextResponse.json({ 
            success: true,
            phone: result.phone 
        });
    } catch (error) {
        console.error('MobileID siteverify endpoint error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
