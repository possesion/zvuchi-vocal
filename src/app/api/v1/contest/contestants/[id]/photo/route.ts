import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import heicConvert from 'heic-convert';
import { auth } from '@/auth';
import { canEdit } from '@/lib/roles';
import { getContestantById, updateContestant } from '@/lib/db-prisma';
import { uploadImage, deleteImage, S3Prefix } from '@/lib/s3';
import type { ApiResponse } from '@/types/api';
import { createModuleLogger } from '@/lib/logger';

const log = createModuleLogger('contest');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
const HEIC_EXTENSIONS = ['heic', 'heif'];
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Браузеры (особенно iOS Safari) часто отдают пустой или неверный MIME-тип
 * для HEIC/HEIF-файлов (например, "" или "application/octet-stream"),
 * поэтому дополнительно проверяем тип по расширению файла.
 */
function isAllowedFile(file: File): boolean {
    if (ALLOWED_TYPES.includes(file.type)) return true;
    const ext = file.name.split('.').pop()?.toLowerCase();
    return !!ext && ALLOWED_EXTENSIONS.includes(ext);
}

function isHeicFile(file: File): boolean {
    if (file.type === 'image/heic' || file.type === 'image/heif') return true;
    const ext = file.name.split('.').pop()?.toLowerCase();
    return !!ext && HEIC_EXTENSIONS.includes(ext);
}

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ url: string }>>> {
    const session = await auth();
    if (!canEdit(session?.user?.role)) {
        return NextResponse.json(
            { success: false, error: 'Forbidden', timestamp: new Date() },
            { status: 403 }
        );
    }

    const { id } = await props.params;
    const contestant = await getContestantById(Number(id));
    if (!contestant) {
        return NextResponse.json(
            { success: false, error: 'Not found', timestamp: new Date() },
            { status: 404 }
        );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
        return NextResponse.json(
            { success: false, error: 'No file provided', timestamp: new Date() },
            { status: 400 }
        );
    }
    if (!isAllowedFile(file)) {
        return NextResponse.json(
            { success: false, error: 'Invalid file type', timestamp: new Date() },
            { status: 400 }
        );
    }
    if (file.size > MAX_SIZE) {
        return NextResponse.json(
            { success: false, error: 'File too large (max 5MB)', timestamp: new Date() },
            { status: 400 }
        );
    }

    if (contestant.photoUrl) {
        const oldFileName = contestant.photoUrl.split('/').pop();
        if (oldFileName) {
            await deleteImage(oldFileName, S3Prefix.contestant).catch((error) =>
                log.error('Не удалось удалить старое фото участника', { id, err: error })
            );
        }
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    let ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    let contentType = file.type || 'application/octet-stream';

    // Браузеры и <Image> из next/image не умеют отображать HEIC/HEIF —
    // конвертируем в JPEG перед загрузкой в S3, чтобы фото отображалось на странице.
    if (isHeicFile(file)) {
        try {
            const converted = await heicConvert({ buffer, format: 'JPEG', quality: 0.5 });
            buffer = Buffer.from(converted);
            ext = 'jpg';
            contentType = 'image/jpeg';
        } catch (error) {
            log.error('Не удалось сконвертировать HEIC-фото участника', { id, err: error });
            return NextResponse.json(
                { success: false, error: 'Failed to convert HEIC image', timestamp: new Date() },
                { status: 400 }
            );
        }
    }

    const fileName = `contestant-${id}.${ext}`;
    const url = await uploadImage(buffer, fileName, contentType, S3Prefix.contestant);

    await updateContestant({ ...contestant, photoUrl: url });
    log.info('Фото участника обновлено', { id });
    revalidatePath('/contest');
    revalidatePath('/contest/result');

    return NextResponse.json({ success: true, data: { url }, timestamp: new Date() });
}
