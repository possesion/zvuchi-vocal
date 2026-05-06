'use client'

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
    const ref = useRef<HTMLDivElement>(null);
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
                className={classNames('mb-2 opacity-0', { 'delay-150 transition duration-500 opacity-100': intersection })}
            >
                <div
                    className="relative h-68 w-68 rounded-full inset-ring-4 inset-ring-violet-900"
                    key={instructor.image}
                >
                    <Image
                        src={instructor.image || '/placeholder.png'}
                        sizes="300px"
                        alt={`Фото преподавателя ${instructor.name}`}
                        fill
                        className="group overflow-hidden rounded-full object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            </div>
            <h3 className="bg-dark rounded-sm shadow-lg px-4 pb-1 text-lg font-bold md:text-xl">{instructor.name}</h3>
            <p className="w-70"><b>Предмет: </b>{instructor.specialty?.join(', ')}</p>
            <p className="w-70 hyphens-auto" lang="ru"><b>Сверхсила: </b>{instructor.feature}</p>
            <p><span className="mr-2" aria-hidden="true">📚</span><b>Опыт преподавания:</b> {instructor.experience}</p>
        </article>
    )
}

export default VocalInstructor;