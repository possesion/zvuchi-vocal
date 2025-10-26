

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

export default function Home() {
    return (
        <div className="min-h-screen font-exo2">
            <main className="flex-1 primary-bg w-full">
                <Header />
                <div className='primary-bg'>
                    <Socials size={SOCIAL_ICON_SIZE.sm} className="hidden container mx-auto pt-2 justify-end gap-x-1 md:gap-x-2 md:flex" />
                    <section className="container mx-auto flex h-[100dvh] sm:h-screen">
                        <div className="relative flex w-full z-10 justify-center">

                            <Image src='/micro.png' className='z-50 hidden absolute bottom-0 left-90 object-cover drop-shadow-2xl md:block md:w-[200px]' width={200} height={500} alt={'micro'} />
                            <Image src='/valeria/transparent-lera.png' className='z-50 absolute bottom-0 right-0 object-cover drop-shadow-2xl md:w-[500px]' width={400} height={800} alt={'photo'} />

                            <div className="z-51 p-8 flex flex-col gap-y-6 lg:justify-center xl:gap-y-9">
                                <h1 className="text-2xl text-shadow-lg text-white font-bold xl:text-7xl">
                                    ШКОЛА<br />
                                    <span className='ml-4'>ВОКАЛА</span>
                                </h1>
                                <h1 className="shrink-0 typing-animation overflow-hidden text-nowrap mx-auto pr-3 text-2xl text-white font-bold xl:text-5xl">
                                    Пусть тебя
                                    <span className="text-primary"> УСЛЫШАТ!</span>
                                </h1>
                                <div className='hidden w-[500px] text-xl font-semibold text-white md:block lg:text-3xl lg:ml-10'>
                                    <p>Голос изменится после первого занятия!</p>
                                    Услышишь разницу до и после.
                                    Проверь — это работает!
                                </div>
                                <div className='mt-auto sm:m-0'>
                                    <EnrollmentSection main />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className='primary-bg py-6'>
                    <section
                        id="about"
                        className="container py-10 md:py-16 text-white"
                    >
                        <PromoContent />
                        <h2 className="text-center text-4xl md:text-3xl font-bold text-shadow-lg tracking-tight mb-4 xl:text-6xl">
                            <span className='ml-5'>Звучи! – это...</span>
                        </h2>
                        <FeatureList />
                    </section>
                    {/* Instructors Section */}
                    <section
                        id="instructors"
                        className="py-10 md:py-16 text-white"
                    >
                        <div className="flex flex-col items-center text-center mb-4 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                                Готов начать свой вокальный путь?
                            </h2>
                            <p className="container px-4 max-w-2xl mb-8">
                                Присоединяйтесь к нашей вокальной школе и
                                раскройте свой талант под руководством опытных
                                педагогов
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold text-shadow-lg tracking-tight mb-4">
                                Наши педагоги
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 grid-off sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                <section id="subscriptions" className="main-bg text-white py-10 lg:py-16">
                    <div className="container flex flex-col items-center mb-4 md:mb-8">
                        <h2 className="text-4xl text-left md:text-3xl font-bold text-shadow-lg tracking-tight mb-4 xl:text-6xl">
                            Наши<br />
                            <span className='ml-5'>абонементы</span>
                        </h2>
                        <p className="font-bold text-center max-w-2xl sm:text-left">
                            От джаза до рока — учим петь в любом жанре!
                            Индивидуальный подход для всех уровней: от нуля
                            до профессионала.
                        </p>
                    </div>
                    <Programs />
                </section>

                {/* <EnrollmentSection /> */}
                <Gallery />
                <section>
                    <Contacts />
                </section>
                {/* Social Networks Section */}
                <section className="container mx-auto px-4 py-10 text-white lg:py-16">
                    <div className="flex flex-col mb-6 md:mb-8 md:items-center md:text-center">
                        <h2 className="text-white text-center text-shadow-lg text-4xl md:text-3xl font-bold tracking-tight mb-4 xl:text-6xl">
                            Наши<br />
                            <span className='ml-0 md:ml-10'>социальные сети</span>
                        </h2>
                        <p className="text-muted-foreground text-center max-w-2xl">
                            Следите за нашими новостями, мастер-классами и
                            вдохновляющими историями
                        </p>
                    </div>
                    <Socials className="flex justify-center gap-x-8 md:gap-x-12" />
                </section>
            </main>
            <Footer />
        </div>
    )
}
