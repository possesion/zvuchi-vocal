import type { Metadata } from "next";
import Script from 'next/script';
import { Geist, Geist_Mono, Manrope, Exo_2 } from "next/font/google";
import Metrika from '@/lib/metrika';
import "./globals.css";
import { Suspense } from "react";

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
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://zvuchi-vocal.ru/#organization",
      name: "ЗВУЧИ - Вокальная студия",
      alternateName: ["Звучи", "Студия вокала Звучи"],
      url: "https://zvuchi-vocal.ru",
      logo: {
        "@type": "ImageObject",
        url: "https://zvuchi-vocal.ru/zvuchi-cropped.png",
        width: 224,
        height: 64,
        caption: "Логотип вокальной студии ЗВУЧИ"
      },
      image: {
        "@type": "ImageObject",
        url: "https://zvuchi-vocal.ru/main-image.jpg",
        width: 1200,
        height: 630,
        caption: "ЗВУЧИ - Вокальная студия в Москве"
      },
      description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT.",
      telephone: "+7 (977) 967-50-01",
      email: "info@zvuchi-vocal.ru",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Москва",
        addressCountry: "RU",
        addressRegion: "Москва"
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 55.755826,
        longitude: 37.617300
      },
      sameAs: [
        "https://t.me/vlrvally",
        "https://vk.com/zvuchi.vocal",
        "https://www.tiktok.com/@zvuchi.vocal"
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+7 (977) 967-50-01",
          contactType: "customer service",
          availableLanguage: ["Russian"],
          areaServed: "RU"
        }
      ],
      foundingDate: "2025",
    },
    {
      "@type": "WebSite",
      "@id": "https://zvuchi-vocal.ru/#website",
      url: "https://zvuchi-vocal.ru",
      name: "ЗВУЧИ - Вокальная студия",
      description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, современные методики обучения вокалу.",
      publisher: {
        "@id": "https://zvuchi-vocal.ru/#organization"
      },
      inLanguage: "ru-RU",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://zvuchi-vocal.ru/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://zvuchi-vocal.ru/#school",
      name: "ЗВУЧИ - Вокальная студия",
      description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Первое занятие бесплатно!",
      image: [
        "https://zvuchi-vocal.ru/about/about-1.jpg",
      ],
      url: "https://zvuchi-vocal.ru",
      telephone: "+7 (977) 967-50-01",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ленинградский проспект, 34",
        addressLocality: "Москва",
        addressCountry: "RU",
        addressRegion: "Москва",
        postalCode: "101000"
      },
      priceRange: "12800-23900 RUB",
      paymentAccepted: ["Наличные", "Банковская карта", "Перевод"],
      currenciesAccepted: "RUB",
      openingHours: ["Пн-Вс 10:00-22:00"],
      serviceType: "Музыкальное образование",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Абонементы на уроки вокала",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Абонемент на 4 занятия",
            description: "4 индивидуальных урока вокала по 60 минут",
            price: "12800",
            priceCurrency: "RUB",
            priceValidUntil: "2026-12-31",
            itemOffered: {
              "@type": "Service",
              name: "Индивидуальные уроки вокала",
              serviceType: "Музыкальное образование",
              provider: {
                "@id": "https://zvuchi-vocal.ru/#subscriptions"
              }
            }
          },
          {
            "@type": "Offer",
            name: "Абонемент на 6 занятий",
            description: "6 индивидуальных уроков вокала по 60 минут",
            price: "18600",
            priceCurrency: "RUB",
            priceValidUntil: "2026-12-31",
            itemOffered: {
              "@type": "Service",
              name: "Индивидуальные уроки вокала",
              serviceType: "Музыкальное образование",
              provider: {
                "@id": "https://zvuchi-vocal.ru/#subscriptions"
              }
            }
          },
          {
            "@type": "Offer",
            name: "Абонемент на 8 занятий",
            description: "8 индивидуальных уроков вокала по 60 минут",
            price: "23900",
            priceCurrency: "RUB",
            priceValidUntil: "2026-12-31",
            itemOffered: {
              "@type": "Service",
              name: "Индивидуальные уроки вокала",
              serviceType: "Музыкальное образование",
              provider: {
                "@id": "https://zvuchi-vocal.ru/#organization"
              }
            }
          }
        ]
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "50",
        bestRating: "5",
        worstRating: "1"
      }
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Сколько стоят уроки вокала?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Стоимость абонементов: 4 занятия - 12 800₽, 6 занятий - 18 600₽, 8 занятий - 23 900₽. Первое занятие бесплатно!"
          }
        },
        {
          "@type": "Question",
          name: "Где проходят занятия?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Занятия проходят в нашей студии в Москве. Точный адрес уточняйте по телефону +7 (977) 967-50-01."
          }
        }
      ]
    }
  ]
};

export const metadata: Metadata = {
  title: {
    default: "ЗВУЧИ - Вокальная студия | Уроки вокала в Москве",
    template: "%s | ЗВУЧИ - Вокальная студия"
  },
  description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия! ✨ Первое занятие бесплатно",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      new URL('/favicon.ico', 'https://zvuchi-vocal.ru'),
    ],
  },
  keywords: ["вокал", "уроки вокала", "вокальная студия", "пение", "Москва", "EVT", "бэлтинг", "драйв", "Звучи", "студия Звучи"],
  authors: [{ name: "ЗВУЧИ - Вокальная студия", url: "https://zvuchi-vocal.ru" }],
  creator: "Казанцев Геннадий Викторович",
  publisher: "ЗВУЧИ - Вокальная студия",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: 'https://zvuchi-vocal.ru/manifest.json',
  metadataBase: new URL('https://zvuchi-vocal.ru'),
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "ЗВУЧИ - Вокальная студия | Уроки вокала в Москве",
    description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия!",
    type: "website",
    locale: "ru_RU",
    url: "https://zvuchi-vocal.ru",
    siteName: "ЗВУЧИ - Вокальная студия",
    images: [
      {
        url: "/main-image.jpg",
        width: 1200,
        height: 630,
        alt: "ЗВУЧИ - Вокальная студия. Профессиональные уроки вокала в Москве",
        type: "image/jpeg",
      },
      {
        url: "/valeria/transparent-lera.png",
        width: 380,
        height: 760,
        alt: "Валерия - преподаватель вокала студии ЗВУЧИ",
        type: "image/png",
      },
    ],
    videos: [
      {
        url: "https://s3.twcstorage.ru/dd3d1966-zvuchi-media/promo.mp4",
        width: 360,
        height: 640,
        type: "video/mp4",
      },
    ],
  },
  alternates: {
    canonical: "https://zvuchi-vocal.ru",
  },
  verification: {
    yandex: "7e59eba73c6a74d8",
    google: "G-80QM6W2Z28",
  },
  category: "Education",
  classification: "Образование, Музыка, Вокал",
  other: {
    'yandex-verification': '7e59eba73c6a74d8',
    'geo.region': 'RU-MOW',
    'geo.placename': 'Москва',
    'geo.position': '55.755826;37.617300',
    'ICBM': '55.755826, 37.617300',
  },
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
      </body>
    </html>
  );
}
