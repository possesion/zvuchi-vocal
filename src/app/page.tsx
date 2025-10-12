

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
import { INN, OGRNIP } from '@/components/constants'
import { PromoContent } from '@/components/sections/promo-content'
import { Socials } from '@/components/common/socials'
import { SOCIAL_ICON_SIZE } from '@/components/common/constants'

export default function Home() {
    return (
        <div className="min-h-screen font-manrope">
            <main className="flex-1 primary-bg w-full">
                <Header />
                <Socials size={SOCIAL_ICON_SIZE.sm} className="container mx-auto pt-2 flex justify-end gap-x-1 md:gap-x-2" />
                <section className="container mx-auto flex h-screen">
                    <div className="relative flex w-full z-10 justify-center">
                        <Image src='/valeria/transparent-lera.png' className='z-50 absolute bottom-0 right-0 object-cover drop-shadow-2xl' width={500} height={800} alt={'photo'} />

                        <div className="z-30 p-8 flex flex-col gap-y-6 lg:justify-center xl:gap-y-9">
                            {/* <h1 className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 text-5xl text-white font-bold">
                                Hello World
                            </h1> */}





                            {/* <h1 className="animate-fadeIn mx-3 mb-4 text-white text-4xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-7xl lg:mb-8"> */}
                            <h1 className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 text-5xl text-white font-bold">
                                Пусть тебя
                                <span className="text-primary"> УСЛЫШАТ!</span>
                            </h1>
                            <div className='text-xl font-semibold text-white text-center lg:text-3xl'>От мечты — к сцене</div>
                            <EnrollmentSection main />
                        </div>
                    </div>
                </section>
                {/* <section
                    id="about"
                    className="py-10 md:py-16 text-white"
                >
                    <Image width={42} height={42} alt='about-pic' src='/about/about-1.jpg' />
                </section> */}
                <div className='primary-bg py-6'>
                    <PromoContent />
                    <FeatureList />
                    {/* Instructors Section */}
                    <section
                        id="instructors"
                        className="py-10 md:py-16 text-white"
                    >
                        <div className="flex flex-col items-center text-center mb-4 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
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
                    <div className="container mx-auto flex flex-col mb-4 md:mb-8">
                        <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-4 xl:text-6xl">
                            Наши<br />абонементы
                        </h2>
                        <p className="font-bold max-w-2xl">
                            От джаза до рока — учим петь в любом жанре!
                            Индивидуальный подход для всех уровней: от нуля
                            до профессионала.
                        </p>
                    </div>
                    <Programs />
                </section>

                <EnrollmentSection />

                <Gallery />
                <section>
                    <Contacts />
                </section>
                {/* Social Networks Section */}
                <section className="px-2 py-10 text-white lg:py-16">
                    <div className="flex flex-col items-center text-center mb-4 md:mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                            Наши социальные сети
                        </h2>
                        <p className="text-muted-foreground max-w-2xl">
                            Следите за нашими новостями, мастер-классами и
                            вдохновляющими историями
                        </p>
                    </div>
                    <Socials className="flex justify-center gap-x-8 md:gap-x-12" />
                </section>
            </main>
            <footer className="border-t py-2 md:py-4 bg-foreground supports-[backdrop-filter]:bg-foreground/90">
                <div className="relative w-full pl-4 flex flex-col lg:flex-row">
                    <div className="flex items-center justify-center gap-2 text-white">
                        <Image
                            src="/zvuchi-cropped.png"
                            width={100}
                            height={38}
                            alt="logo"
                        />
                        © {new Date().getFullYear()}
                    </div>
                    <div className="pb-2 flex flex-col gap-2 m-auto lg:flex-row">
                        <p className="text-sm text-white">
                            <span className="font-bold mr-2">ИП</span>Казанцев
                            Геннадий Викторович{' '}
                        </p>
                        <p className="flex text-sm text-white">
                            <span className="font-bold mr-2">ОГРНИП</span>
                            {OGRNIP}
                            <span className="font-bold mx-2">ИНН</span>
                            {INN}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
