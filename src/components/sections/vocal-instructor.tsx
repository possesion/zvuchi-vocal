'use client'
import { Dialog } from 'radix-ui'
import { CirclePlay, X } from 'lucide-react'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

import '../styles.css'

interface VocalInstructor {
    instructor: {
        bio: React.JSX.Element
        image: string
        name: string
        specialty: string
        video: string
    }
}
export const VocalInstructor = ({ instructor }: VocalInstructor) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

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
        <div className="group flex flex-col items-center text-center">
            <div
                onClick={togglePlay}
                className="relative h-36 w-36 sm:h-48 sm:w-48"
            >
                <Dialog.Root modal>
                    <Dialog.Trigger>
                        <Image
                            src={instructor.image || '/placeholder.svg'}
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
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="DialogOverlay" />
                        <Dialog.Content asChild>
                            <div className='DialogContent'>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    className="x" // DialogContent
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
            <p className="mb-2">{instructor.specialty}</p>
            <ul className="w-[350px] p-2 bg-white/80 rounded-lg text-black text-left text-sm">
                {instructor.bio}
            </ul>
        </div>
    )
}
