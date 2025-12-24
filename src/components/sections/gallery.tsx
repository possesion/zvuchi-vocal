'use client'

import { TouchEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import 'react-image-gallery/styles/css/image-gallery.css'
import { Shorts } from '../common/shorts'
import { BUCKET_URL } from '../constants'

export const Gallery = () => {
    const [images, setImages] = useState<
        { alt: string; src: string; fileName: string }[]
    >([])
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Для mouse drag
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [scrollStart, setScrollStart] = useState(0);

    function handleTouchStart(e: TouchEvent<HTMLElement>) {
        setTouchStart(e.targetTouches[0].clientX);
    }

    function handleTouchMove(e: TouchEvent<HTMLElement>) {
        setTouchEnd(e.targetTouches[0].clientX);
    }

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        const gallery = e.currentTarget as HTMLElement;
        setIsDragging(true);
        setDragStart(e.clientX);
        setScrollStart(gallery.scrollLeft);
        gallery.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();

        const gallery = e.currentTarget as HTMLElement;
        const dragDistance = e.clientX - dragStart;
        gallery.scrollLeft = scrollStart - dragDistance;
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        setIsDragging(false);
        const gallery = e.currentTarget as HTMLElement;
        gallery.style.cursor = 'grab';
    };

    const handleMouseLeave = (e: React.MouseEvent) => {
        if (isDragging) {
            setIsDragging(false);
            const gallery = e.currentTarget as HTMLElement;
            gallery.style.cursor = 'grab';
        }
    };

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
        const pictures = [];
        for (let i = 1; i <= 42; i++) {
            pictures.push({ alt: `photo-${i}`, fileName: `${i}.jpg`, src: `${BUCKET_URL}/dd3d1966-zvuchi-media/concert-29-11/${i}.jpg` })
        }
        setImages(pictures);
    }, [])
    return (
        <section className="container mx-auto px-4 py-10 lg:py-16">
            <header id="gallery" className='flex flex-col justify-center mb-[50px]'>
                {/* from-violet-800/80 to-violet-950/80 */}
                <div className='w-full bg-dark pr-6 py-4 rounded-sm'>
                    <h2 className="text-center text-4xl font-bold tracking-tight text-white text-shadow-lg md:text-3xl xl:text-6xl">
                        Жизнь<br />
                        <span className="ml-10">Студии</span>
                    </h2>
                </div>

                <p className='mt-3 text-white font-semibold text-center indent-5 lg:mt-5'>
                    <b>Сцена</b> — это всегда праздник, и мы приглашаем вас на него снова и снова! Здесь мы храним память о каждом таком празднике: блики софитов, сияющие глаза артистов, аплодисменты зала. Наши фотографии и короткие видео — это больше, чем просто отчеты; это история эмоций, побед и волшебства, которое рождается, когда музыка оживает.
                </p>
            </header>
            <div className="relative">
                {/* Подсказка для свайпа */}
                <div className="absolute -top-2 right-4 z-10 flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 backdrop-blur-sm">
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
                    className="gallery-scroll flex space-x-4 overflow-x-auto py-4 whitespace-nowrap scrollbar-hide no-scrollbar select-none cursor-grab"
                    role="region"
                    aria-label="Галерея фотографий студии"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    {images?.map((image, index) => (
                        <Dialog.Root key={image.fileName}>
                            <Dialog.Trigger asChild>
                                <button
                                    onClick={() => openImage(index)}
                                    className="relative aspect-square w-[280px] h-[330px] shrink-0 cursor-pointer overflow-hidden rounded-sm transition-opacity hover:opacity-90 select-none"
                                    aria-label={`Открыть изображение ${image.alt}`}
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        className="object-cover pointer-events-none"
                                        draggable={false}
                                        onDragStart={(e) => e.preventDefault()} 
                                        blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
                                        placeholder='blur'
                                        loading={index < 6 ? "eager" : "lazy"}
                                        quality={80}
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
