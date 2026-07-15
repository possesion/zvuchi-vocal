'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import '../styles.css'
import classNames from 'classnames'
import { MousePointerClick } from 'lucide-react'
import { MentorLevelValue } from '@/app/programs/types'
import { MentorLevel } from '@/app/programs/constants'
import { levelStyles } from './constants'

interface VocalInstructor {
    instructor: {
        bio: React.JSX.Element | string
        experience: string
        image: string
        level: MentorLevelValue
        name: string
        specialty: string[]
        feature: string
        video: string
    },
    showTip: boolean
}

const VocalInstructor = ({ instructor, showTip }: VocalInstructor) => {
    const ref = useRef<HTMLDivElement>(null);
    const [intersection, setIntersection] = useState(false);

    const levelStyle = levelStyles[instructor.level] || levelStyles.expert;
    const levelTitle = MentorLevel[instructor.level]?.title || 'Эксперт';

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

    return (
        <article className="group flex flex-col items-center text-center lg:justify-center cursor-pointer">
            <div
                ref={ref}
                className={classNames('relative mb-2 opacity-0', { 'delay-150 transition duration-500 opacity-100': intersection })}
            >
                {showTip
                    ? <div className="absolute top-2 right-2 z-10 flex items-center gap-2 rounded-full bg-black/40 px-2 py-2 backdrop-blur-md">
                        <span className="text-sm font-medium text-white/90">Нажми</span>
                        <MousePointerClick className="h-5 w-5 animate-[pop_2s_ease-in-out_infinite] text-white/80" />
                    </div>
                    : null}
                <div
                    className="relative h-90 w-80 rounded-sm inset-ring-4 inset-ring-violet-900"
                    key={instructor.image}
                >
                    <Image
                        src={instructor.image || '/placeholder.png'}
                        sizes="300px"
                        alt={`Фото преподавателя ${instructor.name}`}
                        fill
                        className="group overflow-hidden rounded-sm object-cover transition-transform group-hover:scale-105"
                    />
                    <div className={`absolute bottom-1 right-1 px-3 py-1 rounded-sm ${levelStyle.bg} ${levelStyle.text} shadow-lg`}>
                        <span className="font-bold text-md tracking-wide">{levelTitle}</span>
                    </div>
                </div>
            </div>
            <h3 className="px-4 pb-1 text-2xl font-bold md:text-3xl">{instructor.name}</h3>
            <p className="w-70"><b>Предмет: </b>{instructor.specialty?.join(', ')}</p>
            <p className="w-70 hyphens-auto" lang="ru"><b>Сверхсила: </b>{instructor.feature}</p>
        </article>
    )
}

export default VocalInstructor;