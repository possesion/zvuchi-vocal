'use client'
import { Dialog } from 'radix-ui'
import { CirclePlay, X } from 'lucide-react'
import Image from 'next/image'
import React, { createRef, useEffect, useRef, useState } from 'react'

import '../styles.css'
import classNames from 'classnames'

interface VocalInstructor {
    instructor: {
        bio: React.JSX.Element
        experience: string
        image: string
        name: string
        specialty: string
        video: string
    }
}
export const VocalInstructor = ({ instructor }: VocalInstructor) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const ref = createRef<HTMLDivElement>();
    const [isPlaying, setIsPlaying] = useState(false)
    const [intersection, setIntersection] = useState(false);

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

        if (ref.current) {
            observer.observe(ref.current)
        }
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, []);

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

    return (
        <div className="group flex flex-col items-center justify-center text-center">
            <div
                ref={ref}
                onClick={togglePlay}
                className={classNames('mb-2 opacity-0', { 'transition delay-250 duration-600 opacity-100': intersection })}
            >
                <Dialog.Root modal>
                    <Dialog.Trigger asChild>
                        <div
                            className="relative h-68 w-68" key={instructor.image}>
                            <Image
                                src={instructor.image || '/placeholder.svg'}
                                sizes='300px'
                                alt={instructor.name}
                                fill
                                className="cursor-pointer object-cover transition-transform group-hover:scale-105 group overflow-hidden rounded-full"
                            />
                            <CirclePlay
                                fill="var(--brand)"
                                color='white'
                                strokeWidth={0.5}
                                className="cursor-pointer opacity-30 h-16 w-16 absolute top-0 right-0 group-hover:opacity-100"
                            />
                        </div>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="DialogOverlay" />
                        <Dialog.Content asChild>
                            <div
                                className='DialogContent'
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    controls={isPlaying}
                                    onPause={() => setIsPlaying(false)}
                                    onPlay={() => setIsPlaying(true)}
                                    src={instructor.video}
                                />
                                <Dialog.Close>
                                    <button
                                        className="IconButton"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </Dialog.Close>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
            <h3 className="text-lg md:text-xl font-bold">{instructor.name}</h3>
            <p className="w-60 mb-2"><b>Сверхсила: </b>{instructor.specialty}</p>
            <p><span className='mr-2'>📚</span>Опыт преподавания: {instructor.experience}</p>
        </div>
    )
}
