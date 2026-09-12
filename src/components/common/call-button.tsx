'use client';

import { usePathname } from 'next/navigation';
import { useMedia } from 'react-use';
import { Mail } from 'lucide-react';
import { Drawer } from 'vaul';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import { contacts, STUDIO_MOBILE_PHONE } from '@/app/constants';
import Image from 'next/image';
import { DesktopPopup } from './desktop-popup';
import { useUI } from '@/components/providers/ui-context';



// function handlePhoneClick() {
//     const onVisibilityChange = () => {
//         if (document.visibilityState === 'hidden') {
//             trackEvent('phone_overlay_click');
//             document.removeEventListener('visibilitychange', onVisibilityChange);
//         }
//     };
//     document.addEventListener('visibilitychange', onVisibilityChange);
//     setTimeout(() => document.removeEventListener('visibilitychange', onVisibilityChange), 3000);
// }

export const CircleButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        aria-label="Связаться с нами"
        className={`flex h-20 w-20 bg-white shrink-0 items-center justify-center rounded-full shadow-[0_0_25px_8px_rgba(127,29,29,0.5)] transition-transform hover:scale-110 active:scale-95`}
    >
        <svg className="absolute inset-0 w-20 h-20" viewBox="0 0 80 80">
            <defs>
                <path id="circle-path" d="M 40,40 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" />
            </defs>
            <text className="fill-red/70 text-[8px] font-bold tracking-[0.15em] uppercase">
                <textPath href="#circle-path" startOffset="30%" textAnchor="middle">
                    Записаться
                </textPath>
            </text>
        </svg>
        <Mail color='#560707' className="relative z-10 h-7 w-7" />
    </button>
);

export const ContactItems = ({ onClose }: { onClose?: () => void }) => {
    const [tg,, max] = contacts;
    return (
        <div className="divide-y divide-gray-100">
            <a
                href="tel:+79966476035"
                onClick={() => { trackEvent('phone_overlay_click'); onClose?.(); }}
                className="flex items-center gap-4 px-6 py-4 text-gray-900 transition-colors hover:bg-gray-50 active:bg-gray-50"
            >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500">
                    <Mail color='#290808' className="h-5 w-5" />
                </span>
                <span className="text-base font-medium whitespace-nowrap">Позвонить {STUDIO_MOBILE_PHONE}</span>
            </a>
            <a
                href={tg.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { trackEvent('write-tg'); onClose?.(); }}
                className="flex items-center gap-4 px-6 py-4 text-gray-900 transition-colors hover:bg-gray-50 active:bg-gray-50"
            >
                <Image src="/socials/telegram-color.svg" alt="tg" width={30} height={30} className="rounded-full shrink-0" />
                <span className="text-base font-medium">Написать в Telegram</span>
            </a>
            <a
                href={max.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { trackEvent('write-max'); onClose?.(); }}
                className="flex items-center gap-4 px-6 py-4 text-gray-900 transition-colors hover:bg-gray-50 active:bg-gray-50"
            >
                <Image src="/socials/max-color.svg" alt="Max" width={30} height={30} className="rounded-full shrink-0" />
                <span className="text-base font-medium">Написать в Max</span>
            </a>
        </div>
    );
};

function MobileDrawer() {
    return (
        <Drawer.Root>
            <Drawer.Trigger asChild>
                <div className="fixed bottom-7 right-6 z-50">
                    <CircleButton onClick={() => {}} />
                </div>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
                <Drawer.Content aria-describedby={undefined} className="fixed bottom-0 left-0 right-0 z-50 outline-none">
                    <div className="rounded-t-2xl bg-white overflow-hidden">
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="h-1 w-10 rounded-full bg-gray-300" />
                        </div>
                        <Drawer.Title className="text-center text-sm text-gray-500 py-3 px-4">
                            Как вам удобнее с нами связаться?
                        </Drawer.Title>
                        <div className="border-t border-gray-100">
                            <ContactItems />
                        </div>
                        <Drawer.Close asChild>
                            <button className="w-full py-4 text-center text-base font-medium text-blue-500 border-t border-gray-100 transition-colors active:bg-gray-50">
                                Отмена
                            </button>
                        </Drawer.Close>
                        <div className="bg-white pb-2" />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

export function CallButton() {
    const isMobile = !useMedia('(min-width: 768px)', true);
    const { quizOpen } = useUI();
    const pathname = usePathname();

    if (quizOpen) return null;
    if (pathname?.startsWith('/contest')) return null;

    return isMobile ? <MobileDrawer /> : <DesktopPopup />;
}
