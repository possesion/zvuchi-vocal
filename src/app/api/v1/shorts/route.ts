import { NextRequest, NextResponse } from 'next/server';
import { getShortsFromDb, addShortToDb, deleteShortFromDb } from '@/lib/db';
import { SHORTS } from '@/app/constants';

export async function GET() {
    const all = [...new Set([...getShortsFromDb(), ...SHORTS])];
    return NextResponse.json({ urls: all });
}

export async function POST(req: NextRequest) {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'url required' }, { status: 400 });
    addShortToDb(url);
    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    deleteShortFromDb(url);
    return NextResponse.json({ success: true });
}
