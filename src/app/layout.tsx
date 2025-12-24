import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Exo_2 } from "next/font/google";
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
  title: "ЗВУЧИ - Вокальная студия | Уроки вокала в Москве",
  description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия!",
  keywords: "вокал, Звучи, студия Звучи, уроки вокала, вокальная студия, пение, Москва, EVT, бэлтинг, драйв",
  openGraph: {
    title: "ЗВУЧИ - Вокальная студия",
    description: "Профессиональные уроки вокала в Москве",
    type: "website",
    locale: "ru_RU",
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
        <link rel="dns-prefetch" href="https://s3.twcstorage.ru" />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105392489', 'ym');
              ym(105392489, 'init', {
                ssr:true,
                webvisor:true,
                trackHash:true,
                clickmap:true,
                ecommerce:"dataLayer",
                accurateTrackBounce:true,
                trackLinks:true
              });
            `,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/105392489"
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
      </head>
      <body
        className={`${geistSans.variable} ${exo2.variable} ${geistMono.variable} ${manrope.variable} ${manrope.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
