'use client';

import { useRef, useState } from "react"

export const PromoContent = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(true)
    return (
        <div className="relative py-10">
            <div className="z-[1] absolute top-50 -left-4 w-full inline-flex flex-nowrap overflow-hidden">
                <ul className="text-6xl text-white animate-[heartbeat_2s_ease_infinite] flex items-center justify-center md:justify-start [&_li]:mx-8">
                    {Array(9).fill('').map((_, idx) => (<li key={idx} className="">ЗВУЧИ!</li>))}
                </ul>
                {/* animate-infinite-scroll */}
            </div>d
            <video
                ref={videoRef}
                // autoPlay
                className="relative z-10 w-[380px] h-[580px] m-auto" // DialogContent
                controls={isPlaying}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                src={'/valeria/promo.mp4'}
            />
        </div>
    )
}