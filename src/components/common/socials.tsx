import { FC } from 'react';
import { SOCIAL_ICON_SIZE } from './constants';
import { Phone } from './phone';
import { SocialLink } from './social-link';

interface SocialLink {
    alt: string;
    src: string;
    url: string;
}

interface SocialsProps {
    className?: string;
    links?: SocialLink[];
    size?: SOCIAL_ICON_SIZE;
    sendAnalytics?: boolean;
}

export const Socials: FC<SocialsProps> = ({ className, links = [], size = SOCIAL_ICON_SIZE.md, sendAnalytics = false }) => {
    return (
        <div className={className} role="list" aria-label="Социальные сети">
            <Phone className="hidden text-white transition-colors hover:text-primary xl:block" />
            {links.map(({ alt, src, url }) => (
                <SocialLink key={alt} alt={alt} src={src} url={url} size={size} sendAnalytics={sendAnalytics} />
            ))}
        </div>
    );
};