'use client'

// import ImageGallery from "react-image-gallery";
import { useState } from 'react'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import 'react-image-gallery/styles/css/image-gallery.css'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Массив фотографий для галереи
const images = [
    {
        id: 1,
        src: '/bg.jpg',
        alt: 'Студенты поют',
        title: 'Занятия вокалом',
    },
    {
        id: 2,
        src: '/valeria.jpg',
        alt: 'Валерия Ковшова',
        title: 'Преподаватель Валерия',
    },
    {
        id: 3,
        src: '/maria/maria.jpg',
        alt: 'Мария Биттер',
        title: 'Преподаватель Мария',
    },
    {
        id: 4,
        src: '/zvuchi-logo.svg',
        alt: 'Логотип Звучи',
        title: 'Наш логотип',
    },
]

export const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState<number | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
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

    const openModal = (index: number) => {
        console.log('Opening modal for image:', index)
        setSelectedImage(index)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedImage(null)
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <Dialog.Root key={index}>
                    <Dialog.Trigger asChild>
                        <button
                            onClick={() => openImage(index)}
                            className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Image
                                src={image.src} // image?.thumbnail ||
                                alt={image.alt}
                                fill
                                className="object-cover"
                            />
                        </button>
                    </Dialog.Trigger>

                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 outline-none">
                            <div className="relative max-w-[90vw] max-h-[90vh]">
                                {/* Основное изображение */}
                                <Image
                                    src={images[selectedIndex].src}
                                    alt={images[selectedIndex].alt}
                                    width={800}
                                    height={600}
                                    className="max-w-full max-h-[80vh] object-contain"
                                />

                                {/* Кнопка закрытия */}
                                <Dialog.Close asChild>
                                    <button
                                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
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
    )
}
