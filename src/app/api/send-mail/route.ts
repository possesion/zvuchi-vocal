import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/actions/sendEmail';

export async function POST(request: Request) {
    const { name, phone } = await request.json();

    try {
        await sendEmail({ name, phone })
        return NextResponse.json({ message: 'Заявка отправлена!' });
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