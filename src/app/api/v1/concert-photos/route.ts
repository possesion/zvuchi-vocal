import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, listImages, S3Prefix } from '@/lib/s3';
import type { ApiResponse } from '@/types/api';

export async function GET(): Promise<NextResponse<ApiResponse<{ urls: string[] }>>> {
    try {
        const urls = await listImages(S3Prefix.concertPhotos);
        return NextResponse.json({ success: true, data: { urls }, timestamp: new Date() });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to list photos', timestamp: new Date() }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ url: string }>>> {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) return NextResponse.json({ success: false, error: 'No file provided', timestamp: new Date() }, { status: 400 });

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) return NextResponse.json({ success: false, error: 'Invalid file type', timestamp: new Date() }, { status: 400 });
        if (file.size > 2 * 1024 * 1024) return NextResponse.json({ success: false, error: 'File too large (max 2MB)', timestamp: new Date() }, { status: 400 });

        const ext = file.name.split('.').pop() ?? 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const url = await uploadImage(Buffer.from(await file.arrayBuffer()), fileName, file.type, S3Prefix.concertPhotos);
        return NextResponse.json({ success: true, data: { url }, timestamp: new Date() });
    } catch {
        return NextResponse.json({ success: false, error: 'Upload failed', timestamp: new Date() }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    try {
        const { fileName } = await req.json();
        if (!fileName) return NextResponse.json({ success: false, error: 'No fileName provided', timestamp: new Date() }, { status: 400 });
        await deleteImage(fileName, S3Prefix.concertPhotos);
        return NextResponse.json({ success: true, data: { success: true }, timestamp: new Date() });
    } catch {
        return NextResponse.json({ success: false, error: 'Delete failed', timestamp: new Date() }, { status: 500 });
    }
}
