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
                    <Gallery />
                </div>
            </main>
            <Footer />
        </div>
    );
}
