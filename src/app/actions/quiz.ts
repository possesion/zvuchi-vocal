'use server';

import { sendEmail } from '@/app/actions/sendEmail';
import type { ActionResult } from '@/app/actions/types';

export interface QuizSubmitData {
    name: string;
    phone: string;
    formType: 'quiz';
    quizAnswers: {
        experience: string;
        genre: string;
        motivation: string;
    };
}

export async function submitQuizAction(data: QuizSubmitData): Promise<ActionResult<void>> {
    return sendEmail(data);
}
