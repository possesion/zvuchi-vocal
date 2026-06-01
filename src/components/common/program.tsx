'use client';

import { useSlideUpAnimation } from "@/hooks/use-slide-up-animation";
import { FC } from "react"
import cn from 'classnames'
import Link from 'next/link';
import { trackEvent } from '@/hooks/use-yandex-metrica';

interface ProgramProps {
    title: string;
    number: string | number;
    features: string[];
    description: string;
    price: string;
    originalPrice?: string;
    slug?: string;
    className?: string;
}

export const Program: FC<ProgramProps> = ({ description, title, number, price, originalPrice, slug }) => {
    const { ref, animationClass } = useSlideUpAnimation();

    const handleClick = () => {
        trackEvent('program-click', {
            program_name: title,
            price: price
        });
    }

    return (
        <article
            key={title}
            className={cn(animationClass, 'h-40 group relative flex w-full shrink-0 flex-col rounded-sm bg-black/85 p-6 shadow-md brightness-96 md:flex-row')}
            ref={ref}
        >
            <div className="flex w-20">
                <div className="hidden font-bold text-white/50 md:text-8xl md:block" aria-hidden="true">
                    {number}
                </div>
            </div>
            <div className="">
                <h3 className="mb-4 block text-2xl font-bold xl:text-4xl">{title}</h3>
                <p className="mb-2 font-bold">{description}</p>
            </div>
            <div className="flex justify-between pr-4 text-xl font-bold md:ml-auto md:flex-col lg:text-4xl">
                <div className="flex items-center gap-3">
                    {originalPrice && (
                        <span className="text-lg text-white/60 line-through lg:text-2xl">
                            {originalPrice}
                        </span>
                    )}
                    <span>от {price}</span>
                </div>
                {slug ? (
                    <Link
                        href={`/programs/${slug}`}
                        onClick={handleClick}
                        className="ml-auto block cursor-pointer rounded-sm border px-3 hover:animate-rotational-wave md:py-2 text-center"
                        aria-label={`Подробнее о ${title}`}
                    >
                        <span className="relative text-xl lg:text-3xl">
                            <div>Подробнее</div>
                        </span>
                    </Link>
                ) : (
                    <span className="w-[130px] ml-auto block px-3 md:py-2 text-center text-white/50">
                        <span className="relative text-xl lg:text-3xl">
                            <div>Запись</div>
                        </span>
                    </span>
                )}
            </div>
        </article>
    )
}