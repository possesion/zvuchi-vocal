import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Programs } from '@/components/sections/programs';
import { generatePageMetadata } from '@/lib/metadata';
import Link from 'next/link';

export const metadata: Metadata = generatePageMetadata({
    title: 'Абонементы и цены',
    description: 'Абонементы на уроки вокала в студии ЗВУЧИ. Гибкие программы обучения, индивидуальный подход. От джаза до рока - учим петь в любом жанре!',
    path: '/programs',
    keywords: [
        'абонементы на вокал',
        'цены на уроки вокала',
        'стоимость обучения вокалу',
        'программы обучения вокалу',
        'курсы вокала цены',
    ],
});

export default function ProgramsPage() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <section className="main-bg py-12 text-white">
                    <header className="container mb-12 flex flex-col items-center">
                        <div className="w-full flex flex-col justify-center items-center bg-dark px-6 py-4 rounded-sm opacity-85">
                            <h1 className="mb-4 text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                Наши<br />
                                <span className="ml-5">абонементы</span>
                            </h1>
                            <article className="max-w-2xl text-center font-bold md:text-lg">
                                <p className="mb-2">
                                    От джаза до рока — учим петь в любом жанре!
                                </p>
                            </article>
                        </div>
                    </header>
                    <Programs />
                    <div className="container grid gap-8 md:grid-cols-3 mt-16 backdrop-blur-md">
                            <Link
                                href="/gallery"
                                className="group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
                            >
                                <h3 className="mb-4 text-2xl font-bold">Больше интересного контента</h3>
                                <p className="text-white/80">
                                    Посмотрите фото и видео из жизни студии
                                </p>
                            </Link>
                            <Link
                                href="/programs"
                                className="hidden group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 sm:block"
                            >
                                <h3 className="mb-4 text-2xl font-bold">Знания</h3>
                                <p className="text-white/80">
                                    Узнайте больше про вокальные техники
                                </p>
                            </Link>
                            <Link
                                href="/contacts"
                                className="hidden group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 sm:block"
                            >
                                <h3 className="mb-4 text-2xl font-bold">Контакты</h3>
                                <p className="text-white/80">
                                    Адрес студии и отзывы
                                </p>
                            </Link>

                        </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
