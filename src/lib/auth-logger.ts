import type { Logger } from 'winston';
import { createModuleLogger } from '@/lib/logger';

/**
 * Тип конфигурации логгера next-auth (подмножество, которое мы переопределяем).
 * Расширяет Record<string, ...>, чтобы быть совместимым с next-auth
 * `Partial<LoggerInstance>` (тот наследует `Record<string, Function>`).
 */
export interface NextAuthLoggerConfig
    extends Record<string, (...args: unknown[]) => void> {
    error(code: unknown, ...args: unknown[]): void;
    warn(code: unknown, ...args: unknown[]): void;
}

/**
 * Строит конфигурацию логгера next-auth, направляющую события в Winston
 * с полем `module: 'auth'`.
 *
 * Событие `CredentialsSignin` подавляется — это ожидаемая ошибка при неверном
 * логине/пароле, а не сбой системы (Req 6.2).
 *
 * @param baseLogger Winston-логгер (по умолчанию — модульный logger 'auth')
 */
export function createAuthLogger(baseLogger: Logger = createModuleLogger('auth')): NextAuthLoggerConfig {
    return {
        error(code, ...args) {
            // Подавляем ожидаемую ошибку при неверном пароле/логине.
            if (String(code) === 'CredentialsSignin') return;
            baseLogger.error(String(code), { args });
        },
        warn(code, ...args) {
            baseLogger.warn(String(code), { args });
        },
    };
}
