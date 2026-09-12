import * as Sentry from '@sentry/nextjs';
import {
    logRequestStart,
    logRequestSuccess,
    logRequestFailure,
    logRequestError,
} from '@/lib/client-logger';

export const submitMailForm = async (data: unknown) => {
        const endpoint = '/api/send-mail';
        const startedAt = performance.now();
        logRequestStart(endpoint, { method: 'POST', module: 'mail-form' });
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const durationMs = Math.round(performance.now() - startedAt);
            const result = await response.json();

            if (response.ok) {
                logRequestSuccess(endpoint, { method: 'POST', module: 'mail-form', status: response.status, durationMs });
                return { ok: true, data: result };
            } else {
                logRequestFailure(endpoint, {
                    method: 'POST',
                    module: 'mail-form',
                    status: response.status,
                    durationMs,
                    error: result.error,
                });
                return { ok: false, error: result.error || 'Произошла ошибка' };
            }
        } catch (error) {
            logRequestError(endpoint, error, { method: 'POST', module: 'mail-form' });
            Sentry.captureException(error, { extra: { context: 'submit-mail-form' } });
            return { ok: false, error: 'Произошла ошибка при отправке' };
        }
    };
