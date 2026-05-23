import { NextRequest, NextResponse } from 'next/server';
import { incrementNewsViews } from '@/lib/db-prisma';

export async function POST(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    await incrementNewsViews(Number(id));
    return NextResponse.json({ success: true });
}
