'use client';

import { useState, useEffect } from 'react';
import { useMedia } from 'react-use';
import { QuizModal } from '../modals/quiz-modal';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import { actionButtonStyle } from '@/app/constants';

interface QuizButtonProps {
    className?: string;
}

export function QuizButton({ className }: QuizButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    // const isMobile = useMedia('(max-width: 640px)', false);
    const isWide = useMedia('(min-width: 480px)');

    // Автоматически открываем квиз на мобильных устройствах
    useEffect(() => {
        if (isWide) {
            // console.log('HSHSHS ', isMobile)
            setIsOpen(true);
        }
    }, [isWide]);

    const handleOpen = () => {
        trackEvent('open_quiz_modal');
        setIsOpen(true);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className={
                    className ||
                    `group relative ${actionButtonStyle} mb-4 block cursor-pointer overflow-hidden rounded-sm px-9 py-3 text-2xl font-bold text-white transition-all duration-300 hover:scale-105 sm:hidden`
                }
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    Пройди опрос и получи скидку
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
            </button>
            <QuizModal
                className="fixed inset-0 z-50 flex items-center justify-center shadow-md brightness-96 rounded-sm w-full sm:static sm:block sm:bg-white md:w-[630px] sm:h-[630px]"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
