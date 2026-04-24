import { NextRequest } from 'next/server';
import { getInstructorById, updateInstructor } from '@/lib/db';
import { apiOk, apiError } from '@/lib/api-response';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const existing = getInstructorById(Number(id));
    if (!existing) return apiError('Not found', 404);

    const body = await req.json();
    const updated = updateInstructor({
        ...existing,
        name: body.name ?? existing.name,
        specialty: body.specialty ?? existing.specialty,
        feature: body.feature ?? existing.feature,
        experience: body.experience ?? existing.experience,
        bio: body.bio ?? existing.bio,
        video: body.video ?? existing.video,
        sort_order: body.sort_order ?? existing.sort_order,
    });
    return apiOk(updated);
}
