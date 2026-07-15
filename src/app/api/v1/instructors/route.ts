import { NextRequest, NextResponse } from 'next/server';
import { getAllInstructors, createInstructor, deleteInstructor } from '@/lib/db-prisma';
import { apiOk, apiError } from '@/lib/api-response';
import type { ApiResponse } from '@/types/api';
import type { Instructor } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<{ instructors: Instructor[] }>>> {
    return apiOk({ instructors: await getAllInstructors() });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Instructor>>> {
    const { 
        bio,
        experience,
        feature,
        image,
        level,
        name,
        presentation_video,
        performance_videos,
        sort_order,
        specialty,
        techniques,
        video,
    } = await req.json();
    if (!name) return apiError('name required', 400);
    const instructor = await createInstructor({
        bio: bio ?? '',
        experience: experience ?? '',
        feature: feature ?? '',
        image: image ?? '', 
        level: level ?? 'expert',
        name, 
        presentationVideo: presentation_video ?? '',
        performanceVideos: Array.isArray(performance_videos) ? performance_videos : [],
        sortOrder: sort_order ?? 0,
        slug: '',
        specialty: specialty ?? '',
        techniques: Array.isArray(techniques) ? techniques : [],
        video: video ?? '',
    });
    return apiOk(instructor);
}

export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const { id } = await req.json();
    if (!id) return apiError('id required', 400);
    await deleteInstructor(Number(id));
    return apiOk({ success: true });
}
