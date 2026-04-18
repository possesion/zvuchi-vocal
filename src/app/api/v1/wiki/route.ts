import { NextRequest, NextResponse } from 'next/server';
import { getAllTerms, upsertTerm } from '@/lib/db';
import { createSlug } from '../utils';
import { checkApiAuth } from '@/lib/auth';

export async function GET() {
    return NextResponse.json({ terms: getAllTerms() });
}

export async function POST(req: NextRequest) {
    if (!checkApiAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, author } = await req.json();
    if (!title || !description || !category) {
        return NextResponse.json({ error: 'title, description, category required' }, { status: 400 });
    }

    const id = createSlug(title);
    const term = upsertTerm({ id, title, description, category, author: author ?? '' });
    return NextResponse.json(term, { status: 201 });
}
