'use client'

import { useState } from 'react';
import { TG_CHAT_URL } from '../constants';
import { EnrollmentModal } from '../modals/enrollment-modal';

export function EnrollmentSection({ main = false }) {
    const [openModal, setOpenModal] = useState(false);
    const handleOpenLink = (link: string) => () => {
        if (window) {
            window.open(link, '_blank');
        }
    }
    return (
        <section id="study" className="bg-muted/50 py-6 lg:py-16">
            <EnrollmentModal isOpen={openModal} onClose={() => setOpenModal(false)} />
            {main ? (
                <button 
                    className="group relative m-auto mb-4 block cursor-pointer overflow-hidden rounded-full border border-white bg-brand px-5 py-2 font-bold text-white shadow-xl/20 backdrop-brightness-[.9] transition-all duration-300 hover:scale-105 hover:shadow-xl" 
                    onClick={() => setOpenModal(true)}
                >
                    Получи
                    Бесплатное<br />пробное занятие
                </button>
            ) : (
                <div className="container mx-auto px-4 text-white">
                    <div className="flex flex-col items-center text-center">
                        <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
                            Готов начать свой вокальный путь?
                        </h2>
                        <p className="mb-8 max-w-2xl">
                            Присоединяйтесь к нашей вокальной школе и
                            раскройте свой талант под руководством опытных
                            педагогов
                        </p>

                        <button
                            onClick={handleOpenLink(TG_CHAT_URL)}
                            className="cursor-pointer rounded-lg bg-black/70 p-4 shadow-2xl"
                            aria-label="Записаться на занятие через Telegram"
                        >
                            <span className="relative z-10 flex animate-glow items-center gap-3">
                                <img
                                    width={20}
                                    height={20}
                                    className="inline animate-bounce"
                                    src="socials/tg.svg"
                                    alt="Telegram"
                                />
                                Записаться
                            </span>
                        </button>

                        <p className="mt-4 text-xl text-muted-foreground">
                            Первое занятие – бесплатно! 🎵
                        </p>
                    </div>
                </div>
            )}
        </section>
    )
}
