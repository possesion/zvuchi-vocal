

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

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col font-manrope">
            <main className="flex-1 primary-bg">
                <Header />
                <section className="">
                    <div className="flex z-10">
                        {/* py-16 md:py-24 lg:py-32 */}
                        <Image src='/valeria/transparent-lera.png' width={400} height={800} alt={'photo'} />

                        <div className="flex flex-col gap-y-6 justify-center xl:gap-y-9">
                            <h1 className="mx-3 mb-4 text-white text-center text-4xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl lg:mb-8">
                                ПУСТЬ УСЛЫШАТ<br />
                                <span className="text-primary">ТЕБЯ!</span>
                            </h1>
                            <div className='text-xl font-semibold text-white text-center lg:text-2xl xl:mt-4'>Хочешь записать кавер на любимую группу или выступать на сцене?</div>
                            <EnrollmentSection main />
                        </div>
                    </div>
                </section>
                <div className="main-bg px-2 md:px-4">
                    <FeatureList />

                    {/* Instructors Section */}
                    <section
                        id="instructors"
                        className="py-10 md:py-16 bg-muted/50 text-white"
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
                <section id="subscriptions" className="text-white py-10 lg:py-16">
                    <div className="flex flex-col items-center text-center mb-4 md:mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                            Наши абонементы
                        </h2>
                        <p className="text-muted-foreground max-w-2xl">
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
                <section className="py-10 text-white lg:py-16">
                    <div className="flex flex-col items-center text-center mb-4 md:mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                            Наши социальные сети
                        </h2>
                        <p className="text-muted-foreground max-w-2xl">
                            Следите за нашими новостями, мастер-классами и
                            вдохновляющими историями
                        </p>
                    </div>
                    <div className="flex justify-center gap-x-8 md:gap-x-12">
                        <a
                            href="https://www.instagram.com/zvuchi.vocal?igsh=NG40M3dwNnQ4Z21m&utm_source=qr"
                            target="blank"
                            className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                        >
                            <Image
                                width={40}
                                height={40}
                                src="/socials/instagram.svg"
                                alt="instagram"
                            />
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                Instagram
                            </span>
                        </a>

                        <a
                            href="https://t.me/zvuchivocal"
                            target="blank"
                            className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                        >
                            <Image
                                width={40}
                                height={40}
                                src="/socials/telegram.svg"
                                alt="tg"
                            />
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                Telegram
                            </span>
                        </a>

                        <a
                            href="https://vk.com/zvuchi.vocal"
                            target="blank"
                            className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                        >
                            <Image
                                width={42}
                                height={42}
                                src="/socials/vk.svg"
                                alt="vk"
                            />
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                VK
                            </span>
                        </a>
                        <a
                            href="https://www.tiktok.com/@zvuchi.vocal?_t=ZS-8yqbaCZDVqb&_r=1"
                            target="blank"
                            className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                        >
                            <Image
                                width={42}
                                height={42}
                                src="/socials/tiktok.svg"
                                alt="vk"
                            />
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                TikTok
                            </span>
                        </a>
                    </div>
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
