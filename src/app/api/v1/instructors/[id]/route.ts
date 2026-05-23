import { NextRequest } from 'next/server';
import { getInstructorById, updateInstructor } from '@/lib/db-prisma';
import { apiOk, apiError } from '@/lib/api-response';
import { createSlug } from '../../utils';
import { auth } from '@/auth';
import { canEdit } from '@/lib/roles';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || !canEdit(session.user?.role)) {
        return apiError('Unauthorized', 401);
    }

    const { id } = await props.params;
    const existing = await getInstructorById(Number(id));
    if (!existing) return apiError('Not found', 404);

    const body = await req.json();

    // performance_videos and techniques come as arrays from client
    const performance_videos: string[] = Array.isArray(body.performance_videos)
        ? body.performance_videos
        : existing.performance_videos;

    const techniques: string[] = Array.isArray(body.techniques)
        ? body.techniques
        : existing.techniques;

    const name: string = body.name ?? existing.name;
    const slug = body.name ? createSlug(name) : existing.slug;

    const updated = await updateInstructor({
        ...existing,
        name,
        slug,
        specialty: body.specialty ?? existing.specialty,
        feature: body.feature ?? existing.feature,
        experience: body.experience ?? existing.experience,
        bio: body.bio ?? existing.bio,
        image: body.image ?? existing.image,
        video: body.video ?? existing.video,
        sort_order: body.sort_order ?? existing.sort_order,
        presentation_video: body.presentation_video ?? existing.presentation_video,
        performance_videos,
        techniques,
    });
    return apiOk(updated);
}
