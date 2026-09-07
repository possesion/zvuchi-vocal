import * as yup from 'yup';
import { ContestantSchema } from '@/lib/definitions';

export type ContestantValidationResult =
    | { valid: true; data: { name: string; song: string; originalArtist: string } }
    | { valid: false; error: string };

/**
 * Валидирует и нормализует (trim) текстовые поля участника конкурса
 * с помощью yup-схемы ContestantSchema (см. src/lib/definitions.ts) —
 * той же, что используется на клиенте в contestant-admin-form.tsx.
 * Используется как при создании, так и при обновлении Contestant.
 */
export async function validateContestantFields(input: unknown): Promise<ContestantValidationResult> {
    try {
        const data = await ContestantSchema.validate(input ?? {}, {
            abortEarly: true,
            stripUnknown: true,
        });
        return { valid: true, data };
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return { valid: false, error: error.message };
        }
        return { valid: false, error: 'Некорректные данные участника' };
    }
}
