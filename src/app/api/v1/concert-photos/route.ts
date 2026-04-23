import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, listImages, S3Prefix } from '@/lib/s3';

export async function GET() {
    try {
        const urls = await listImages(S3Prefix.concertPhotos);
        return NextResponse.json({ urls });
    } catch {
        return NextResponse.json({ error: 'Failed to list photos' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });

        const ext = file.name.split('.').pop() ?? 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const url = await uploadImage(Buffer.from(await file.arrayBuffer()), fileName, file.type, S3Prefix.concertPhotos);
        return NextResponse.json({ url });
    } catch {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { fileName } = await req.json();
        if (!fileName) return NextResponse.json({ error: 'No fileName provided' }, { status: 400 });
        await deleteImage(fileName, S3Prefix.concertPhotos);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
