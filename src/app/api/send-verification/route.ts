import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/app/actions/sendEmail';

export async function POST(request: NextRequest) {
    const { email, token } = await request.json();

    if (!email || !token) {
        return NextResponse.json({ error: 'email and token are required' }, { status: 400 });
    }

    const result = await sendVerificationEmail(email, token);
    if (!result.success) {
        console.error('Failed to send verification email:', result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
