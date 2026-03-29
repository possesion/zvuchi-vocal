'use client';

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css';
import { SHORTS } from "@/app/constants"

const breakpoints = {
    320: {
        slidesPerView: 1,
    },
    640: {
        slidesPerView: 3,
    },
    1024: {
        slidesPerView: 4,
    },
};

export const Shorts = () => {

    return (
        <div className="relative pt-16 lg:pt-32">
            <p className="pb-4 text-xl font-semibold text-white/90 md:text-2xl">
                Музыкальные распевки и отзывы
            </p>
            <div className="flex justify-center items-center gap-3">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={50}
                    slidesPerView={3}
                    navigation
                    breakpoints={breakpoints}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                >
                    {SHORTS.map((shortUrl, index) => (
                        <SwiperSlide
                            key={shortUrl}
                            className="flex-shrink-0 w-full aspect-[9/16] bg-gray-800 rounded-sm">
                            {/* {loadedVideos.has(index) ? ( */}
                            <iframe
                                src={`${shortUrl}&autoplay=0`}
                                className='w-full h-full rounded-sm border-none'
                                allow="clipboard-write"
                                allowFullScreen
                                loading="lazy"
                                title={`RuTube Short ${index + 1}`}
                            />
                            {/* ) : (
                                <div className="w-full h-full bg-gray-800 rounded-sm flex items-center justify-center">
                                    <div className="animate-pulse bg-gray-700 w-16 h-16 rounded-full"></div>
                                </div>
                            )} */}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    )
}