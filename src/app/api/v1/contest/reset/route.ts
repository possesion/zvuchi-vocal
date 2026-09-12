import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/roles';
import { resetContestVotes } from '@/lib/db-prisma';
import type { ApiResponse } from '@/types/api';

/**
 * POST /api/v1/contest/reset
 * Обнуляет результаты голосования конкурса: удаляет все записи ContestVote.
 * Участники (Contestant) не затрагиваются. Доступно только Admin_User.
 */
export async function POST(): Promise<NextResponse<ApiResponse<{ deleted: number }>>> {
    const session = await auth();
    if (!isAdmin(session?.user?.role)) {
        return NextResponse.json(
            { success: false, error: 'Forbidden', timestamp: new Date() },
            { status: 403 }
        );
    }

    try {
        const deleted = await resetContestVotes();
        console.log('[Contest] Результаты голосования обнулены, удалено голосов:', deleted);
        revalidatePath('/contest');
        revalidatePath('/contest/result');

        return NextResponse.json({ success: true, data: { deleted }, timestamp: new Date() });
    } catch (error) {
        console.error('[Contest] Ошибка обнуления результатов голосования:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', timestamp: new Date() },
            { status: 500 }
        );
    }
}
