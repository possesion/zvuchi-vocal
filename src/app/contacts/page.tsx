import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Contacts } from '@/components/sections/contacts';
import { Socials } from '@/components/common/socials';
import { generatePageMetadata } from '@/lib/metadata';
import { socials } from '../constants';

export const metadata: Metadata = generatePageMetadata({
    title: 'Контакты',
    description: 'Контакты вокальной студии ЗВУЧИ в Москве. Адрес, телефон, социальные сети. Запишитесь на пробное занятие!',
    path: '/contacts',
    keywords: [
        'контакты вокальной студии',
        'адрес школы вокала москва',
        'телефон вокальной студии',
        'записаться на вокал',
        'где находится студия звучи',
    ],
});

export default function ContactsPage() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <div className="primary-bg py-12">
                    <section className="container mx-auto text-white">
                        <header className="mb-12 text-center">
                            <h1 className="mb-6 text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                Контакты
                            </h1>
                            {/* <p className="mx-auto max-w-2xl text-lg text-white/90 md:text-xl">
                                Свяжитесь с нами удобным способом
                            </p> */}
                        </header>

                        <Contacts />

                        <section className="mt-16">
                            <header className="mb-8 flex flex-col items-center text-center">
                                <h2 className="mb-4 text-3xl font-bold tracking-tight text-white text-shadow-lg md:text-4xl">
                                    Наши социальные сети
                                </h2>
                                <p className="text-muted-foreground max-w-2xl">
                                    Следите за нашими новостями, мастер-классами и вдохновляющими историями
                                </p>
                            </header>
                            <Socials className="flex justify-center items-center gap-x-8 md:gap-x-12" links={socials} />
                        </section>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
