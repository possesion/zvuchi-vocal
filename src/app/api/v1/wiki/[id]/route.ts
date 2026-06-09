import { NextRequest, NextResponse } from 'next/server';
import { getTermById, upsertTerm, deleteTermById } from '@/lib/db-prisma';
import type { ApiResponse } from '@/types/api';
import type { WikiTermRow } from '@/lib/types';

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<WikiTermRow>>> {
    const { id } = await props.params;
    const term = await getTermById(decodeURIComponent(id));
    if (!term) return NextResponse.json({ success: false, error: 'Not found', timestamp: new Date() }, { status: 404 });
    return NextResponse.json({ success: true, data: term, timestamp: new Date() });
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<WikiTermRow>>> {
    const { id } = await props.params;
    const decodedId = decodeURIComponent(id);
    const existing = await getTermById(decodedId);
    if (!existing) return NextResponse.json({ success: false, error: 'Not found', timestamp: new Date() }, { status: 404 });

    const body = await req.json();
    const updated = await upsertTerm({
        ...existing,
        id: decodedId,
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        category: body.category ?? existing.category,
        author: body.author ?? existing.author,
    });
    return NextResponse.json({ success: true, data: updated, timestamp: new Date() });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const { id } = await props.params;
    await deleteTermById(decodeURIComponent(id));
    return NextResponse.json({ success: true, data: { success: true }, timestamp: new Date() });
}
