

import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import '@radix-ui/themes/styles.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Socials } from '@/components/common/socials';
import { SOCIAL_ICON_SIZE } from '@/components/common/constants';
import { EnrollmentSection } from '@/components';
import { FeatureList } from '@/components/sections/feature-list';

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

export default function Home() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                {/* Hero Section */}
                <div className="primary-bg">
                    <Socials
                        size={SOCIAL_ICON_SIZE.sm}
                        className="container mx-auto hidden justify-end gap-x-1 pt-2 md:flex md:gap-x-2"
                    />
                    <section className="container mx-auto flex h-[100svh] sm:h-screen">
                        <div className="relative z-10 flex w-full justify-center">
                            <div className="absolute bottom-0 left-60 z-50 hidden lg:block">
                                <Image
                                    src="/micro.png"
                                    width={180}
                                    height={500}
                                    priority
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                    alt="Микрофон"
                                />
                                <div className="pointer-events-none h-14 w-9 absolute left-21 top-5 mic-shadow animate-blurred-fade-in" aria-hidden="true"></div>
                                <div className="pointer-events-none h-3 w-24 absolute left-13 bottom-5 stand-shadow animate-blurred-fade-in" aria-hidden="true"></div>
                            </div>
                            <Image
                                src="/valeria/transparent-lera.png"
                                className="absolute bottom-0 right-[10%] z-50 h-auto w-[252px] object-contain drop-shadow-2xl sm:w-[320px] md:w-[320px] lg:w-[340px] xl:w-[360px] [@media(max-height:600px)_and_(orientation:landscape)]:hidden"
                                width={252}
                                height={760}
                                sizes="(max-width: 640px) 252px, (max-width: 768px) 320px, (max-width: 1024px) 340px, 360px"
                                quality={90}
                                priority
                                alt="Валерия - преподаватель вокала"
                            />
                            <div className="z-51 flex flex-col gap-y-6 p-8 lg:justify-start xl:gap-y-9">
                                <h1 className="rotate-z-2 hidden hero-title bg-dark rounded-sm shadow-lg w-min px-5 py-3 text-2xl font-bold text-white sm:w-[210px] sm:text-4xl xl:w-[350px] md:block xl:text-7xl">
                                    ШКОЛА<br />
                                    <span className="ml-4">ВОКАЛА</span>
                                </h1>
                                <div className="hidden typing-animation mx-auto shrink-0 overflow-hidden text-nowrap pr-3 text-2xl font-bold text-white xl:text-5xl">
                                    Пусть тебя
                                    <span className="text-primary"> УСЛЫШАТ!</span>
                                </div>
                                <div className="w-76 text-2xl text-white md:w-[500px] lg:block lg:text-3xl">
                                    <p>Голос изменится после первого занятия!</p>
                                    Услышишь разницу <b>до</b> и <b className="after-highlight">после</b>.
                                    Проверь — это работает!
                                </div>
                                <div className="mt-auto sm:m-0 pl-6 lg:pl-12">
                                    <EnrollmentSection main />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Features Section */}
                <div className="primary-bg py-16">
                    <section className="container text-white">
                        <h2 className="mb-12 text-center text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-6xl">
                            <span className="ml-5">Звучи! – это...</span>
                        </h2>
                        <FeatureList />

                        <div className="mt-16 text-center">
                            <Link
                                href="/about"
                                className="inline-block rounded-sm bg-brand px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-brand/90"
                            >
                                Узнать больше о нас
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Quick Links Section */}
                <section className="main-bg py-16 text-white">
                    <div className="container">
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
                                className="group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
                            >
                                <h3 className="mb-4 text-2xl font-bold">Абонементы</h3>
                                <p className="text-white/80">
                                    Выберите подходящую программу обучения
                                </p>
                            </Link>

                            <Link
                                href="/gallery"
                                className="group rounded-sm bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
                            >
                                <h3 className="mb-4 text-2xl font-bold">Галерея</h3>
                                <p className="text-white/80">
                                    Посмотрите фото и видео из жизни студии
                                </p>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
