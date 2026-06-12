import { NextRequest, NextResponse } from 'next/server';
import { getAllTerms, upsertTerm } from '@/lib/db-prisma';
import { createSlug } from '../utils';
import type { ApiResponse } from '@/types/api';
import type { WikiTermRow } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<{ terms: WikiTermRow[] }>>> {
    return NextResponse.json({ success: true, data: { terms: await getAllTerms() }, timestamp: new Date() });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<WikiTermRow>>> {
    const { title, description, category, author } = await req.json();
    if (!title || !description || !category) {
        return NextResponse.json({ success: false, error: 'title, description, category required', timestamp: new Date() }, { status: 400 });
    }
    const id = createSlug(title);
    const term = await upsertTerm({ id, title, description, category, author: author ?? '', coverUrl: '' });
    return NextResponse.json({ success: true, data: term, timestamp: new Date() }, { status: 201 });
}
