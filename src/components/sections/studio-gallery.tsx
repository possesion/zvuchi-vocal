'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const STUDIO_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
    src: `/interior/${i}.jpg`,
    alt: `Студия фото ${i + 1}`,
}));

function Lightbox({
    photos,
    index,
    onClose,
}: {
    photos: typeof STUDIO_PHOTOS;
    index: number;
    onClose: () => void;
}) {
    const [current, setCurrent] = useState(index);
    const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
    const next = () => setCurrent((c) => (c + 1) % photos.length);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                <Image
                    src={photos[current].src}
                    alt={photos[current].alt}
                    width={1200}
                    height={900}
                    className="max-h-[85vh] max-w-[85vw] object-contain rounded-sm"
                />

                <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white hover:bg-black/80 transition-colors"
                    aria-label="Предыдущее фото"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white hover:bg-black/80 transition-colors"
                    aria-label="Следующее фото"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                    aria-label="Закрыть"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                    {current + 1} / {photos.length}
                </div>
            </div>
        </div>
    );
}

export function StudioGallery() {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    return (
        <div className="mb-10">
            <p className="mb-4 text-xl font-semibold text-white/90 md:text-3xl">Студия</p>

            {/* Mobile: Swiper (slidesPerView=1) */}
            <div className="md:hidden">
                <Swiper
                    modules={[Navigation]}
                    slidesPerView={1}
                    navigation
                    spaceBetween={12}
                >
                    {STUDIO_PHOTOS.map((photo) => (
                        <SwiperSlide key={photo.src}>
                            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm">
                                <Image
                                    src={photo.src}
                                    alt={photo.alt}
                                    fill
                                    className="object-cover"
                                    sizes="100vw"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Desktop: Pinterest masonry */}
            <div className="hidden md:block [column-count:3] lg:[column-count:4] gap-3">
                {STUDIO_PHOTOS.map((photo, i) => (
                    <div
                        key={photo.src}
                        className="mb-3 break-inside-avoid overflow-hidden rounded-sm cursor-pointer group relative"
                        onClick={() => setLightboxIndex(i)}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photo.src}
                            alt={photo.alt}
                            className="w-full h-auto block object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-sm" />
                    </div>
                ))}
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    photos={STUDIO_PHOTOS}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    );
}
