import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/app/actions/sendEmail';

export async function POST(request: NextRequest) {
    const { email, token } = await request.json();

    if (!email || !token) {
        return NextResponse.json({ error: 'email and token are required' }, { status: 400 });
    }

    try {
        await sendVerificationEmail(email, token);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send email' },
            { status: 500 }
        );
    }
}
