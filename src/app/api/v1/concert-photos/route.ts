import { NextRequest, NextResponse } from 'next/server';
import { uploadConcertPhoto, listConcertPhotos, deleteConcertPhoto } from '@/lib/s3';

export async function GET() {
    try {
        const urls = await listConcertPhotos();
        return NextResponse.json({ urls });
    } catch (error) {
        console.error('S3 list error:', error);
        return NextResponse.json({ error: 'Failed to list photos' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = req.headers.get('Authorization');
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
        }

        const ext = file.name.split('.').pop() ?? 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const url = await uploadConcertPhoto(buffer, fileName, file.type);
        return NextResponse.json({ url });
    } catch (error) {
        console.error('S3 upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = req.headers.get('Authorization');
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { fileName } = await req.json();
        if (!fileName) {
            return NextResponse.json({ error: 'No fileName provided' }, { status: 400 });
        }
        await deleteConcertPhoto(fileName);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('S3 delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
