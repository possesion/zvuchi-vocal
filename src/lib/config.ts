export const config = {
    site: {
        name: process.env.NEXT_PUBLIC_SITE_NAME || 'ЗВУЧИ',
        description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Вокальная студия',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api/v1'
    },

    organization: {
        ogrnip: process.env.OGRNIP || '325774600433742',
        inn: process.env.INN || '770600435102',
        email: process.env.ORGANIZATION_EMAIL || 'info@zvuchi-vocal.ru',
        telegram: process.env.TG_CHAT_URL || 'https://t.me/vlrvally'
    },

    payments: {
        tochka: {
            clientId: process.env.TOCHKA_CLIENT_ID || '',
            clientSecret: process.env.TOCHKA_CLIENT_SECRET || '',
            webhookSecret: process.env.TOCHKA_WEBHOOK_SECRET || '',
            paymentUrl: process.env.TOCHKA_PAYMENT_URL || 'https://enter.tochka.com/uapi/acquiring/v1.0/payments',
            refreshAccess: process.env.TOCHKA_REFRESH_ACCESS || 'https://enter.tochka.com/connect/token',
            accessTokenStatus: process.env.TOCHKA_ACCESS_TOKEN_STATUS || 'https://enter.tochka.com/connect/introspect'
        }
    },

    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        fromName: process.env.SMTP_FROM_NAME || 'ЗВУЧИ',
        fromEmail: process.env.SMTP_FROM_EMAIL || 'info@zvuchi-vocal.ru'
    },

    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@zvuchi-vocal.ru',
        phone: process.env.ADMIN_PHONE || '+7-xxx-xxx-xx-xx'
    },

    security: {
        nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
        nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
    },

    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(','),
        uploadDir: process.env.UPLOAD_DIR || './uploads'
    },

    analytics: {
        googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
        yandexMetricaId: process.env.YANDEX_METRICA_ID || ''
    },

    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
} as const

export type Config = typeof config
