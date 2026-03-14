import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PromoContent } from '@/components/sections/promo-content';
import { FeatureList } from '@/components/sections/feature-list';
import { generatePageMetadata } from '@/lib/metadata';
import Link from 'next/link';

export const metadata: Metadata = generatePageMetadata({
    title: 'О нас',
    description: 'Вокальная студия ЗВУЧИ - профессиональное обучение вокалу в Москве. Индивидуальный подход, современные методики, опытные педагоги.',
    path: '/about',
    keywords: [
        'о вокальной студии',
        'школа вокала москва',
        'обучение вокалу',
        'методика EVT',
        'профессиональные педагоги вокала',
    ],
});

export default function AboutPage() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <div className="primary-bg">
                    <section className="container py-12 text-white">
                        <header className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                TL;DR
                            </h1>
                        </header>

                        <PromoContent />

                        <h2 className="mt-16 text-center text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                            <span className="ml-5">Звучи! – это...</span>
                        </h2>
                        <FeatureList />

                        <section className='mt-16 backdrop-blur-md'>
                            <div className="grid gap-8 md:grid-cols-3">
                                <Link
                                    href="/instructors"
                                    className="group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
                                >
                                    <h3 className="mb-4 text-2xl font-bold">Наши педагоги</h3>
                                    <p className="text-white/80">
                                        Познакомьтесь с нашими опытными преподавателями
                                    </p>
                                </Link>
                                <Link
                                    href="/programs"
                                    className="hidden group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 sm:block"
                                >
                                    <h3 className="mb-4 text-2xl font-bold">Абонементы</h3>
                                    <p className="text-white/80">
                                        Выберите подходящую программу обучения
                                    </p>
                                </Link>
                                <Link
                                    href="/gallery"
                                    className="hidden group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 sm:block"
                                >
                                    <h3 className="mb-4 text-2xl font-bold">Галерея</h3>
                                    <p className="text-white/80">
                                        Посмотрите фото и видео из жизни студии
                                    </p>
                                </Link>
                            </div>
                            {/* <h2 className="mb-6 text-3xl font-bold">Наша миссия</h2>
                            <p className="mb-4 text-lg leading-relaxed">
                                Мы верим, что каждый человек обладает уникальным голосом, который заслуживает быть услышанным. 
                                Наша цель - помочь вам раскрыть свой вокальный потенциал, независимо от начального уровня подготовки.
                            </p>
                            <p className="text-lg leading-relaxed">
                                В студии ЗВУЧИ мы используем современные методики обучения, включая EVT (Estill Voice Training), 
                                которые позволяют добиться результатов уже после первого занятия.
                            </p> */}
                        </section>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
