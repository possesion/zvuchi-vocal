import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canEdit } from '@/lib/roles';
import { createContestant } from '@/lib/db-prisma';
import { validateContestantFields } from '@/lib/contest-validation';
import type { ApiResponse } from '@/types/api';
import type { Contestant } from '@/lib/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Contestant>>> {
    const session = await auth();
    if (!canEdit(session?.user?.role)) {
        return NextResponse.json(
            { success: false, error: 'Forbidden', timestamp: new Date() },
            { status: 403 }
        );
    }

    const body = await req.json().catch(() => null);
    const validation = await validateContestantFields(body);
    if (!validation.valid) {
        return NextResponse.json(
            { success: false, error: validation.error, timestamp: new Date() },
            { status: 400 }
        );
    }

    const created = await createContestant({
        name: validation.data.name,
        song: validation.data.song,
        originalArtist: validation.data.originalArtist,
        photoUrl: '',
    });
    console.log('[Contest] Участник создан:', created.id);
    revalidatePath('/contest');

    return NextResponse.json({ success: true, data: created, timestamp: new Date() }, { status: 201 });
}
