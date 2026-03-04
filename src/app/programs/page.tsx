import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Programs } from '@/components/sections/programs';
import { generatePageMetadata } from '@/lib/metadata';
import dynamic from 'next/dynamic';

const EnrollmentForm = dynamic(() => import('@/components/forms/enrollment-form'), {
    loading: () => <div className="animate-pulse bg-white/10 rounded-2xl h-64 w-full" />,
});

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
                <section className="main-bg py-16 text-white">
                    <header className="container mb-12 flex flex-col items-center">
                        <div className="flex flex-col justify-center items-center bg-dark px-6 py-4 rounded-sm opacity-85">
                            <h1 className="mb-4 text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                Наши<br />
                                <span className="ml-5">абонементы</span>
                            </h1>
                            <article className="max-w-2xl text-center font-bold md:text-lg">
                                <p className="mb-2">
                                    От джаза до рока — учим петь в любом жанре!
                                </p>
                                <p>
                                    Индивидуальный подход для всех уровней: от нуля до профессионала
                                </p>
                            </article>
                        </div>
                    </header>

                    <Programs />

                    <div className="container mx-auto mt-16 flex justify-center">
                        <EnrollmentForm />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
