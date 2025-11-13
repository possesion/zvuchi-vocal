'use client';

import { CirclePlay } from "lucide-react";
import { useRef, useState } from "react"

export const PromoContent = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    // Мемоизируем массив для предотвращения пересоздания при каждом рендере
    const backgroundText = Array(10).fill('ЗВУЧИ!')

    const handlePlayClick = () => {
        if (videoRef.current) {
            videoRef.current.play()
            setIsPlaying(true)
        }
    }

    return (
        <div className="relative pt-6 pb-[100px] md:pt-10">
            {/* Бегущая строка - только на десктопе */}
            <div className="z-1 absolute -left-20 top-50 hidden w-full md:inline-flex">
                <div className="marquee-scroll flex whitespace-nowrap text-6xl text-white/50" aria-hidden="true">
                    {/* Первый набор текста */}
                    <div className="flex shrink-0 [&>span]:mx-8">
                        {backgroundText.map((text, idx) => (
                            <span key={idx}>{text}</span>
                        ))}
                    </div>
                    {/* Второй набор текста для бесшовной анимации */}
                    <div className="flex shrink-0 [&>span]:mx-8">
                        {backgroundText.map((text, idx) => (
                            <span key={`duplicate-${idx}`}>{text}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Контейнер для видео - адаптивный */}
            <div className="relative z-10 mx-auto max-w-sm px-4 sm:max-w-md md:max-w-none md:px-0">
                <div className="aspect-[9/16] w-full max-w-[360px] mx-auto shadow-lg md:h-[580px] md:w-[360px]">
                    <video
                        ref={videoRef}
                        className="h-full w-full rounded-lg object-cover"
                        controls={isPlaying}
                        poster="/video-fallback.png"
                        preload="metadata"
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onLoadStart={() => setIsPlaying(false)}
                        src="/valeria/promo.mp4"
                        aria-label="Промо-видео школы вокала"
                    >
                        {/* Fallback для браузеров без поддержки video */}
                        <img
                            src="/video-fallback.png"
                            alt="Превью промо-видео школы вокала"
                            className="h-full w-full rounded-lg object-cover"
                        />
                        <p className="mt-4 text-center text-white">
                            Ваш браузер не поддерживает воспроизведение видео.
                        </p>
                    </video>

                    {/* Кнопка воспроизведения поверх видео */}
                    {!isPlaying && (
                        <button
                            onClick={handlePlayClick}
                            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform transition-all duration-300 hover:scale-110 active:scale-95"
                            aria-label="Воспроизвести промо-видео"
                        >
                            <CirclePlay
                                fill="var(--brand)"
                                color="white"
                                strokeWidth={0.5}
                                className="h-16 w-16 opacity-80 transition-opacity duration-300 hover:opacity-100 sm:h-20 sm:w-20"
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}