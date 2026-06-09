import { NextRequest, NextResponse } from 'next/server';
import { getShortsFromDb, addShortToDb, deleteShortFromDb } from '@/lib/db-prisma';
import { SHORTS } from '@/app/constants';
import type { ApiResponse } from '@/types/api';

export async function GET(): Promise<NextResponse<ApiResponse<{ urls: string[] }>>> {
    const all = [...new Set([...await getShortsFromDb(), ...SHORTS])];
    return NextResponse.json({ success: true, data: { urls: all }, timestamp: new Date() });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') return NextResponse.json({ success: false, error: 'url required', timestamp: new Date() }, { status: 400 });
    await addShortToDb(url);
    return NextResponse.json({ success: true, data: { success: true }, timestamp: new Date() });
}

export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ success: false, error: 'url required', timestamp: new Date() }, { status: 400 });
    await deleteShortFromDb(url);
    return NextResponse.json({ success: true, data: { success: true }, timestamp: new Date() });
}
