'use client';

import { trackEvent } from "@/hooks/use-yandex-metrica";
import { CirclePlay } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react"

export const PromoContent = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)


    const handlePlayClick = () => {
        if (videoRef.current) {
            videoRef.current.play()
            trackEvent('play-promo-video')
            setIsPlaying(true)
        }
    }

    return (
        <div className="relative">
            {/* Контейнер для видео - адаптивный */}
            <div className="relative z-10 max-w-sm sm:max-w-md md:max-w-none md:px-0">
                <div className="w-[400px] mx-auto shadow-lg h-[600px]">
                    <video  
                        ref={videoRef}
                        className="h-full w-full rounded-sm object-cover"
                        controls={isPlaying}
                        poster="/video-fallback.png"
                        preload="metadata"
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onLoadStart={() => setIsPlaying(false)}
                        aria-label="Промо-видео школы вокала"
                    >
                        <source src="https://s3.twcstorage.ru/dd3d1966-zvuchi-media/promo.mp4" type="video/mp4" />
                        {/* Fallback для браузеров без поддержки video */}
                        <Image
                            src="/video-fallback.png"
                            alt="Превью промо-видео школы вокала"
                            className="h-full w-full rounded-sm object-cover"
                            width={360}
                            height={600}
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