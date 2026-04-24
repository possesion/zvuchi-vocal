import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, S3Prefix } from '@/lib/s3';
import { getNewsById, updateNews } from '@/lib/db';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const post = getNewsById(Number(id));
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });

    if (post.cover_url) {
        const oldFileName = post.cover_url.split('/').pop();
        if (oldFileName) await deleteImage(oldFileName, S3Prefix.newsCovers).catch(() => {});
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `news-${id}-${Date.now()}.${ext}`;
    const url = await uploadImage(Buffer.from(await file.arrayBuffer()), fileName, file.type, S3Prefix.newsCovers);

    updateNews({ ...post, cover_url: url });
    return NextResponse.json({ url });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const post = getNewsById(Number(id));
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (post.cover_url) {
        const fileName = post.cover_url.split('/').pop();
        if (fileName) await deleteImage(fileName, S3Prefix.newsCovers).catch(() => {});
    }

    updateNews({ ...post, cover_url: '' });
    return NextResponse.json({ success: true });
}
