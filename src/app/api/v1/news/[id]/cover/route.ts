import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, S3Prefix } from '@/lib/s3';
import { getNewsById, updateNews } from '@/lib/db-prisma';
import type { ApiResponse } from '@/types/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ url: string }>>> {
    const { id } = await props.params;
    const post = await getNewsById(Number(id));
    if (!post) return NextResponse.json({ success: false, error: 'Not found', timestamp: new Date() }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ success: false, error: 'No file provided', timestamp: new Date() }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ success: false, error: 'Invalid file type', timestamp: new Date() }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ success: false, error: 'File too large (max 5MB)', timestamp: new Date() }, { status: 400 });

    if (post.coverUrl) {
        const oldFileName = post.coverUrl.split('/').pop();
        if (oldFileName) await deleteImage(oldFileName, S3Prefix.newsCovers).catch(() => {});
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `news-${id}-${Date.now()}.${ext}`;
    const url = await uploadImage(Buffer.from(await file.arrayBuffer()), fileName, file.type, S3Prefix.newsCovers);

    await updateNews({ ...post, coverUrl: url });
    return NextResponse.json({ success: true, data: { url }, timestamp: new Date() });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const { id } = await props.params;
    const post = await getNewsById(Number(id));
    if (!post) return NextResponse.json({ success: false, error: 'Not found', timestamp: new Date() }, { status: 404 });

    if (post.coverUrl) {
        const fileName = post.coverUrl.split('/').pop();
        if (fileName) await deleteImage(fileName, S3Prefix.newsCovers).catch(() => {});
    }

    await updateNews({ ...post, coverUrl: '' });
    return NextResponse.json({ success: true, data: { success: true }, timestamp: new Date() });
}
