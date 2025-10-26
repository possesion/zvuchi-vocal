import { useSlideUpAnimation } from "@/hooks/use-slide-up-animation";
import { FC } from "react"
import cn from 'classnames'
import { TG_CHAT_URL } from "../constants";

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
        <div
            key={title}
            className={cn(animationClass, 'flex flex-col brightness-96 group relative w-full flex p-6 bg-black/85 rounded-lg shadow-md shrink-0 lg:flex-row')}
            ref={ref}
        >
            <div className="w-20 flex">
                <div className="hidden text-bold text-white/50 lg:block xl:text-8xl">
                    {number}
                </div>
            </div>
            <div className="">
                <h3 className="block text-2xl font-bold mb-4 xl:text-4xl">{title}</h3>
                <p className="font-bold mb-2">{description}</p>
                <div className="font-bold space-y-2 mb-2">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                            <span className="text-base">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between pr-4 font-bold text-xl md:flex-col md:ml-auto lg:text-4xl">
                <span>{price}</span>
                <button
                    onClick={handleOpenLink(TG_CHAT_URL)}
                    className="cursor-pointer block px-3 border rounded-lg hover:animate-rotational-wave md:py-2"
                // className="block m-auto cursor-pointer relative overflow-hidden group px-4 py-2 backdrop-brightness-[.9] border border-white text-white font-bold rounded-lg shadow-xl/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <span className="relative text-xl lg:text-3xl">
                        <div>Запись</div>
                        {/* <img
                            width={20}
                            height={20}
                            className='z-100 inline ml-1'
                            src="socials/tg.svg"
                            alt="tg"
                        /> */}
                    </span>
                    {/* <span className="absolute top-0 left-0 w-full h-full overflow-hidden">
                        <span className="absolute top-0 -left-full w-1/2 h-full bg-linear-to-r from-transparent via-white/50 to-transparent group-hover:left-full transition-all duration-1000"></span>
                    </span> */}
                </button>
            </div>
        </div>
    )
}