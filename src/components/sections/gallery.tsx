'use client'

import { TouchEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import 'react-image-gallery/styles/css/image-gallery.css'

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
        <div className='container mx-auto px-4 py-10 lg:py-16'>
            <h2 className="text-white text-shadow-lg text-4xl md:text-3xl font-bold tracking-tight mb-4 xl:text-6xl">
                Жизнь<br />
                <span className='ml-2'>Студии</span>
            </h2>
            <div
                id="gallery"
                className="flex overflow-x-auto no-scrollbar whitespace-nowrap space-x-4 px-2 py-4 scrollbar-hide"
            >


                {images?.map((image, index) => (
                    <Dialog.Root key={image.fileName}>
                        <Dialog.Trigger asChild>
                            <button
                                onClick={() => openImage(index)}
                                className="w-[250px] cursor-pointer relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity shrink-0"
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
                            <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 outline-none">
                                <div className="relative min-w-[380px] max-w-[90vw] max-h-[90vh] md:min-w-[680px]">
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
                                        className="max-w-full max-h-[80vh] object-contain"
                                    />
                                    <Dialog.Close asChild>
                                        <button
                                            className="absolute top-2 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                            aria-label="Close"
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
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
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                                                aria-label="Previous image"
                                            >
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
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
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                                                aria-label="Next image"
                                            >
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
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
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                        {selectedIndex + 1} / {images.length}
                                    </div>
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                ))}
            </div>
        </div>
    )
}
