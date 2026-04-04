import { NextRequest, NextResponse } from 'next/server';
import { getShortsFromDb, addShortToDb, deleteShortFromDb } from '@/lib/db';
import { SHORTS } from '@/app/constants';

export async function GET() {
    const dbShorts = getShortsFromDb();
    // DB-шорты в начале, затем статические (без дублей)
    const all = [...new Set([...dbShorts, ...SHORTS])];
    return NextResponse.json({ urls: all });
}

export async function POST(req: NextRequest) {
    if (!req.headers.get('Authorization')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
        return NextResponse.json({ error: 'url required' }, { status: 400 });
    }
    addShortToDb(url);
    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    if (!req.headers.get('Authorization')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    deleteShortFromDb(url);
    return NextResponse.json({ success: true });
}
