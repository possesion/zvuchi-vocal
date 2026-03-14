'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TG_CHAT_URL } from '../constants';
import { EnrollmentModal } from '../modals/enrollment-modal';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import { QuizButton } from '../common/quiz-button';

export function EnrollmentSection({ main = false }) {
    const [openModal, setOpenModal] = useState(false);
    

    // const handleOpenModal = () => {
    //     trackEvent('open_enrollment_modal');
    //     setOpenModal(true);
    // };
    
    const handleOpenLink = (link: string) => () => {
        trackEvent('write-tg');
        if (typeof window !== 'undefined') {
            window.open(link, '_blank');
        }
    }
    return (
        <section id="study" className="bg-muted/50 ">
            {/* <EnrollmentModal hasPicture isOpen={openValentineModal} onClose={() => setOpenValentineModal(false)}>
                <div className='w-full'>
                    <h2 id="modal-title" className="text-xl font-bold text-gray-900 md:text-2xl"></h2>
                    <div className="text-right text-2xl font-bold text-gray-900 md:text-3xl"></div>
                </div>
            </EnrollmentModal> */}
            <EnrollmentModal isOpen={openModal} onClose={() => setOpenModal(false)}>
                <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                    Записаться на пробное&nbsp;занятие
                </h2>
            </EnrollmentModal>
            {main ? (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col-reverse gap-x-2 ">
                        {/* <button
                            className="group relative bg-radial-[at_40%] from-violet-800 to-violet-950 to-80% mb-4 block cursor-pointer overflow-hidden rounded-sm px-5 py-3 text-xl font-bold text-white shadow-[0_0_45px_5px] shadow-purple-900 transition-all duration-300 hover:scale-105"
                            onClick={handleOpenModal}
                        >
                            Оставить &nbsp; заявку
                        </button> */}
                        <QuizButton />

                        <button
                            onClick={handleOpenLink(TG_CHAT_URL)}
                            className="group relative bg-radial-[at_40%] h-[52px] w-full self-center from-blue-700 to-blue-800 to-80% mb-4 block cursor-pointer overflow-hidden rounded-sm px-5 py-3 text-lg font-bold text-white shadow-[0_0_45px_5px] shadow-purple-900 transition-all duration-300 sm:hidden hover:scale-105"
                            aria-label="Записаться на занятие через Telegram"
                        >
                            <span className="relative z-10 flex animate-glow items-center justify-center">
                                <Image width={20} height={20} className="inline animate-bounce" src="/socials/tg.svg" alt="Telegram" />
                                <span className='text-center'>  Написать нам в Telegram</span>
                            </span>
                        </button>
                    </div>
                </div>
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
                            className="cursor-pointer rounded-sm bg-black/70 p-4 shadow-2xl"
                            aria-label="Записаться на занятие через Telegram"
                        >
                            <span className="relative z-10 flex animate-glow items-center gap-3">
                                <Image
                                    width={20}
                                    height={20}
                                    className="inline animate-bounce"
                                    src="/socials/tg.svg"
                                    alt="Telegram"
                                />
                                Записаться
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}
