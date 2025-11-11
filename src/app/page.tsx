

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
                    <section className="container mx-auto flex h-[100svh] sm:h-screen">
                        <div className="relative z-10 flex w-full justify-center">
                            <div className="absolute bottom-0 left-60 z-50 hidden md:block">
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
                                className="absolute bottom-0 right-0 z-50 object-cover drop-shadow-2xl md:w-[600px]"
                                width={400}
                                height={800}
                                priority
                                alt="Валерия - преподаватель вокала"
                            />
                            <div className="z-51 flex flex-col gap-y-6 p-8 lg:justify-start xl:gap-y-9">
                                <h1 className="hidden hero-title bg-radial-[at_50%_75%] from-sky-500 via-blue-700 to-violet-950 to-90% rounded-md shadow-lg w-min px-5 py-3 text-2xl font-bold text-white md:w-[350px] md:block xl:text-7xl">
                                    ШКОЛА<br />
                                    <span className="ml-4">ВОКАЛА</span>
                                </h1>
                                <h2 className="hidden typing-animation mx-auto shrink-0 overflow-hidden text-nowrap pr-3 text-2xl font-bold text-white xl:text-5xl">
                                    Пусть тебя
                                    <span className="text-primary"> УСЛЫШАТ!</span>
                                </h2>
                                <div className="w-76 text-xl font-semibold text-white md:w-[500px] lg:text-3xl">
                                    <p>Голос изменится после первого занятия!</p>
                                    Услышишь разницу до и после.
                                    Проверь — это работает!
                                </div>
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
                        <h2 className="mb-4 text-center text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                            <span className="ml-5">Звучи! – это...</span>
                        </h2>
                        <FeatureList />
                    </section>

                    {/* Instructors Section */}
                    <section
                        id="instructors"
                        className="pb-10 text-white md:pb-16"
                    >
                        <header className="mb-4 flex flex-col items-center text-center md:mb-8">

                            {/* Enrollment Form */}
                            <div className="container mx-auto my-8 flex justify-center px-4 lg:my-16">
                                <EnrollmentForm />
                            </div>
                            <div className='flex flex-col justify-center items-center bg-radial-[at_50%_75%] from-sky-500 via-blue-700 to-violet-950 to-90%  mb-8 px-6 py-4 rounded-lg md:mb-12 '>
                                <h2 className="text-left text-4xl font-bold tracking-tight text-shadow-lg md:text-3xl xl:text-6xl">
                                    Наши<br />
                                    <span className="ml-5">педагоги</span>
                                </h2>
                            </div>
                        </header>
                        <div className="container grid grid-cols-1 gap-8 grid-off sm:grid-cols-2 md:gap-y-12 lg:grid-cols-3">
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
                    <header className="container mb-8 flex flex-col items-center md:mb-8">
                        <div className='flex flex-col justify-center items-center bg-radial-[at_50%_75%] from-sky-500/80 via-blue-700/90 to-violet-950/90 to-90%  pr-6 py-4 rounded-lg'>
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

                {/* Contacts Section */}
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
