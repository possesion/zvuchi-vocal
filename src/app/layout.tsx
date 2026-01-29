import type { Metadata } from "next";
import Image from 'next/image';
import Script from 'next/script';
import { Geist, Geist_Mono, Manrope, Exo_2 } from "next/font/google";
import { YandexMetrica } from '@/components/analytics/yandex-metrica';
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "ЗВУЧИ - Вокальная студия | Уроки вокала в Москве",
    template: "%s | ЗВУЧИ - Вокальная студия"
  },
  description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия! ✨ Первое занятие бесплатно",
  keywords: ["вокал", "уроки вокала", "вокальная студия", "пение", "Москва", "EVT", "бэлтинг", "драйв", "Звучи", "студия Звучи"],
  authors: [{ name: "ЗВУЧИ - Вокальная студия", url: "https://zvuchi-vocal.ru" }],
  creator: "ЗВУЧИ - Вокальная студия",
  publisher: "ЗВУЧИ - Вокальная студия",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  twitter: {
    card: "summary_large_image",
    site: "@zvuchi_vocal",
    creator: "@zvuchi_vocal",
    title: "ЗВУЧИ - Вокальная студия | Уроки вокала в Москве",
    description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT.",
    images: ["/main-image.jpg"],
  },
  alternates: {
    canonical: "https://zvuchi-vocal.ru",
  },
  verification: {
    yandex: "7e59eba73c6a74d8",
    google: "google-site-verification-code", // Добавьте код верификации Google
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
        <link rel="canonical" href="https://zvuchi-vocal.ru" />
        
        {/* Дополнительные мета-теги для SEO */}
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=yes" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />

        {/* Структурированные данные для Yandex и Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://zvuchi-vocal.ru/#organization",
                  "name": "ЗВУЧИ - Вокальная студия",
                  "alternateName": ["Звучи", "Студия вокала Звучи"],
                  "url": "https://zvuchi-vocal.ru",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://zvuchi-vocal.ru/zvuchi-cropped.png",
                    "width": 224,
                    "height": 64,
                    "caption": "Логотип вокальной студии ЗВУЧИ"
                  },
                  "image": {
                    "@type": "ImageObject",
                    "url": "https://zvuchi-vocal.ru/main-image.jpg",
                    "width": 1200,
                    "height": 630,
                    "caption": "ЗВУЧИ - Вокальная студия в Москве"
                  },
                  "description": "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT.",
                  "telephone": "+7 (977) 967-50-01",
                  "email": "info@zvuchi-vocal.ru",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Москва",
                    "addressCountry": "RU",
                    "addressRegion": "Москва"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 55.755826,
                    "longitude": 37.617300
                  },
                  "sameAs": [
                    "https://t.me/zvuchivocal",
                    "https://vk.com/zvuchi.vocal",
                    "https://www.tiktok.com/@zvuchi.vocal"
                  ],
                  "contactPoint": [
                    {
                      "@type": "ContactPoint",
                      "telephone": "+7 (977) 967-50-01",
                      "contactType": "customer service",
                      "availableLanguage": ["Russian"],
                      "areaServed": "RU"
                    }
                  ],
                  "foundingDate": "2020",
                  "numberOfEmployees": "5-10"
                },
                {
                  "@type": "WebSite",
                  "@id": "https://zvuchi-vocal.ru/#website",
                  "url": "https://zvuchi-vocal.ru",
                  "name": "ЗВУЧИ - Вокальная студия",
                  "description": "Профессиональные уроки вокала в Москве",
                  "publisher": {
                    "@id": "https://zvuchi-vocal.ru/#organization"
                  },
                  "inLanguage": "ru-RU",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://zvuchi-vocal.ru/?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "EducationalOrganization",
                  "@id": "https://zvuchi-vocal.ru/#school",
                  "name": "ЗВУЧИ - Вокальная студия",
                  "description": "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT.",
                  "url": "https://zvuchi-vocal.ru",
                  "telephone": "+7 (977) 967-50-01",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Москва",
                    "addressCountry": "RU",
                    "addressRegion": "Москва"
                  },
                  "priceRange": "12800-23900 RUB",
                  "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
                  "currenciesAccepted": "RUB",
                  "openingHours": ["Mo-Su 10:00-22:00"],
                  "serviceType": "Музыкальное образование",
                  "educationalCredentialAwarded": "Сертификат об окончании курса вокала",
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Абонементы на уроки вокала",
                    "itemListElement": [
                      {
                        "@type": "Offer",
                        "name": "Абонемент на 4 занятия",
                        "description": "4 индивидуальных урока вокала по 60 минут",
                        "price": "12800",
                        "priceCurrency": "RUB",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2024-01-01",
                        "priceValidUntil": "2024-12-31",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "Индивидуальные уроки вокала",
                          "serviceType": "Музыкальное образование",
                          "provider": {
                            "@id": "https://zvuchi-vocal.ru/#organization"
                          }
                        }
                      },
                      {
                        "@type": "Offer",
                        "name": "Абонемент на 6 занятий",
                        "description": "6 индивидуальных уроков вокала по 60 минут",
                        "price": "18600",
                        "priceCurrency": "RUB",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2024-01-01",
                        "priceValidUntil": "2024-12-31",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "Индивидуальные уроки вокала",
                          "serviceType": "Музыкальное образование",
                          "provider": {
                            "@id": "https://zvuchi-vocal.ru/#organization"
                          }
                        }
                      },
                      {
                        "@type": "Offer",
                        "name": "Абонемент на 8 занятий",
                        "description": "8 индивидуальных уроков вокала по 60 минут",
                        "price": "23900",
                        "priceCurrency": "RUB",
                        "availability": "https://schema.org/InStock",
                        "validFrom": "2024-01-01",
                        "priceValidUntil": "2024-12-31",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "Индивидуальные уроки вокала",
                          "serviceType": "Музыкальное образование",
                          "provider": {
                            "@id": "https://zvuchi-vocal.ru/#organization"
                          }
                        }
                      }
                    ]
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "5.0",
                    "reviewCount": "50",
                    "bestRating": "5",
                    "worstRating": "1"
                  }
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "Главная",
                      "item": "https://zvuchi-vocal.ru"
                    }
                  ]
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "Сколько стоят уроки вокала?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Стоимость абонементов: 4 занятия - 12800₽, 6 занятий - 18600₽, 8 занятий - 23900₽. Первое занятие бесплатно!"
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Где проходят занятия?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Занятия проходят в нашей студии в Москве. Точный адрес уточняйте по телефону +7 (977) 967-50-01."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />

        {/* Yandex.Metrica noscript */}
        <noscript>
          <div>
            <Image
              src="https://mc.yandex.ru/watch/105392489"
              style={{ position: 'absolute', left: '-9999px' }}
              alt="Yandex Metrica"
              height={1}
              width={1}
            />
          </div>
        </noscript>

        {/* Google Analytics (добавьте свой ID) */}
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
        <YandexMetrica />
        {children}
        
        {/* Yandex.Metrica Script */}
        <Script id="yandex-metrica" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');
            
            ym(105392489, 'init', {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true,
              trackHash:true,
              ecommerce:"dataLayer"
            });
          `}
        </Script>
      </body>
    </html>
  );
}
