'use client';

import { X } from 'lucide-react';
import { QuizModalContent } from './quiz-modal-content';
import { QuizProvider } from './quiz-context';

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

function QuizModalInner({ className, onClose }: Omit<QuizModalProps, 'isOpen'>) {
    return (
        <div className={className} role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
            <div className="animate-fade-in relative mx-4 w-full max-w-[600px] h-[670px] overflow-y-auto rounded-sm bg-white shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 z-30 rounded-full p-2 transition-colors hover:bg-gray-100"
                    aria-label="Закрыть модальное окно"
                >
                    <X className="h-6 w-6" />
                </button>
                <QuizModalContent className="h-full flex flex-col justify-between pt-8 pb-6 px-4 md:p-8" />
            </div>
        </div>
    );
}

export function QuizModal({ isOpen, onClose, className }: QuizModalProps) {
    if (!isOpen) return null;

    return (
        <QuizProvider onClose={onClose}>
            <QuizModalInner className={className} onClose={onClose} />
        </QuizProvider>
    );
}
