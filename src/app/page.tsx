

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { instructors } from './constants'
import '@radix-ui/themes/styles.css'
import { Programs } from '@/components/sections/programs'
import { FeatureList } from '@/components/sections/feature-list'
import { Header } from '@/components/layout/header'
import { Contacts } from '@/components/sections/contacts'
import { Gallery } from '@/components/sections/gallery'
import { PromoContent } from '@/components/sections/promo-content'
import { Socials } from '@/components/common/socials'
import { SOCIAL_ICON_SIZE } from '@/components/common/constants'
import { Footer } from '@/components/layout/footer'
import { EnrollmentSection } from '@/components'
import { Metadata } from 'next'

const EnrollmentForm = dynamic(() => import('@/components/forms/enrollment-form'), {
    loading: () => <div className="animate-pulse bg-white/10 rounded-2xl h-64 w-full" />,
})
const VocalInstructor = dynamic(() => import('@/components/sections/vocal-instructor'), {
    loading: () => <div className="animate-pulse bg-white/10 rounded-2xl h-64 w-full" />,
})

export const metadata: Metadata = {
    title: {
        default: "ЗВУЧИ - Вокальная студия | Уроки вокала в Москве",
        template: "%s | ЗВУЧИ - Вокальная студия"
    },
    description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия!",
    icons: {
        icon: [
            { url: '/favicon.ico' },
            new URL('/favicon.ico', 'https://zvuchi-vocal.ru'),
        ],
    },
    keywords: ["вокал", "уроки вокала", "вокальная студия", "пение", "школа вокала для взрослых", "школа вокала москва", "уроки пения"],
    authors: [{ name: "ЗВУЧИ - Вокальная студия", url: "https://zvuchi-vocal.ru" }],
    creator: "Казанцев Геннадий Викторович",
    publisher: "ЗВУЧИ - Вокальная студия",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    manifest: 'https://zvuchi-vocal.ru/manifest.json',
    metadataBase: new URL('https://zvuchi-vocal.ru'),
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: "ЗВУЧИ - Вокальная студия | Уроки вокала в Москве",
        description: "Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия!",
        type: "website",
        locale: "ru_RU",
        url: "https://zvuchi-vocal.ru",
        siteName: "ЗВУЧИ - Вокальная студия",
        images: [
            {
                url: "/main-image.jpg",
                width: 1200,
                height: 630,
                alt: "ЗВУЧИ - Вокальная студия. Профессиональные уроки вокала в Москве",
                type: "image/jpeg",
            },
            {
                url: "/valeria/transparent-lera.png",
                width: 380,
                height: 760,
                alt: "Валерия - преподаватель вокала студии ЗВУЧИ",
                type: "image/png",
            },
        ],
        videos: [
            {
                url: "https://s3.twcstorage.ru/dd3d1966-zvuchi-media/promo.mp4",
                width: 360,
                height: 640,
                type: "video/mp4",
            },
        ],
    },
    alternates: {
        canonical: "https://zvuchi-vocal.ru/",
    },
    verification: {
        yandex: "7e59eba73c6a74d8",
        google: "G-80QM6W2Z28",
    },
    category: "Education",
    classification: "Образование, Музыка, Вокал",
    other: {
        'yandex-verification': '7e59eba73c6a74d8',
        'geo.region': 'RU-MOW',
        'geo.placename': 'Москва',
        'geo.position': '55.755826;37.617300',
        'ICBM': '55.755826, 37.617300',
    },
};

export default function Home() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <div className="primary-bg">
                    {/* <Image
                        src="/banner-top.png"
                        className="hidden object-cover w-full h-[100px] shadow-lg sm:block"
                        width={1280}
                        height={100}
                        alt="подарок"
                    /> */}
                    <Socials
                        size={SOCIAL_ICON_SIZE.sm}
                        className="container mx-auto hidden justify-end gap-x-1 pt-2 md:flex md:gap-x-2"
                    />
                    <section className="container mx-auto flex h-[100svh] sm:h-screen">
                        <div className="relative z-10 flex w-full justify-center">
                            <div className="absolute bottom-0 left-60 z-50 hidden lg:block">
                                <Image
                                    src="/micro.png"
                                    className=""
                                    width={180}
                                    height={500}
                                    priority
                                    placeholder="blur"
                                    blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
                                    alt="Микрофон"
                                />
                                {/* тень микрофон */}
                                <div className="pointer-events-none h-14 w-9 absolute left-21 top-5 mic-shadow animate-blurred-fade-in" aria-hidden="true"></div>
                                <div className="pointer-events-none h-3 w-24 absolute left-13 bottom-5 stand-shadow animate-blurred-fade-in" aria-hidden="true"></div>
                            </div>
                            <Image
                                src="/valeria/transparent-lera.png"
                                className="absolute bottom-0 right-[10%] z-50 h-auto w-[252px] object-contain drop-shadow-2xl sm:w-[320px] md:w-[320px] lg:w-[340px] xl:w-[360px] [@media(max-height:600px)_and_(orientation:landscape)]:hidden"
                                width={252}
                                height={760}
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
                                <div className=" w-76 text-2xl text-white md:w-[500px] lg:block lg:text-3xl">
                                    <p>Голос изменится после первого занятия!</p>
                                    Услышишь разницу <b>до</b> и <b className="after-highlight">после</b>.
                                    Проверь — это работает!
                                </div>
                                {/* всплывающее окно для акций - десктоп */}
                                <div className="mt-auto sm:m-0 pl-6 lg:pl-12">
                                    <EnrollmentSection main />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* About Section */}
                <div className="primary-bg py-6">
                    <section
                        id="about"
                        className="container py-10 text-white md:py-16"
                    >
                        <PromoContent />
                        <h2 className="text-center text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                            <span className="ml-5">Звучи! – это...</span>
                        </h2>
                        <FeatureList />
                    </section>

                    {/* Instructors Section */}
                    <section className="pb-10 text-white md:pb-16">
                        <header className="container px-4 mb-4 flex flex-col items-center text-center md:mb-8">

                            <div className='w-full flex flex-col justify-center items-center bg-dark mb-8 px-6 py-4 rounded-sm md:mb-12 '>
                                <h3 className="text-left text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                                    Наши<br />
                                    <span className="ml-5">педагоги</span>
                                </h3>
                            </div>
                            {/* <p className='mb-6 text-white font-semibold indent-5 md:mb-3'>
                                За каждым сияющим успехом на сцене стоит вдохновляющий наставник. Тот, кто превращает голос в магию, а уроки — в путешествие. Не просто педагоги, а проводники в мир музыки, чьи сердца бьются в ритм с учениками.
                            </p> */}
                            <div id="instructors" className="container grid grid-cols-1 gap-8 grid-off sm:grid-cols-2 lg:gap-y-12 lg:grid-cols-3">
                                {instructors.map((instructor) => {
                                    return (
                                        <VocalInstructor
                                            key={instructor.name}
                                            instructor={instructor}
                                        />
                                    )
                                })}
                            </div>
                            <div className="mx-auto mt-8 mb-10 flex justify-center lg:mt-16">
                                <EnrollmentForm />
                            </div>
                        </header>
                    </section>
                </div>

                <Gallery />
                {/* Programs Section */}
                <section id="subscriptions" className="main-bg py-10 text-white lg:py-16">
                    <header className="container mb-10 flex flex-col items-center md:mb-8">
                        <div className='flex flex-col justify-center items-center bg-dark px-4 py-4 rounded-sm opacity-85'>
                            <h3 className="mb-4 text-left text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                                Наши<br />
                                <span className="ml-5">абонементы</span>
                            </h3>
                            <article className='max-w-2xl text-center font-bold sm:text-left md:pl-6'>
                                <p className="text-center">
                                    От джаза до рока — учим петь в любом жанре!
                                </p>
                                <p>Индивидуальный подход для всех уровней: от нуля
                                    до профессионала
                                </p>
                            </article>

                        </div>
                    </header>
                    <Programs />
                </section>
                <section className="container mx-auto px-4 py-10 text-white lg:py-16">
                    <header className="mb-6 flex flex-col md:mb-8 md:items-center md:text-center">
                        <h2 className="mb-4 text-center text-4xl font-bold tracking-tight text-white text-shadow-lg md:text-3xl xl:text-6xl">
                            Наши<br />
                            <span className="ml-0 md:ml-10">социальные сети</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl text-center">
                            Следите за нашими новостями, мастер-классами и
                            вдохновляющими историями
                        </p>
                    </header>
                    <Socials className="flex justify-center items-center gap-x-8 md:gap-x-12" />
                    <Contacts />
                </section>
            </main>
            <Footer />
        </div>
    )
}
