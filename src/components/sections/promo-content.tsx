'use client';

import { useRef, useState } from "react"

export const PromoContent = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(true)
    return (
        <div className="relative py-10">
            <div className="z-1 absolute -left-3 top-50 hidden w-full flex-nowrap overflow-hidden md:inline-flex">
                <ul className="flex animate-[heartbeat_2s_ease_infinite] items-center justify-center text-6xl text-white md:justify-start [&_li]:mx-8" aria-hidden="true">
                    {Array(10).fill('').map((_, idx) => (<li key={idx} className="">ЗВУЧИ!</li>))}
                </ul>
            </div>
            <video
                ref={videoRef}
                className="relative z-10 m-auto h-[580px] w-[380px]"
                controls={isPlaying}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                src="/valeria/promo.mp4"
                aria-label="Промо-видео школы вокала"
            />
        </div>
    )
}