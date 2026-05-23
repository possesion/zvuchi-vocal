import { NextRequest, NextResponse } from 'next/server';
import { getAllTerms, upsertTerm } from '@/lib/db-prisma';
import { createSlug } from '../utils';

export async function GET() {
    return NextResponse.json({ terms: await getAllTerms() });
}

export async function POST(req: NextRequest) {
    const { title, description, category, author } = await req.json();
    if (!title || !description || !category) {
        return NextResponse.json({ error: 'title, description, category required' }, { status: 400 });
    }
    const id = createSlug(title);
    const term = await upsertTerm({ id, title, description, category, author: author ?? '', cover_url: '' });
    return NextResponse.json(term, { status: 201 });
}
