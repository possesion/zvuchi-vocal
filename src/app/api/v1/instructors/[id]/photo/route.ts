import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, S3Prefix } from '@/lib/s3';
import { getInstructorById, updateInstructor } from '@/lib/db-prisma';
import type { ApiResponse } from '@/types/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ url: string }>>> {
    const { id } = await props.params;
    const instructor = await getInstructorById(Number(id));
    if (!instructor) return NextResponse.json({ success: false, error: 'Not found', timestamp: new Date() }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ success: false, error: 'No file provided', timestamp: new Date() }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ success: false, error: 'Invalid file type', timestamp: new Date() }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ success: false, error: 'File too large (max 5MB)', timestamp: new Date() }, { status: 400 });

    if (instructor.image?.startsWith('https://')) {
        const oldFileName = instructor.image.split('/').pop();
        if (oldFileName) await deleteImage(oldFileName, S3Prefix.instructorPhotos).catch(() => {});
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `instructor-${id}-${Date.now()}.${ext}`;
    const url = await uploadImage(Buffer.from(await file.arrayBuffer()), fileName, file.type, S3Prefix.instructorPhotos);

    await updateInstructor({ ...instructor, image: url });
    return NextResponse.json({ success: true, data: { url }, timestamp: new Date() });
}
