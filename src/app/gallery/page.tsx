import { Metadata } from 'next';
import { headers } from 'next/headers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Gallery } from '@/components/sections/gallery';
import { generatePageMetadata } from '@/lib/metadata';
import dynamic from 'next/dynamic';

const EnrollmentForm = dynamic(() => import('@/components/forms/enrollment-form'), {
    loading: () => <div className="animate-pulse bg-white/10 rounded-2xl h-64 w-full" />,
});

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

import { checkAuth } from '@/lib/auth';

export default async function GalleryPage() {
    const headersList = await headers();
    const isAuthorized = checkAuth(headersList);

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
                        </header>
                        <Gallery isAuthorized={isAuthorized} />
                        <div className="mx-auto mt-16 flex justify-center">
                            <EnrollmentForm />
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
