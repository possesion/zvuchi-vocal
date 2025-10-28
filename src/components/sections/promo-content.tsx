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
        <div className="relative py-10">
            <div className="z-1 absolute -left-3 top-50 hidden w-full flex-nowrap overflow-hidden md:inline-flex">
                <ul className="flex animate-[heartbeat_2s_ease_infinite] items-center justify-center text-6xl text-white md:justify-start [&_li]:mx-8" aria-hidden="true">
                    {backgroundText.map((text, idx) => (
                        <li key={idx} className="">{text}</li>
                    ))}
                </ul>
            </div>

            {/* Контейнер для видео с кнопкой play */}
            <div className="relative z-10 mx-auto h-[580px] w-[360px] shadow-lg">
                <video
                    ref={videoRef}
                    className="h-full w-full rounded-lg"
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
                        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform transition-all duration-300 hover:scale-110"
                        aria-label="Воспроизвести промо-видео"
                    >
                        <CirclePlay
                            fill="var(--brand)"
                            color="white"
                            strokeWidth={0.5}
                            className="h-20 w-20 opacity-80 transition-opacity duration-300 hover:opacity-100"
                        />
                    </button>
                )}
            </div>
        </div>
    )
}