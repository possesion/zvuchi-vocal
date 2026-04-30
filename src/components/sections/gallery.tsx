'use client'

import { TouchEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog } from 'radix-ui'
import 'react-image-gallery/styles/css/image-gallery.css'
import { Shorts } from '../common/shorts'
import { BUCKET_URL } from '../constants'
import { GalleryUploader } from './gallery-uploader'
import { StudioGallery } from './studio-gallery'

export const Gallery = ({ isAuthorized = false }: { isAuthorized?: boolean }) => {
    const [images, setImages] = useState<{ alt: string; src: string; fileName: string }[]>([])
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState(0)
    const [scrollStart, setScrollStart] = useState(0)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [deleteTarget, setDeleteTarget] = useState<{ src: string; fileName: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    function handleTouchStart(e: TouchEvent<HTMLElement>) {
        setTouchStart(e.targetTouches[0].clientX)
    }

    function handleTouchMove(e: TouchEvent<HTMLElement>) {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    function handleTouchEnd() {
        if (touchStart - touchEnd > 150) nextImage()
        if (touchStart - touchEnd < -150) prevImage()
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        const gallery = e.currentTarget as HTMLElement
        setIsDragging(true)
        setDragStart(e.clientX)
        setScrollStart(gallery.scrollLeft)
        gallery.style.cursor = 'grabbing'
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        e.preventDefault()
        const gallery = e.currentTarget as HTMLElement
        gallery.scrollLeft = scrollStart - (e.clientX - dragStart)
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        setIsDragging(false);
        (e.currentTarget as HTMLElement).style.cursor = 'grab'
    }

    const handleMouseLeave = (e: React.MouseEvent) => {
        if (isDragging) {
            setIsDragging(false);
            (e.currentTarget as HTMLElement).style.cursor = 'grab'
        }
    }

    const openImage = (index: number) => setSelectedIndex(index)
    const nextImage = () => setSelectedIndex((prev) => (prev + 1) % images.length)
    const prevImage = () => setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)

    useEffect(() => {
        const pictures: { alt: string; src: string; fileName: string }[] = []
        for (let i = 1; i <= 42; i++) {
            pictures.push({
                alt: `photo-${i}`,
                fileName: `${i}.jpg`,
                src: `${BUCKET_URL}/dd3d1966-zvuchi-media/concert-29-11/${i}.jpg`,
            })
        }
        setImages(pictures)

        fetch('/api/v1/concert-photos')
            .then((r) => r.json())
            .then(({ urls }) => {
                if (!urls?.length) return
                const newPhotos = (urls as string[]).map((src, i) => ({
                    src,
                    alt: `concert-new-${i + 1}`,
                    fileName: src.split('/').pop() ?? `new-${i}`,
                }))
                setImages([...newPhotos, ...pictures])
            })
            .catch(() => console.error('Ошибка загрузки фотографий'))
    }, [])

    const handleUploaded = (url: string) => {
        setImages((prev) => [
            { src: url, alt: `concert-new-${Date.now()}`, fileName: url.split('/').pop() ?? 'new' },
            ...prev,
        ])
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await fetch('/api/v1/concert-photos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: 'authorized' },
                body: JSON.stringify({ fileName: deleteTarget.fileName }),
            })
            setImages((prev) => prev.filter((img) => img.fileName !== deleteTarget.fileName))
        } finally {
            setIsDeleting(false)
            setDeleteTarget(null)
        }
    }

    return (
        <section id="gallery" className="mx-auto py-10 md:px-4 lg:py-16">
            <StudioGallery />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-xl font-semibold text-white/90 md:text-3xl">Концерты</p>
                {isAuthorized && <GalleryUploader onUploaded={handleUploaded} />}
            </div>
            <div className="relative">
                <div className="absolute -top-2 right-4 z-10 flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white/90">Прокрути</span>
                    <div className="flex gap-1">
                        <svg className="h-5 w-5 animate-[swipe_2s_ease-in-out_infinite] text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
                <div
                    className="gallery-scroll flex space-x-4 overflow-x-auto pb-4 whitespace-nowrap scrollbar-hide no-scrollbar select-none cursor-grab"
                    role="region"
                    aria-label="Галерея фотографий концертов"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    {images?.map((image, index) => (
                        <div key={image.fileName} className="relative shrink-0 w-[280px] h-[330px]">
                            <Dialog.Root>
                                <Dialog.Trigger asChild>
                                    <button
                                        onClick={() => openImage(index)}
                                        className="absolute inset-0 cursor-pointer overflow-hidden rounded-sm transition-opacity hover:opacity-90 select-none"
                                        aria-label={`Открыть изображение ${image.alt}`}
                                        onDragStart={(e) => e.preventDefault()}
                                    >
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            sizes="280px"
                                            className="object-cover pointer-events-none"
                                            draggable={false}
                                            onDragStart={(e) => e.preventDefault()}
                                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                                            placeholder="blur"
                                            loading={index < 6 ? 'eager' : 'lazy'}
                                            quality={80}
                                        />
                                    </button>
                                </Dialog.Trigger>
                                <Dialog.Portal>
                                    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
                                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform outline-none">
                                        <div className="relative max-h-[90vh] min-w-[380px] max-w-[90vw] md:min-w-[680px]">
                                            <Image
                                                src={images[selectedIndex].src}
                                                alt={images[selectedIndex].alt}
                                                onTouchStart={(e) => handleTouchStart(e)}
                                                onTouchMove={(e) => handleTouchMove(e)}
                                                onTouchEnd={handleTouchEnd}
                                                width={800}
                                                height={600}
                                                sizes="(max-width: 768px) 90vw, 80vw"
                                                className="max-h-[80vh] max-w-full object-contain"
                                            />
                                            <Dialog.Close asChild>
                                                <button className="absolute right-4 top-2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70" aria-label="Закрыть галерею">
                                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </Dialog.Close>
                                            {images.length > 1 && (
                                                <>
                                                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70" aria-label="Предыдущее изображение">
                                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70" aria-label="Следующее изображение">
                                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                                                {selectedIndex + 1} / {images.length}
                                            </div>
                                        </div>
                                    </Dialog.Content>
                                </Dialog.Portal>
                            </Dialog.Root>
                            {isAuthorized && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(image) }}
                                    className="absolute right-2 top-2 z-20 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
                                    aria-label={`Удалить изображение ${image.alt}`}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <Shorts isAuthorized={isAuthorized} />
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
                    <div className="mx-4 w-full max-w-sm rounded-lg bg-zinc-900 p-6 text-white shadow-xl">
                        <p className="mb-2 text-lg font-semibold">Удалить фото?</p>
                        <p className="mb-6 text-sm text-white/60">Это действие нельзя отменить.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                className="rounded-md px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
