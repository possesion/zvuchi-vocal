import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { canEdit, isAdmin } from '@/lib/roles';
import { getContestantById, updateContestant, deleteContestant } from '@/lib/db-prisma';
import { validateContestantFields } from '@/lib/contest-validation';
import { deleteImage, S3Prefix } from '@/lib/s3';
import type { ApiResponse } from '@/types/api';
import type { Contestant } from '@/lib/types';

export async function PUT(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Contestant>>> {
    const session = await auth();
    if (!canEdit(session?.user?.role)) {
        return NextResponse.json(
            { success: false, error: 'Forbidden', timestamp: new Date() },
            { status: 403 }
        );
    }

    const { id } = await props.params;
    const existing = await getContestantById(Number(id));
    if (!existing) {
        return NextResponse.json(
            { success: false, error: 'Not found', timestamp: new Date() },
            { status: 404 }
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

    const updated = await updateContestant({ ...existing, ...validation.data });
    console.log('[Contest] Участник обновлён:', updated.id);
    revalidatePath('/contest');
    revalidatePath('/contest/result');

    return NextResponse.json({ success: true, data: updated, timestamp: new Date() });
}

export async function DELETE(
    _req: NextRequest,
    props: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const session = await auth();
    if (!isAdmin(session?.user?.role)) {
        return NextResponse.json(
            { success: false, error: 'Forbidden', timestamp: new Date() },
            { status: 403 }
        );
    }

    const { id } = await props.params;
    const existing = await getContestantById(Number(id));
    if (!existing) {
        return NextResponse.json(
            { success: false, error: 'Not found', timestamp: new Date() },
            { status: 404 }
        );
    }

    if (existing.photoUrl) {
        const fileName = existing.photoUrl.split('/').pop();
        if (fileName) {
            try {
                await deleteImage(fileName, S3Prefix.contestant);
            } catch (error) {
                // Ошибка, отличная от "файл не найден" — не удаляем запись (Requirement 7.6)
                console.error('[Contest] Не удалось удалить фото участника, запись не удалена:', existing.id, error);
                return NextResponse.json(
                    { success: false, error: 'Failed to delete photo, contestant not deleted', timestamp: new Date() },
                    { status: 502 }
                );
            }
        }
    }

    await deleteContestant(Number(id)); // каскадно удаляет связанные ContestVote
    console.log('[Contest] Участник удалён:', id);
    revalidatePath('/contest');
    revalidatePath('/contest/result');

    return NextResponse.json({ success: true, data: { success: true }, timestamp: new Date() });
}
