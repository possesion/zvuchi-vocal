import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Gallery } from '@/components/sections/gallery';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
    title: 'Галерея',
    description: 'Фотографии и видео из жизни вокальной студии ЗВУЧИ. Концерты, мастер-классы, занятия и выступления наших учеников.',
    path: '/gallery',
    keywords: [
        'фото вокальной студии',
        'концерты вокальной студии',
        'выступления учеников',
        'галерея звучи',
        'видео уроков вокала',
    ],
});

export default function GalleryPage() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <div className="primary-bg py-12">
                    <section className='container text-white'>
                        <header className="flex flex-col items-center">
                            <div className="w-full mb-8 flex flex-col justify-center items-center bg-dark px-6 py-4 rounded-sm opacity-85 md:mb-12">
                                <h1 className="text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                    Жизнь<br />
                                    <span className="ml-5">студии</span>
                                </h1>
                            </div>
                            <p className="max-w-3xl text-xl text-white/90 md:text-2xl">
                            Фото с концертов, музыкальные распевки и отзывы
                            </p>
                        </header>
                    <Gallery />
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
