import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { instructors } from '@/app/constants';
import { generatePageMetadata } from '@/lib/metadata';
import Link from 'next/link';

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
                <div className="primary-bg py-12">
                    <section className="container text-white">
                        <header className="mb-12 flex flex-col items-center">
                            <div className="w-full mb-8 flex flex-col justify-center items-center bg-dark px-6 py-4 rounded-sm md:mb-12">
                                <h1 className="text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                    Наши<br />
                                    <span className="ml-5">педагоги</span>
                                </h1>
                            </div>
                            <p className="max-w-3xl text-xl text-white/90 md:text-xl">
                                Подберите себе преподавателя по вокалу, фортепиано или гитаре.
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
                        <div className="grid gap-8 md:grid-cols-3 mt-16 backdrop-blur-md">
                            <Link
                                href="/programs"
                                className="group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
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
                </div>
            </main>
            <Footer />
        </div>
    );
}
