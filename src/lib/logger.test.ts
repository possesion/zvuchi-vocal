import { describe, it, expect, afterEach, vi } from 'vitest';
import { Writable } from 'node:stream';
import { transports } from 'winston';
import type { Logger } from 'winston';
import { createLogger, createModuleLogger } from './logger';

/**
 * Перенаправляет вывод логгера в in-memory поток и возвращает собранные строки.
 * Формат задан на уровне логгера, поэтому Stream-транспорт наследует его.
 */
function captureOutput(logger: Logger): { lines: () => string[] } {
    const chunks: string[] = [];
    const stream = new Writable({
        write(chunk, _enc, cb) {
            chunks.push(chunk.toString());
            cb();
        },
    });
    logger.clear();
    logger.add(new transports.Stream({ stream }));
    return { lines: () => chunks.join('').split('\n').filter(Boolean) };
}

async function flush(): Promise<void> {
    await new Promise(resolve => setImmediate(resolve));
}

describe('createLogger — уровень по окружению', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('использует info в production по умолчанию', () => {
        const logger = createLogger({ env: 'production' });
        expect(logger.level).toBe('info');
    });

    it('использует debug в development по умолчанию', () => {
        const logger = createLogger({ env: 'development' });
        expect(logger.level).toBe('debug');
    });

    it('приоритезирует LOG_LEVEL над дефолтом окружения', () => {
        vi.stubEnv('LOG_LEVEL', 'warn');
        const logger = createLogger({ env: 'production' });
        expect(logger.level).toBe('warn');
    });

    it('явный level в опциях переопределяет всё', () => {
        vi.stubEnv('LOG_LEVEL', 'warn');
        const logger = createLogger({ env: 'production', level: 'error' });
        expect(logger.level).toBe('error');
    });
});

describe('createLogger — production JSON', () => {
    it('пишет JSON с полями timestamp, level, message, service, env', async () => {
        const logger = createLogger({ env: 'production' });
        const { lines } = captureOutput(logger);

        logger.info('Contestant created', { id: 42 });
        await flush();

        const [line] = lines();
        const entry = JSON.parse(line);
        expect(entry.level).toBe('info');
        expect(entry.message).toBe('Contestant created');
        expect(entry.service).toBe('vocal-school');
        expect(entry.env).toBe('production');
        expect(entry.id).toBe(42);
        expect(typeof entry.timestamp).toBe('string');
    });
});

describe('createModuleLogger', () => {
    it('добавляет поле module в каждую запись', async () => {
        // Singleton работает в NODE_ENV=test → нужен JSON-парсинг только при prod.
        // Проверяем факт наличия поля module через child API напрямую.
        const child = createModuleLogger('contest');
        const { lines } = captureOutput(child);

        child.info('created', { id: 7 });
        await flush();

        const output = lines().join('');
        expect(output).toContain('contest');
    });
});
