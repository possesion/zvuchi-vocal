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
  title: "ЗВУЧИ",
  description: "Вокальная студия",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${exo2.variable} ${geistMono.variable} ${manrope.variable} ${manrope.className} antialiased`}
      >
        {/* <Theme accentColor="indigo"> */}
        {children}
        {/* </Theme> */}
      </body>
    </html>
  );
}
