import { NextRequest } from 'next/server';
import { getInstructorById, updateInstructor } from '@/lib/db';
import { apiOk, apiError } from '@/lib/api-response';
import { createSlug } from '../../utils';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader !== process.env.ADMIN_TOKEN) {
        return apiError('Unauthorized', 401);
    }

    const { id } = await props.params;
    const existing = getInstructorById(Number(id));
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

    const updated = updateInstructor({
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
