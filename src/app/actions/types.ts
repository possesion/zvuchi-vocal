export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export interface QuizAnswers {
    experience: string;
    genre: string;
    motivation: string;
}

export interface SendEmailProps {
    name: string;
    phone: string;
    formType?: 'enrollment-form' | 'promo' | 'quiz';
    quizAnswers?: QuizAnswers;
}