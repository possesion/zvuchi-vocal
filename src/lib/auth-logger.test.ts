import { describe, it, expect, vi } from 'vitest';
import type { Logger } from 'winston';
import { createAuthLogger } from './auth-logger';

function makeFakeLogger() {
    return {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    } as unknown as Logger;
}

describe('createAuthLogger', () => {
    it('подавляет событие CredentialsSignin (не логирует)', () => {
        const base = makeFakeLogger();
        const authLogger = createAuthLogger(base);

        authLogger.error('CredentialsSignin', { some: 'detail' });

        expect(base.error).not.toHaveBeenCalled();
    });

    it('направляет прочие error-события в Winston', () => {
        const base = makeFakeLogger();
        const authLogger = createAuthLogger(base);

        authLogger.error('OAuthCallbackError', 'extra');

        expect(base.error).toHaveBeenCalledWith('OAuthCallbackError', {
            args: ['extra'],
        });
    });

    it('направляет warn-события в Winston', () => {
        const base = makeFakeLogger();
        const authLogger = createAuthLogger(base);

        authLogger.warn('debug-enabled');

        expect(base.warn).toHaveBeenCalledWith('debug-enabled', { args: [] });
    });
});
