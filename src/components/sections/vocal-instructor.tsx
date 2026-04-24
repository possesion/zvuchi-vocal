'use client'
import { Dialog } from 'radix-ui'
import { VisuallyHidden } from '@radix-ui/themes';
import { CirclePlay, X } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import '../styles.css'
import classNames from 'classnames'

interface VocalInstructor {
    instructor: {
        bio: React.JSX.Element | string
        experience: string
        image: string
        name: string
        specialty: string[]
        feature: string
        video: string
    }
}
 const VocalInstructor = ({ instructor }: VocalInstructor) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const ref = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false)
    const [intersection, setIntersection] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIntersection(true);
                } else {
                    setIntersection(false);
                }
            })

        }, { threshold: 0.5 });
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef)
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, []);

    // Блокировка скролла при открытии модалки (без нарушения sticky)
    useEffect(() => {
        if (isModalOpen) {
            // Блокируем скролл без изменения position
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px';
        } else {
            // Восстанавливаем скролл
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        // Cleanup при размонтировании
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isModalOpen]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleModalChange = (open: boolean) => {
        if (instructor.video === '') {
            return;
        }
        setIsModalOpen(open);

        if (!open) {
            // Предотвращаем автоматический скролл к элементу при закрытии
            setTimeout(() => {
                if (ref.current) {
                    ref.current.blur();
                }
                // Убираем фокус с любых активных элементов
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }, 50);
        }
    }

    return (
        <article className="group flex flex-col items-center text-center lg:justify-center">
            <div
                ref={ref}
                onClick={togglePlay}
                className={classNames('mb-2 opacity-0', { 'delay-150 transition duration-500 opacity-100': intersection })}
            >
                <Dialog.Root modal onOpenChange={handleModalChange} open={isModalOpen}>
                    <Dialog.Trigger asChild>
                        <div
                            className="relative h-68 w-68 rounded-full inset-ring-4 inset-ring-violet-900" key={instructor.image}>
                            <Image
                                src={instructor.image || '/placeholder.png'}
                                sizes="300px"
                                alt={`Фото преподавателя ${instructor.name}`}
                                fill
                                className="group cursor-pointer overflow-hidden rounded-full object-cover transition-transform group-hover:scale-105"
                            />
                            {instructor.video && <CirclePlay
                                fill="var(--brand)"
                                color="white"
                                strokeWidth={0.5}
                                className="absolute right-0 top-0 h-16 w-16 cursor-pointer opacity-30 group-hover:opacity-100"
                                aria-label="Воспроизвести видео"
                            />}
                        </div>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" />
                        <VisuallyHidden>
                            <Dialog.Title className="mb-4 text-2xl font-bold">
                                Видео презентация преподавателя {instructor.name}
                            </Dialog.Title>
                        </VisuallyHidden>
                        <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                            <div className="relative h-full w-full max-h-[90vh] max-w-[90vw]">
                                {/* Видео на весь доступный размер */}
                                <iframe
                                    className="h-full w-full rounded-sm"
                                    src={instructor.video}
                                    style={{ border: 'none' }}
                                    allow="clipboard-write; autoplay"
                                    allowFullScreen
                                    aria-label={`Видео презентация преподавателя ${instructor.name}`}
                                ></iframe>
                                <Dialog.Close asChild>
                                    <button
                                        className="absolute -right-2 -top-2 z-10 rounded-full bg-black/70 p-2 text-white transition-all duration-200 hover:bg-black/90 hover:scale-110 md:-right-4 md:-top-4 md:p-3"
                                        aria-label="Закрыть видео"
                                    >
                                        <X className="h-5 w-5 md:h-6 md:w-6" />
                                    </button>
                                </Dialog.Close>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
            <h3 className="bg-dark rounded-sm shadow-lg px-4 pb-1 text-lg font-bold md:text-xl">{instructor.name}</h3>
            <p className="w-70"><b>Предмет: </b>{instructor.specialty?.join(', ')}</p>
            <p className="mb-2 w-70"><b>Сверхсила: </b>{instructor.feature}</p>
            <p><span className="mr-2" aria-hidden="true">📚</span>Опыт преподавания: {instructor.experience}</p>
        </article>
    )
}

export default VocalInstructor;