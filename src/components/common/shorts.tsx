'use client';

import { SHORTS } from "@/app/constants"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export const Shorts = () => {
    const [currentIndex, setCurrentIndex] = useState(0)

    const itemsPerPage = {
        mobile: 1,
        desktop: 3
    }

    const maxIndexMobile = SHORTS.length - itemsPerPage.mobile
    const maxIndexDesktop = SHORTS.length - itemsPerPage.desktop

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1))
    }

    const handleNext = (isMobile: boolean) => {
        const maxIndex = isMobile ? maxIndexMobile : maxIndexDesktop
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
    }

    return (
        <div className="relative pt-16">
            {/* Desktop Navigation */}
            <div className="hidden items-center justify-center gap-4 md:flex">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Предыдущее видео"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                <div className="flex-1 overflow-hidden max-w-[860px]">
                    <div
                        className="flex gap-4 transition-transform duration-500 ease-out lg:gap-6"
                        style={{ transform: `translateX(-${currentIndex * (280 + 12)}px)` }}
                    >
                        {SHORTS.map((shortUrl) => (
                            <iframe
                                key={shortUrl}
                                width="270"
                                height="480"
                                src={shortUrl}
                                className='flex-shrink-0 rounded-sm border-none'
                                allow="clipboard-write; autoplay"
                                allowFullScreen
                            ></iframe>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => handleNext(false)}
                    disabled={currentIndex >= maxIndexDesktop}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Следующее видео"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex justify-center items-center gap-3 md:hidden">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Предыдущее видео"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex-1 overflow-hidden" style={{ maxWidth: '270px' }}>
                    <div
                        className="flex gap-4 transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * (270 + 16)}px)` }}
                    >
                        {SHORTS.map((shortUrl) => (
                            <iframe
                                key={shortUrl}
                                width="270"
                                height="480"
                                src={shortUrl}
                                className='flex-shrink-0 rounded-sm border-none'
                                allow="clipboard-write; autoplay"
                                allowFullScreen
                            ></iframe>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => handleNext(true)}
                    disabled={currentIndex >= maxIndexMobile}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Следующее видео"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}