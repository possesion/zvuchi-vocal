// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
    dsn: SENTRY_DSN,

    // Полная выборка трейсов в dev, 10% в production — экономия квоты и нагрузки.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    dataCollection: {
        // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
        // userInfo: false,
        // httpBodies: [],
    },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
