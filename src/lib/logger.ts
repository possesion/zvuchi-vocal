import { createLogger as createWinstonLogger, format, transports } from 'winston';
import type { Logger } from 'winston';

// ─── Server-only structured logger (Winston) ────────────────────────────────
//
// Пишет структурированные логи в stdout:
//   • production  → JSON (готово для Promtail → Loki → Grafana)
//   • development → цветной читаемый формат с таймстампом
//
// Winston несовместим с браузером/edge — модуль строго server-only.
// Клиентский код использует @sentry/nextjs напрямую.

const SERVICE_NAME = 'vocal-school';

export interface CreateLoggerOptions {
    /** Окружение. По умолчанию process.env.NODE_ENV. */
    env?: string;
    /** Уровень логирования. По умолчанию LOG_LEVEL ?? (isProd ? 'info' : 'debug'). */
    level?: string;
}

/**
 * Тестируемая фабрика логгера без побочного эффекта singleton.
 * @param options env/level для инъекции окружения в тестах
 * @returns новый экземпляр Winston Logger
 */
export function createLogger(options?: CreateLoggerOptions): Logger {
    const env = options?.env ?? process.env.NODE_ENV ?? 'development';
    const isProd = env === 'production';
    const level =
        options?.level ?? process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug');

    // production: машиночитаемый JSON; development: цветной pretty-вывод.
    const logFormat = isProd
        ? format.combine(format.timestamp(), format.json())
        : format.combine(
              format.colorize(),
              format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              format.printf(({ level, message, timestamp, module, ...meta }) => {
                  const modulePart = module ? ` [${module}]` : '';
                  const rest = Object.keys(meta).filter(
                      key => key !== 'service' && key !== 'env'
                  );
                  const metaPart = rest.length
                      ? ` ${JSON.stringify(
                            rest.reduce<Record<string, unknown>>((acc, key) => {
                                acc[key] = meta[key];
                                return acc;
                            }, {})
                        )}`
                      : '';
                  return `${timestamp} ${level}${modulePart}: ${message}${metaPart}`;
              })
          );

    return createWinstonLogger({
        level,
        format: logFormat,
        defaultMeta: { service: SERVICE_NAME, env },
        transports: [new transports.Console()],
    });
}

// ─── Singleton ──────────────────────────────────────────────────────────────

let loggerInstance: Logger | null = null;

/**
 * Возвращает единственный (singleton) экземпляр логгера, создавая его при
 * первом обращении.
 */
export function getLogger(): Logger {
    if (!loggerInstance) {
        loggerInstance = createLogger();
    }
    return loggerInstance;
}

/** Singleton-логгер для прямого использования в серверном коде. */
export const logger: Logger = getLogger();

/**
 * Создаёт child-логгер, добавляющий поле `module` в каждую запись.
 * Наследует уровень и формат от singleton-логгера.
 * @param module имя модуля (заменяет строковые префиксы вида `[Alfa CRM]`)
 */
export function createModuleLogger(module: string): Logger {
    return getLogger().child({ module });
}
