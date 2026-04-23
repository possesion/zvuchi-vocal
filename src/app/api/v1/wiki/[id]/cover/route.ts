import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, S3Prefix } from '@/lib/s3';
import { getTermById, upsertTerm } from '@/lib/db';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const decodedId = decodeURIComponent(id);
    const term = getTermById(decodedId);
    if (!term) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });

    if (term.cover_url) {
        const oldFileName = term.cover_url.split('/').pop();
        if (oldFileName) await deleteImage(oldFileName, S3Prefix.wikiCovers).catch(() => {});
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${decodedId}-${Date.now()}.${ext}`;
    const url = await uploadImage(Buffer.from(await file.arrayBuffer()), fileName, file.type, S3Prefix.wikiCovers);

    upsertTerm({ ...term, cover_url: url });
    return NextResponse.json({ url });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const decodedId = decodeURIComponent(id);
    const term = getTermById(decodedId);
    if (!term) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (term.cover_url) {
        const fileName = term.cover_url.split('/').pop();
        if (fileName) await deleteImage(fileName, S3Prefix.wikiCovers).catch(() => {});
    }

    upsertTerm({ ...term, cover_url: '' });
    return NextResponse.json({ success: true });
}
