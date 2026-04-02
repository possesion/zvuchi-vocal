import Script from 'next/script';
import { Metadata } from 'next';
import { Geist, Geist_Mono, Manrope, Exo_2 } from 'next/font/google';
import Metrika from '@/lib/metrika';
import './globals.css';
import { Suspense } from 'react';
import { organizationSchema, localBusinessSchema, educationalOrganizationSchema } from '@/lib/structured-data';
import { CallButton } from '@/components/common/call-button';

export const metadata: Metadata = {
    metadataBase: new URL('https://zvuchi-vocal.ru'),
    title: {
        default: 'ЗВУЧИ - Вокальная студия | Уроки вокала в Москве',
        template: '%s | ЗВУЧИ - Вокальная студия',
    },
    description: 'Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия!',
    keywords: ['вокал', 'уроки вокала', 'вокальная студия', 'пение', 'школа вокала москва'],
    authors: [{ name: 'ЗВУЧИ - Вокальная студия', url: 'https://zvuchi-vocal.ru' }],
    creator: 'Казанцев Геннадий Викторович',
    publisher: 'ЗВУЧИ - Вокальная студия',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.ico',
        apple: '/icon.svg',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        yandex: '7e59eba73c6a74d8',
        google: 'G-80QM6W2Z28',
    },
    other: {
        'yandex-verification': '7e59eba73c6a74d8',
        'geo.region': 'RU-MOW',
        'geo.placename': 'Москва',
    },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["cyrillic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["cyrillic"],
});

const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, localBusinessSchema, educationalOrganizationSchema],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preload" href="/valeria/transparent-lera.png" as="image" />
        <link rel="preload" href="/micro.png" as="image" />
        <link rel="preload" href="/main-image.jpg" as="image" />
        <link rel="dns-prefetch" href="https://s3.twcstorage.ru" />

        {/* Дополнительные мета-теги для SEO */}
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=yes" />

        {/* Структурированные данные для Yandex и Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaData).replace(/</g, '\\u003c'),
          }}
        />

        {/* Google Analytics] */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-80QM6W2Z28"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-80QM6W2Z28');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${exo2.variable} ${geistMono.variable} ${manrope.variable} ${manrope.className} antialiased`}
      >
        {children}

        <Suspense>
          <Metrika />
        </Suspense>
        <CallButton />
      </body>
    </html>
  );
}
