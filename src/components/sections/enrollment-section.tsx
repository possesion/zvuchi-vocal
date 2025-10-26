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
        <section id="study" className="py-6 lg:py-16 bg-muted/50">
            <EnrollmentModal isOpen={openModal} onClose={() => setOpenModal(false)} />
            {main ? (
                <button className='block bg-brand m-auto mb-4 cursor-pointer relative overflow-hidden group px-5 py-2 backdrop-brightness-[.9] border border-white text-white font-bold rounded-full shadow-xl/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105' onClick={() => setOpenModal(true)}>Получи
                    Бесплатное<br />пробное занятие
                </button>
            ) : (
                <div className="container mx-auto px-4 text-white">
                    <div className="flex flex-col items-center text-center">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                            Готов начать свой вокальный путь?
                        </h2>
                        <p className="max-w-2xl mb-8">
                            Присоединяйтесь к нашей вокальной школе и
                            раскройте свой талант под руководством опытных
                            педагогов
                        </p>

                        <button
                            onClick={handleOpenLink(TG_CHAT_URL)}
                            className='p-4 cursor-pointer rounded-lg bg-black/70 shadow-2xl'
                        // className="cursor-pointer group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Основной контент кнопки */}
                            <span className="relative z-10 flex items-center gap-3 animate-glow">
                                <img
                                    width={20}
                                    height={20}
                                    className='inline animate-bounce'
                                    src="socials/tg.svg"
                                    alt="tg"
                                />
                                Записаться
                            </span>
                        </button>

                        <p className="text-xl text-muted-foreground mt-4">
                            Первое занятие – бесплатно! 🎵
                        </p>
                    </div>
                </div>
            )}
        </section>
    )
}
