import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { getContestantById, getVoteStatusByUserId, upsertContestVote } from '@/lib/db-prisma';
import type { ApiResponse } from '@/types/api';
import type { ContestVoteStatus } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<ContestVoteStatus>>> {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({
            success: true,
            data: { hasVoted: false, contestantId: null },
            timestamp: new Date(),
        });
    }

    const status = await getVoteStatusByUserId(Number(session.user.id));
    return NextResponse.json({ success: true, data: status, timestamp: new Date() });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ContestVoteStatus>>> {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized', timestamp: new Date() },
            { status: 401 }
        );
    }

    const body = await req.json().catch(() => null);
    const contestantId = body?.contestantId;
    if (typeof contestantId !== 'number' || !Number.isInteger(contestantId) || contestantId <= 0) {
        return NextResponse.json(
            { success: false, error: 'Invalid contestantId', timestamp: new Date() },
            { status: 400 }
        );
    }

    const contestant = await getContestantById(contestantId);
    if (!contestant) {
        return NextResponse.json(
            { success: false, error: 'Contestant not found', timestamp: new Date() },
            { status: 404 }
        );
    }

    const { created } = await upsertContestVote(Number(session.user.id), contestantId);
    console.log(`[Contest] Голос сохранён: userId=${session.user.id}, contestantId=${contestantId}, created=${created}`);
    revalidatePath('/contest');
    revalidatePath('/contest/result');

    return NextResponse.json(
        { success: true, data: { hasVoted: true, contestantId }, timestamp: new Date() },
        { status: created ? 201 : 200 }
    );
}
