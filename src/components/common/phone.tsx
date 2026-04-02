'use client';

import { FC, ReactElement } from "react"
import { trackEvent } from "@/hooks/use-yandex-metrica";
import { STUDIO_MOBILE_PHONE } from "@/app/constants";

interface PhoneProps {
    className?: string;
    label?: string | ReactElement;
}

export const Phone: FC<PhoneProps> = ({ className, label = STUDIO_MOBILE_PHONE }) => {
    const handleSendAnalytic = (link: string) => () => {
        trackEvent(link);
    }

    return (
        <a
            href="tel:+79966476035"
            onClick={handleSendAnalytic('phone_click')}
            className={className}
        >
            {label}
        </a>
    )
}
