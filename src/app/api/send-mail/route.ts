import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/actions/sendEmail';

export type SendMailSuccess = { message: string };
export type SendMailError = { error: string };

export async function POST(request: Request): Promise<NextResponse<SendMailSuccess | SendMailError>> {
    const { name, phone, formType, quizAnswers } = await request.json();

    const result = await sendEmail({ name, phone, formType, quizAnswers });
    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ message: 'Заявка отправлена!' });
}
