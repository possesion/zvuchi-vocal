import { withSentryConfig } from '@sentry/nextjs/config';
import type { NextConfig } from 'next';

const origins = process.env.NODE_ENV === 'development' ? '192.168.1.*' : '';

const nextConfig: NextConfig = {
    // Enable standalone output for Docker
    output: 'standalone',

    // Winston is a server-only package and relies on dynamic requires that break
    // Turbopack/standalone tracing if bundled. Keep it external to the server bundle.
    serverExternalPackages: ['winston'],

    // Generate unique build ID to prevent Server Action cache issues
    generateBuildId: async () => {
        // Use timestamp for production builds to ensure unique IDs
        // This helps prevent "Failed to find Server Action" errors
        if (process.env.NODE_ENV === 'production') {
            return `${Date.now()}`;
        }
        return 'dev';
    },

    // Development settings
    ...(process.env.NODE_ENV === 'development' && {
        typescript: {
            ignoreBuildErrors: false,
        },
    }),

    // "*" одним сегментом не работает — Next.js явно запрещает wildcard на весь домен.
    // Указываем локальную подсеть, чтобы можно было открывать dev-сервер с телефона в той же Wi-Fi сети.
    allowedDevOrigins: [origins],
    htmlLimitedBots: /.*/,
    // Image optimization
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [32, 48, 64, 96, 128, 256, 384], // Removed 16 (breaking change in v16)
        qualities: [30, 60, 90],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 's3.twcstorage.ru',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'drive.google.com',
                pathname: '/file/**',
            },
            {
                protocol: 'https',
                hostname: 'docs.google.com',
                pathname: '/document/**',
            },
            {
                protocol: 'https',
                hostname: 'mc.yandex.ru',
                pathname: '/watch/105392489',
            },
            {
                protocol: 'https',
                hostname: 'avatars.yandex.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
        minimumCacheTTL: 14400, // Changed from 2678400 to 4 hours (v16 default)
        dangerouslyAllowSVG: true,
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
        unoptimized: false,
    },

    // Performance optimizations
    compress: true,
    poweredByHeader: false,

    // Security headers
    async headers() {
        return [
            // Общие заголовки для статических ресурсов (Next.js сам добавит Content-Type)
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // HTML страницы - короткое кеширование для предотвращения проблем с Server Actions
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                ],
            },
        ];
    },

    // Experimental features
    experimental: {
        serverActions: {
            allowedOrigins: [
                'zvuchi-vocal.ru',
                'www.zvuchi-vocal.ru',
                'localhost:3000',
            ],
            bodySizeLimit: '2mb',
        },
        optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
    },

    // Turbopack configuration (используется по умолчанию в Next.js 16)
    turbopack: {},
};

export default withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: 'zvuchi',

    project: 'javascript-nextjs',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    webpack: {
        // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,

        // Tree-shaking options for reducing bundle size
        treeshake: {
            // Automatically tree-shake Sentry logger statements to reduce bundle size
            removeDebugLogging: true,
        },
    },
});
