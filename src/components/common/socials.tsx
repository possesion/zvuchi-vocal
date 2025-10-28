import Image from 'next/image'
import { FC } from 'react';
import { SOCIAL_ICON_SIZE } from './constants';
import { socials } from '@/app/constants';


interface SocialsProps {
    className?: string;
    size?: SOCIAL_ICON_SIZE
}

export const Socials: FC<SocialsProps> = ({ className, size = SOCIAL_ICON_SIZE.md }) => {
    return (
        <div className={className} role="list" aria-label="Социальные сети">
            {socials.map(({ alt, src, url }) => (
                <a
                    href={url}
                    key={alt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                    aria-label={`Перейти в ${alt}`}
                >
                    <Image
                        alt={alt}
                        width={size}
                        height={size}
                        src={src}
                    />
                </a>
            ))}
        </div>
    )
}