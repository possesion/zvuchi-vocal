import * as Sentry from '@sentry/nextjs';

// ─── Server-side journey logger (Sentry Structured Logs) ─────────────────────
//
// Пишет структурированные логи в раздел Logs Sentry через Sentry.logger.
// Назначение — трейсинг пользовательского пути в серверных экшенах
// (src/app/actions/*): вызов экшена, успешное завершение, бизнес-отказ,
// исключение.
//
// Серверный аналог src/lib/client-logger.ts (тот помечен 'use client' и
// в серверный код не импортируется). Winston-логгер (@/lib/logger) остаётся
// для stdout/Loki и не затрагивается — эти логи дополняют его в Sentry Logs.
// Реально отправляются только в production (enableLogs в sentry.server.config).

const { logger } = Sentry;

/**
 * Структурированные атрибуты лога серверного экшена.
 * Попадают в Sentry Logs как индексируемые поля для фильтрации.
 */
export interface ActionLogAttributes {
    /** Идентификатор пользователя из сессии. */
    userId?: number | string;
    /** Длительность выполнения экшена в миллисекундах. */
    durationMs?: number;
    /** Логический модуль/поток (profile, instructors, ...). */
    module?: string;
    /** Произвольные доп. атрибуты для фильтрации в Sentry Logs. */
    [key: string]: unknown;
}

/**
 * Логирует вызов серверного экшена (уровень info).
 * @param action Имя экшена (например `updateUserProfile`)
 * @param attributes Доп. атрибуты (userId, module, ...)
 */
export function logActionStart(action: string, attributes?: ActionLogAttributes): void {
    logger.info(logger.fmt`Экшен → ${action}`, {
        action,
        phase: 'request',
        ...attributes,
    });
}

/**
 * Логирует успешное завершение экшена (уровень info).
 * @param action Имя экшена
 * @param attributes Доп. атрибуты (userId, durationMs, ...)
 */
export function logActionSuccess(action: string, attributes?: ActionLogAttributes): void {
    logger.info(logger.fmt`Экшен успех ← ${action}`, {
        action,
        phase: 'success',
        ...attributes,
    });
}

/**
 * Логирует бизнес-отказ экшена (уровень warn).
 * Используется для ожидаемых отказов: не авторизован, не найдено, невалидные данные.
 * @param action Имя экшена
 * @param reason Причина отказа (для фильтрации)
 * @param attributes Доп. атрибуты
 */
export function logActionFailure(
    action: string,
    reason: string,
    attributes?: ActionLogAttributes
): void {
    logger.warn(logger.fmt`Экшен отклонён ← ${action}`, {
        action,
        phase: 'failure',
        reason,
        ...attributes,
    });
}

/**
 * Логирует исключение в экшене (уровень error).
 * Используется в catch-блоке.
 * @param action Имя экшена
 * @param error Пойманное исключение
 * @param attributes Доп. атрибуты
 */
export function logActionError(
    action: string,
    error: unknown,
    attributes?: ActionLogAttributes
): void {
    logger.error(logger.fmt`Экшен ошибка ← ${action}`, {
        action,
        phase: 'error',
        error: error instanceof Error ? error.message : String(error),
        ...attributes,
    });
}
