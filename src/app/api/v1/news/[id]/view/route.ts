import { NextRequest, NextResponse } from 'next/server';
import { incrementNewsViews } from '@/lib/db-prisma';
import type { ApiResponse } from '@/types/api';

export async function POST(_req: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const { id } = await props.params;
    await incrementNewsViews(Number(id));
    return NextResponse.json({ success: true, data: { success: true }, timestamp: new Date() });
}
