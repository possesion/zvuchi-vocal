'use client'
import { Dialog } from 'radix-ui'
import { PlayIcon, X } from 'lucide-react'
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
                className="relative h-36 w-36 sm:h-48 sm:w-48 overflow-hidden rounded-full"
            >
                <Dialog.Root modal>
                    <Dialog.Trigger asChild>
                        <>
                            <Image
                                src={instructor.image || '/placeholder.svg'}
                                alt={instructor.name}
                                fill
                                className="cursor-pointer object-cover transition-transform group-hover:scale-105"
                            />
                            <PlayIcon className="h-4 w-4" />
                        </>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="DialogOverlay" />
                        <Dialog.Content className="z-50 DialogContent">
                            <video
                                ref={videoRef}
                                autoPlay
                                className="h-full z-60"
                                controls={isPlaying}
                                onPause={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                                src={instructor.video}
                            />
                            <Dialog.Close asChild>
                                <button
                                    className="IconButton z-60"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
            {/* <video
                ref={videoRef}
                autoPlay
                className="h-full"
                controls={isPlaying}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                src={instructor.video}
            /> */}
            <h3 className="text-lg md:text-xl font-bold">{instructor.name}</h3>
            <p className="text-primary mb-2">{instructor.specialty}</p>
            <ul className="w-[350px] text-left text-sm text-muted-foreground">
                {instructor.bio}
            </ul>
        </div>
    )
}
