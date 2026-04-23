import { NextRequest, NextResponse } from 'next/server';
import { getTermById, upsertTerm, deleteTermById } from '@/lib/db';

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const term = getTermById(decodeURIComponent(id));
    if (!term) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(term);
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const decodedId = decodeURIComponent(id);
    const existing = getTermById(decodedId);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const updated = upsertTerm({
        ...existing,
        id: decodedId,
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        category: body.category ?? existing.category,
        author: body.author ?? existing.author,
    });
    return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    deleteTermById(decodeURIComponent(id));
    return NextResponse.json({ success: true });
}
