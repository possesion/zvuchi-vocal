import { NextRequest } from 'next/server';
import { getAllInstructors, createInstructor, deleteInstructor } from '@/lib/db-prisma';
import { apiOk, apiError } from '@/lib/api-response';

export async function GET() {
    return apiOk({ instructors: await getAllInstructors() });
}

export async function POST(req: NextRequest) {
    const { 
        name,
        specialty,
        feature,
        experience,
        bio,
        image,
        video,
        sort_order,
        presentation_video,
        performance_videos,
        techniques
    } = await req.json();
    if (!name) return apiError('name required', 400);
    const instructor = await createInstructor({
        name, specialty: specialty ?? '', feature: feature ?? '',
        experience: experience ?? '', bio: bio ?? '',
        image: image ?? '', video: video ?? '',
        sort_order: sort_order ?? 0,
        slug: '',
        presentation_video: presentation_video ?? '',
        performance_videos: Array.isArray(performance_videos) ? performance_videos : [],
        techniques: Array.isArray(techniques) ? techniques : [],
    });
    return apiOk(instructor);
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    if (!id) return apiError('id required', 400);
    await deleteInstructor(Number(id));
    return apiOk({ success: true });
}
