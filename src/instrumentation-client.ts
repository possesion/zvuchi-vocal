// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

const IS_PROD = process.env.NODE_ENV === 'production';

Sentry.init({
    dsn: SENTRY_DSN,

    // Полная выборка трейсов в dev, 10% в production — экономия квоты и нагрузки.
    tracesSampleRate: IS_PROD ? 0.1 : 1.0,

    // Structured Logs (раздел Logs в Sentry). Включаем только в production,
    // чтобы не засорять квоту логами с локальной разработки.
    enableLogs: IS_PROD,

    // Пропускаем в Sentry только info и выше: happy-path пользовательского пути
    // (info) виден, при этом отбрасываем шум уровней trace/debug.
    beforeSendLog(log) {
        if (log.level === 'trace' || log.level === 'debug') return null;
        return log;
    },

    dataCollection: {
        // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
        // userInfo: false,
        // httpBodies: [],
    },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
