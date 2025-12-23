

import Image from 'next/image'
import { instructors } from './constants'
import '@radix-ui/themes/styles.css'
import { Programs } from '@/components/sections/programs'
import { FeatureList } from '@/components/sections/feature-list'
import { Header } from '@/components/layout/header'
import { Contacts } from '@/components/sections/contacts'
import { Gallery } from '@/components/sections/gallery'
import { EnrollmentSection } from '@/components/sections/enrollment-section'
import { VocalInstructor } from '@/components/sections/vocal-instructor'
import { PromoContent } from '@/components/sections/promo-content'
import { Socials } from '@/components/common/socials'
import { SOCIAL_ICON_SIZE } from '@/components/common/constants'
import { Footer } from '@/components/layout/footer'
import { EnrollmentForm } from '@/components/forms/enrollment-form'

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
                    <Image
                        src="/gift.jpg"
                        className="w-full object-contain sm:rounded-sm shadow-lg sm:hidden"
                        width={380}
                        height={220} 
                        placeholder='blur' 
                        blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
                        alt="подарок"
                    />
                    <section className="container mx-auto flex h-[70svh] sm:h-screen">
                        <div className="relative z-10 flex w-full justify-center">
                            <div className="absolute bottom-0 left-60 z-50 hidden lg:block">
                                <Image
                                    src="/micro.png"
                                    className=""
                                    width={180}
                                    height={500}
                                    alt="Микрофон"
                                />
                                {/* тень микрофон */}
                                <div className="pointer-events-none h-14 w-9 absolute left-21 top-5 mic-shadow animate-blurred-fade-in"></div>
                                <div className="pointer-events-none h-3 w-24 absolute left-13 bottom-5 stand-shadow animate-blurred-fade-in"></div>
                            </div>
                            <Image
                                src="/valeria/transparent-lera.png"
                                className="absolute bottom-0 right-[10%] z-50 h-auto w-[272px] object-contain drop-shadow-2xl sm:w-[320px] md:w-[320px] lg:w-[340px] xl:w-[360px] [@media(max-height:600px)_and_(orientation:landscape)]:hidden"
                                width={380}
                                height={760}
                                quality={95}
                                priority
                                alt="Валерия - преподаватель вокала"
                            />
                            <div className="z-51 flex flex-col gap-y-6 p-8 lg:justify-start xl:gap-y-9">
                                <h1 className="rotate-z-2 hidden hero-title bg-dark rounded-sm shadow-lg w-min px-5 py-3 text-2xl font-bold text-white sm:w-[210px] sm:text-4xl xl:w-[350px] md:block xl:text-7xl">
                                    ШКОЛА<br />
                                    <span className="ml-4">ВОКАЛА</span>
                                </h1>
                                <h2 className="hidden typing-animation mx-auto shrink-0 overflow-hidden text-nowrap pr-3 text-2xl font-bold text-white xl:text-5xl">
                                    Пусть тебя
                                    <span className="text-primary"> УСЛЫШАТ!</span>
                                </h2>
                                <Image
                                    src="/gift.jpg"
                                    className="mt-3 hidden w-full rounded-sm shadow-lg sm:block 2xl:w-[380px]"
                                    width={350}
                                    height={200}
                                    alt="подарок"
                                />
                                {/* <div className="w-76 text-2xl text-white md:w-[500px] lg:text-3xl">
                                    <p>Голос изменится после первого занятия!</p>
                                    Услышишь разницу <b>до</b> и <b className="after-highlight">после</b>.
                                    Проверь — это работает!
                                </div> */}
                                <div className="mt-auto sm:m-0">
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
                            <div className="mx-auto mt-8 mb-[120px] flex justify-center lg:mt-16">
                                <EnrollmentForm />
                            </div>
                            {/* from-violet-800/80 to-violet-950/80 */}
                            <div className='w-full flex flex-col justify-center items-center bg-dark mb-8 px-6 py-4 rounded-sm md:mb-12 '>
                                <h2 className="text-left text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                                    Наши<br />
                                    <span className="ml-5">педагоги</span>
                                </h2>
                            </div>
                            <p className='mb-3 text-white font-semibold indent-5'>
                                За каждым сияющим успехом на сцене стоит вдохновляющий наставник. Тот, кто превращает голос в магию, а уроки — в путешествие. Не просто педагоги, а проводники в мир музыки, чьи сердца бьются в ритм с учениками.
                            </p>
                        </header>
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
                    </section>
                </div>

                {/* Programs Section */}
                <section id="subscriptions" className="main-bg py-10 text-white lg:py-16">
                    <header className="container mb-[120px] flex flex-col items-center md:mb-8">
                        {/* from-violet-800/80 to-violet-950/80 */}
                        <div className='flex flex-col justify-center items-center bg-dark pr-6 py-4 rounded-sm opacity-85'>
                            <h2 className="mb-4 text-left text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                                Наши<br />
                                <span className="ml-5">абонементы</span>
                            </h2>
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

                <Gallery />

                <section>
                    <Contacts />
                </section>

                {/* Social Networks Section */}
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
                    <Socials className="flex justify-center gap-x-8 md:gap-x-12" />
                </section>
            </main>
            <Footer />
        </div>
    )
}
