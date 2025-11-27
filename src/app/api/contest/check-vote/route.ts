import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies()
  const hasVoted = cookieStore.get('hasVoted')
  
  return NextResponse.json({
    hasVoted: !!hasVoted,
  });
}
