'use client'

import { TouchEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import 'react-image-gallery/styles/css/image-gallery.css'
import { Shorts } from '../common/shorts'

export const Gallery = () => {
    const [images, setImages] = useState<
        { alt: string; src: string; fileName: string }[]
    >([])
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    function handleTouchStart(e: TouchEvent<HTMLElement>) {
        setTouchStart(e.targetTouches[0].clientX);
    }

    function handleTouchMove(e: TouchEvent<HTMLElement>) {
        setTouchEnd(e.targetTouches[0].clientX);
    }

    const [selectedIndex, setSelectedIndex] = useState(0)

    const openImage = (index: number) => {
        setSelectedIndex(index)
    }

    const nextImage = () => {
        setSelectedIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    function handleTouchEnd() {
        if (touchStart - touchEnd > 150) {
            nextImage();
        }

        if (touchStart - touchEnd < -150) {
            prevImage();
        }
    }


    useEffect(() => {
        (async () => {
            try {
                const response = await fetch('api/gallery')
                const { images } = await response.json()
                setImages(images)
            } catch {
                console.error('download error')
            }
        })()
    }, [])
    return (
        <section className="container mx-auto px-4 py-10 lg:py-16">
            <header className='flex justify-center'>
                <div className='w-min bg-radial-[at_50%_75%] from-sky-500 via-blue-700 to-violet-950 to-90%  mb-8 pr-6 py-4 rounded-lg md:mb-12'>
                    <h2 className="text-center text-4xl font-bold tracking-tight text-white text-shadow-lg md:text-3xl xl:text-6xl">
                        Жизнь<br />
                        <span className="ml-10">Студии</span>
                    </h2>
                </div>
            </header>
            <div className="relative">
                {/* Подсказка для свайпа */}
                <div className="absolute -top-2 right-4 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white/90">Прокрути</span>
                    <div className="flex gap-1">
                        <svg
                            className="h-5 w-5 animate-[swipe_2s_ease-in-out_infinite] text-white/80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                            />
                        </svg>
                    </div>
                </div>

                <div
                    id="gallery"
                    className="flex space-x-4 overflow-x-auto py-4 whitespace-nowrap scrollbar-hide no-scrollbar"
                    role="region"
                    aria-label="Галерея фотографий студии"
                >
                    {images?.map((image, index) => (
                        <Dialog.Root key={image.fileName}>
                            <Dialog.Trigger asChild>
                                <button
                                    onClick={() => openImage(index)}
                                    className="relative aspect-square w-[270px] shrink-0 cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90"
                                    aria-label={`Открыть изображение ${image.alt}`}
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                </button>
                            </Dialog.Trigger>

                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
                                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform outline-none">
                                    <div className="relative max-h-[90vh] min-w-[380px] max-w-[90vw] md:min-w-[680px]">
                                        {/* Основное изображение */}
                                        <Image
                                            src={images[selectedIndex].src}
                                            alt={images[selectedIndex].alt}
                                            onTouchStart={touchStartEvent => handleTouchStart(touchStartEvent)}
                                            onTouchMove={touchMoveEvent => handleTouchMove(touchMoveEvent)}
                                            onTouchEnd={handleTouchEnd}
                                            width={800}
                                            height={600}
                                            sizes="100vw"
                                            className="max-h-[80vh] max-w-full object-contain"
                                        />
                                        <Dialog.Close asChild>
                                            <button
                                                className="absolute right-4 top-2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                                                aria-label="Закрыть галерею"
                                            >
                                                <svg
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </Dialog.Close>

                                        {/* Навигация */}
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                                                    aria-label="Предыдущее изображение"
                                                >
                                                    <svg
                                                        className="h-6 w-6"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 19l-7-7 7-7"
                                                        />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                                                    aria-label="Следующее изображение"
                                                >
                                                    <svg
                                                        className="h-6 w-6"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </button>
                                            </>
                                        )}

                                        {/* Индикатор */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                                            {selectedIndex + 1} / {images.length}
                                        </div>
                                    </div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    ))}
                </div>
            </div>
            <Shorts />
        </section>
    )
}
