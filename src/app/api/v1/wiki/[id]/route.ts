import { NextRequest, NextResponse } from 'next/server';
import { glossaryTerms, GlossaryTerm } from '@/app/wiki/glossary-data';
import { getTermOverride, upsertTerm } from '@/lib/db';

function mergeTerm(base: GlossaryTerm) {
    const override = getTermOverride(base.id);
    if (!override) return base;
    return {
        ...base,
        title: override.title,
        description: override.description,
        category: override.category as GlossaryTerm['category'],
    };
}

export function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const base = glossaryTerms.find((t) => t.id === params.id);
    if (!base) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(mergeTerm(base));
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = req.headers.get('Authorization');
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base = glossaryTerms.find((t) => t.id === params.id);
    if (!base) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const updated = upsertTerm({
        id: base.id,
        title: body.title ?? base.title,
        description: body.description ?? base.description,
        category: body.category ?? base.category,
    });

    return NextResponse.json(updated);
}
