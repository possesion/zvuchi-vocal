'use client';

import Image from 'next/image';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import { SOCIAL_ICON_SIZE } from './constants';

interface SocialLinkProps {
    alt: string;
    src: string;
    url: string;
    size: SOCIAL_ICON_SIZE;
    sendAnalytics: boolean;
}

export const SocialLink = ({ alt, src, url, size, sendAnalytics }: SocialLinkProps) => {
    const handleClick = () => {
        if (sendAnalytics) {
            trackEvent(`write-${alt}`);
        }
    };

    return (
        <a
            href={url}
            onClick={handleClick}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center transition-transform hover:scale-110"
            aria-label={`Перейти в ${alt}`}
        >
            <Image alt={alt} width={size} height={size} src={src} />
        </a>
    );
};
