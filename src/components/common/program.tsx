import { useSlideUpAnimation } from "@/hooks/use-slide-up-animation";
import { FC } from "react"
import cn from 'classnames'
import { YANDEX_ENROLLMENT_URL } from "../constants";

interface ProgramProps {
    title: string;
    number: number;
    features: string[];
    description: string;
    price: string;
    className?: string;
}

export const Program: FC<ProgramProps> = ({ description, features, title, number, price }) => {
    const { ref, animationClass } = useSlideUpAnimation();
    // const intersected = false;

    const handleOpenLink = (link: string) => () => {
        if (window) {
            window.open(link, '_blank');
        }
    }

    return (
        <article
            key={title}
            className={cn(animationClass, 'group relative flex w-full shrink-0 flex-col rounded-sm bg-black/85 p-6 shadow-md brightness-96 md:flex-row')}
            ref={ref}
        >
            <div className="flex w-20">
                <div className="hidden font-bold text-white/50 lg:block xl:text-8xl" aria-hidden="true">
                    {number}
                </div>
            </div>
            <div className="">
                <h3 className="mb-4 block text-2xl font-bold xl:text-4xl">{title}</h3>
                <p className="mb-2 font-bold">{description}</p>
                <ul className="mb-2 space-y-2 font-bold">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <span className="text-base">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-between pr-4 text-xl font-bold md:ml-auto md:flex-col lg:text-4xl">
                <span>{price}</span>
                <button
                    onClick={handleOpenLink(YANDEX_ENROLLMENT_URL)}
                    className="block cursor-pointer rounded-sm border px-3 hover:animate-rotational-wave md:py-2"
                    aria-label={`Записаться на ${title}`}
                >
                    <span className="relative text-xl lg:text-3xl">
                        <div>Запись</div>
                    </span>
                </button>
            </div>
        </article>
    )
}