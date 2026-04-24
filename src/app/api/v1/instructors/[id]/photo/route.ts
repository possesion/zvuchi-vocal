import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, S3Prefix } from '@/lib/s3';
import { getInstructorById, updateInstructor } from '@/lib/db';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const instructor = getInstructorById(Number(id));
    if (!instructor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });

    if (instructor.image?.startsWith('https://')) {
        const oldFileName = instructor.image.split('/').pop();
        if (oldFileName) await deleteImage(oldFileName, S3Prefix.instructorPhotos).catch(() => {});
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `instructor-${id}-${Date.now()}.${ext}`;
    const url = await uploadImage(Buffer.from(await file.arrayBuffer()), fileName, file.type, S3Prefix.instructorPhotos);

    updateInstructor({ ...instructor, image: url });
    return NextResponse.json({ url });
}
