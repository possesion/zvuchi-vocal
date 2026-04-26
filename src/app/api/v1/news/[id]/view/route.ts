import { NextRequest, NextResponse } from 'next/server';
import { incrementNewsViews } from '@/lib/db';

export async function POST(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    incrementNewsViews(Number(id));
    return NextResponse.json({ success: true });
}
