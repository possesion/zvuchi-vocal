'use client';

import { Phone } from 'lucide-react';
import { trackEvent } from '@/hooks/use-yandex-metrica';

export function CallButton() {
    return (
        <a
            href="tel:+79966476035"
            onClick={() => trackEvent('phone_overlay_click')}
            aria-label="Позвонить нам"
            className="fixed animate-[halo_3s_ease-in-out_infinite] bottom-6 right-6 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-radial-[at_40%] from-red-900 to-red-950 to-80% transition-transform hover:scale-110 active:scale-95"
        >
            {/* Текст по окружности */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
                <defs>
                    <path id="circle-path" d="M 40,40 m -28,0 a 28,28 0 1,1 56,0 a 28,28 0 1,1 -56,0" />
                </defs>
                <text className="fill-white/70 text-[8.5px] font-semibold tracking-[0.2em] uppercase">
                    <textPath href="#circle-path" startOffset="17%" textAnchor="middle">
                        позвонить
                    </textPath>
                </text>
            </svg>
            <Phone className="relative z-10 h-6 w-6 text-white" />
        </a>
    );
}
