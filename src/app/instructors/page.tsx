import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { instructors } from '@/app/constants';
import { generatePageMetadata } from '@/lib/metadata';

const VocalInstructor = dynamic(() => import('@/components/sections/vocal-instructor'), {
    loading: () => <div className="animate-pulse bg-white/10 rounded-2xl h-64 w-full" />,
});

export const metadata: Metadata = generatePageMetadata({
    title: 'Наши педагоги',
    description: 'Опытные преподаватели вокала студии ЗВУЧИ. Профессионалы с многолетним опытом, владеющие современными методиками обучения вокалу.',
    path: '/instructors',
    keywords: [
        'преподаватели вокала',
        'педагоги по вокалу москва',
        'учителя пения',
        'вокальные педагоги',
        'опытные преподаватели вокала',
    ],
});

export default function InstructorsPage() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <div className="primary-bg py-16">
                    <section className="container pb-10 text-white md:pb-16">
                        <header className="mb-12 flex flex-col items-center text-center">
                            <div className="w-full mb-8 flex flex-col justify-center items-center bg-dark px-6 py-4 rounded-sm md:mb-12">
                                <h1 className="text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                    Наши<br />
                                    <span className="ml-5">педагоги</span>
                                </h1>
                            </div>
                            <p className="mb-8 max-w-3xl text-lg text-white/90 md:text-xl">
                                За каждым сияющим успехом на сцене стоит вдохновляющий наставник. 
                                Тот, кто превращает голос в магию, а уроки — в путешествие. 
                                Не просто педагоги, а проводники в мир музыки, чьи сердца бьются в ритм с учениками.
                            </p>
                        </header>

                        <div className="container grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-y-12 lg:grid-cols-3">
                            {instructors.map((instructor) => (
                                <VocalInstructor
                                    key={instructor.name}
                                    instructor={instructor}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
