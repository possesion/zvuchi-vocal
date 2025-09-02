import { NextResponse } from 'next/server';

export async function GET() {

  try {
    return NextResponse.json({ message: 'Health check request' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error },
      { status: 500 },
    );
  }
}