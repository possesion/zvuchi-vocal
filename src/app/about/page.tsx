import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PromoContent } from '@/components/sections/promo-content';
import { FeatureList } from '@/components/sections/feature-list';
import { generatePageMetadata } from '@/lib/metadata';

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
                <div className="primary-bg py-16">
                    <section className="container py-10 text-white md:py-16">
                        <header className="mb-12 text-center">
                            <h1 className="mb-6 text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                О нашей студии
                            </h1>
                            <p className="mx-auto max-w-3xl text-lg text-white/90 md:text-xl">
                                ЗВУЧИ - это место, где каждый голос находит свое звучание
                            </p>
                        </header>

                        <PromoContent />

                        <h2 className="mt-16 mb-8 text-center text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                            <span className="ml-5">Звучи! – это...</span>
                        </h2>
                        <FeatureList />

                        <section className="mt-16 rounded-sm bg-white/10 p-8 backdrop-blur-md">
                            <h2 className="mb-6 text-3xl font-bold">Наша миссия</h2>
                            <p className="mb-4 text-lg leading-relaxed">
                                Мы верим, что каждый человек обладает уникальным голосом, который заслуживает быть услышанным. 
                                Наша цель - помочь вам раскрыть свой вокальный потенциал, независимо от начального уровня подготовки.
                            </p>
                            <p className="text-lg leading-relaxed">
                                В студии ЗВУЧИ мы используем современные методики обучения, включая EVT (Estill Voice Training), 
                                которые позволяют добиться результатов уже после первого занятия.
                            </p>
                        </section>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
