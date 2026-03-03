'use client';

import { FC } from "react"
import { trackEvent } from "@/hooks/use-yandex-metrica";

interface PhoneProps {
    phoneNumber?: string;
}

export const Phone: FC<PhoneProps> = ({ phoneNumber = '+7 (977) 967-50-01' }) => {
    const handleSendAnalytic = (link: string) => () => {
        trackEvent(link);
    }

    return (
        <a
            href="tel:+79779675001"
            onClick={handleSendAnalytic('phone_click')}
            className="hidden text-white transition-colors hover:text-primary xl:block"
        >
            {phoneNumber}
        </a>
    )
}
