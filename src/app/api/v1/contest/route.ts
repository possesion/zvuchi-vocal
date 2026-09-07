import { NextResponse } from 'next/server';
import { getContestResults } from '@/lib/db-prisma';
import type { ApiResponse } from '@/types/api';
import type { ContestResult } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<ContestResult[]>>> {
    try {
        const results = await getContestResults();
        return NextResponse.json({ success: true, data: results, timestamp: new Date() });
    } catch (error) {
        console.error('[Contest] Ошибка загрузки результатов голосования:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', timestamp: new Date() },
            { status: 500 }
        );
    }
}
