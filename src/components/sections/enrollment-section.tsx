'use client'

import { TG_CHAT_URL } from '../constants';

export function EnrollmentSection({ main = false }) {
    const handleOpenLink = (link: string) => () => {
        if (window) {
            window.open(link, '_blank');
        }
    }
    return (
        <section id="study" className="py-10 lg:py-16 bg-muted/50">
            {main ? (
                <>
                    <button
                        onClick={handleOpenLink(TG_CHAT_URL)}
                        className="block m-auto cursor-pointer relative overflow-hidden group px-4 py-2 bg-[#ab1515] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <span className="relative z-10">
                            Запишись на
                            Бесплатное<br />пробное занятие
                            <img
                                width={20}
                                height={20}
                                className='z-100 inline ml-1'
                                src="socials/tg.svg"
                                alt="tg"
                            />
                        </span>

                        <span className="absolute inset-0 bg-gradient-to-r from-[#d42e2e] to-[#ab1515] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></span>
                        {/* Блестящий эффект */}
                        <span className="absolute top-0 left-0 w-full h-full overflow-hidden">
                            <span className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-[100%] transition-all duration-1000"></span>
                        </span>
                        {/* Эффект пульсации */}
                        <span className="absolute inset-0 rounded-lg  group-active:border-white/50 group-active:scale-95 transition-all duration-200"></span>
                    </button>
                </>
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
                            className='p-4 cursor-pointer rounded-lg'
                        // bg-gradient-to-r from-brand to-brand-secondary
                        // className="cursor-pointer group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Основной контент кнопки */}
                            <span className="relative z-10 flex items-center gap-3">
                                <img
                                    width={20}
                                    height={20}
                                    className='inline ml-1 animate-bounce'
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
