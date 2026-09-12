'use client';

import * as Sentry from '@sentry/nextjs';

// ─── Client-only journey logger (Sentry Structured Logs) ─────────────────────
//
// Пишет структурированные логи в раздел Logs Sentry через Sentry.logger.
// Назначение — трейсинг пользовательского пути при сетевом взаимодействии
// (fetch к API): начало запроса, успешный ответ, ошибочный ответ, исключение.
//
// Server-only логирование остаётся на Winston (@/lib/logger) и не затрагивается.
// Логи реально отправляются только в production (enableLogs в instrumentation-client).

const { logger } = Sentry;

/**
 * Структурированные атрибуты сетевого лога.
 * Попадают в Sentry Logs как индексируемые поля для фильтрации.
 */
export interface NetworkLogAttributes {
    /** HTTP-метод запроса (GET, POST, ...). */
    method?: string;
    /** HTTP-статус ответа. */
    status?: number;
    /** Длительность запроса в миллисекундах. */
    durationMs?: number;
    /** Логический модуль/поток (payment, quiz, contest, ...). */
    module?: string;
    /** Произвольные доп. атрибуты для фильтрации в Sentry Logs. */
    [key: string]: unknown;
}

/**
 * Логирует начало сетевого запроса (уровень info).
 * @param endpoint Путь/URL запроса (например `/api/v1/payments`)
 * @param attributes Доп. атрибуты (method, module, ...)
 */
export function logRequestStart(endpoint: string, attributes?: NetworkLogAttributes): void {
    logger.info(logger.fmt`Запрос → ${endpoint}`, {
        endpoint,
        phase: 'request',
        ...attributes,
    });
}

/**
 * Логирует успешный ответ сервера (уровень info).
 * @param endpoint Путь/URL запроса
 * @param attributes Доп. атрибуты (status, durationMs, ...)
 */
export function logRequestSuccess(endpoint: string, attributes?: NetworkLogAttributes): void {
    logger.info(logger.fmt`Успех ← ${endpoint}`, {
        endpoint,
        phase: 'success',
        ...attributes,
    });
}

/**
 * Логирует неуспешный, но полученный ответ сервера (уровень warn).
 * Используется когда fetch завершился, но `res.ok === false`.
 * @param endpoint Путь/URL запроса
 * @param attributes Доп. атрибуты (status, error, ...)
 */
export function logRequestFailure(endpoint: string, attributes?: NetworkLogAttributes): void {
    logger.warn(logger.fmt`Неуспешный ответ ← ${endpoint}`, {
        endpoint,
        phase: 'failure',
        ...attributes,
    });
}

/**
 * Логирует сетевую ошибку/исключение (уровень error).
 * Используется в catch-блоке, когда запрос не дошёл до ответа.
 * @param endpoint Путь/URL запроса
 * @param error Пойманное исключение
 * @param attributes Доп. атрибуты (module, ...)
 */
export function logRequestError(
    endpoint: string,
    error: unknown,
    attributes?: NetworkLogAttributes
): void {
    logger.error(logger.fmt`Сетевая ошибка ← ${endpoint}`, {
        endpoint,
        phase: 'error',
        error: error instanceof Error ? error.message : String(error),
        ...attributes,
    });
}
