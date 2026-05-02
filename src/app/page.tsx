

import Image from 'next/image';
import { Metadata } from 'next';
import '@radix-ui/themes/styles.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Socials } from '@/components/common/socials';
import { SOCIAL_ICON_SIZE } from '@/components/common/constants';
import { EnrollmentSection, FeatureList } from '@/components';
import { contacts } from './constants';
import { getLatestNews } from '@/lib/db';
import { NewsFeed } from '@/components/sections/news/news-feed';
import { NewsAddForm } from './news-add-form';
import { checkAuth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Faq } from '@/components/sections/faq';

export const metadata: Metadata = {
    title: 'ЗВУЧИ - Вокальная студия | Уроки вокала в Москве',
    description: 'Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия!',
    keywords: ['вокал', 'уроки вокала', 'вокальная студия', 'пение', 'школа вокала для взрослых', 'школа вокала москва', 'уроки пения'],
    metadataBase: new URL('https://zvuchi-vocal.ru'),
    alternates: {
        canonical: 'https://zvuchi-vocal.ru/',
    },
    openGraph: {
        title: 'ЗВУЧИ - Вокальная студия | Уроки вокала в Москве',
        description: 'Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия!',
        type: 'website',
        locale: 'ru_RU',
        url: 'https://zvuchi-vocal.ru',
        siteName: 'ЗВУЧИ - Вокальная студия',
        images: [
            {
                url: '/main-image.jpg',
                width: 1200,
                height: 630,
                alt: 'ЗВУЧИ - Вокальная студия. Профессиональные уроки вокала в Москве',
            },
        ],
    },
};

export default async function Home() {
    const news = getLatestNews(5);
    const headersList = await headers();
    const isAuthorized = checkAuth(headersList);
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <div className="primary-bg">
                    <Socials
                        links={contacts}
                        size={SOCIAL_ICON_SIZE.sm}
                        sendAnalytics
                        className="container mx-auto hidden justify-end gap-x-1 pt-2 md:flex md:gap-x-2"
                    />
                    <section className="container mx-auto flex h-[100svh] sm:h-min">
                        <div className="relative z-10 flex flex-col items-center w-full sm:justify-center sm:pt-14 sm:flex-row">
                            <div className="z-51 mb-auto flex flex-col gap-y-6 lg:justify-start xl:gap-y-7">
                                {/* <h1 className="rotate-z-2 hidden hero-title bg-dark rounded-sm shadow-lg w-min px-5 py-3 text-2xl font-bold text-white sm:w-[210px] sm:text-4xl xl:w-[350px] md:block xl:text-7xl">
                                    ШКОЛА<br />
                                    <span className="ml-4">ВОКАЛА</span>
                                </h1> */}
                                <div className="w-full px-2 pt-6 text-xl text-center text-white md:w-[630px] md:text-2xl lg:block lg:text-3xl">
                                    <p>Красиво петь может каждый! </p>
                                    Ставим правильную технику и достигаем высоких <a href='/gallery' className="after-highlight">результатов</a>
                                </div>
                                <div className="absolute bottom-36 sm:static sm:m-0">
                                    <EnrollmentSection />
                                </div>
                            </div>
                            <Image
                                src="/valeria/transparent-lera.png"
                                className="bottom-0 right-[15%] z-50 h-auto w-[252px] object-contain drop-shadow-2xl sm:right-[5%] sm:w-[320px] md:w-[320px] lg:w-[340px] xl:w-[360px] 3xl:w-[500px] [@media(max-height:600px)_and_(orientation:landscape)]:hidden"
                                width={252}
                                height={760}
                                sizes="(max-width: 640px) 252px, (max-width: 768px) 320px, (max-width: 1024px) 340px, 360px"
                                quality={90}
                                priority
                                alt="Валерия - преподаватель вокала"
                            />
                        </div>
                    </section>
                </div>

                <section className="main-bg min-h-screen py-12 text-white">
                    <div className="container">
                        <div className='mb-8 md:mb-12'>
                            <h2 className="text-center text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                                Звучи! – это...
                            </h2>                         
                        </div>
                        <FeatureList />
                    </div>
                    {isAuthorized && (
                        <div className="container pt-8">
                            <NewsAddForm />
                        </div>
                    )}
                    <Faq />
                    <NewsFeed posts={news} isAuthorized={isAuthorized} />
                </section>
            </main>
            <Footer />
        </div>
    );
}
