'use client';

import { ReactElement, useEffect } from 'react';
import { QuizModal } from '../modals/quiz-modal';
import { Snackbar } from '../common/snackbar';
import { QuizProvider, useQuiz } from '../modals/quiz-context';
import { useUI } from '../providers/ui-context';

interface QuizButtonProps {
    children?: ReactElement;
    className?: string;
}

function QuizButtonInner({ children }: QuizButtonProps) {
    const { isOpen, handleOpen, handleClose, snackbar, setSnackbar } = useQuiz();
    const { setQuizOpen } = useUI();

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        setQuizOpen(isOpen);
        return () => {
            document.body.style.overflow = 'unset';
            setQuizOpen(false);
        };
    }, [isOpen, setQuizOpen]);

    return (
        <>
            <div onClick={handleOpen}>
                {children}
            </div>
            <QuizModal
                className="fixed inset-0 z-50 flex items-center justify-center text-black shadow-md rounded-sm w-full"
                isOpen={isOpen}
                onClose={handleClose}
            />
            <Snackbar
                isVisible={snackbar.isVisible}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar((prev) => ({ ...prev, isVisible: false }))}
                duration={4000}
            />
        </>
    );
}

export function QuizButton({ children, className }: QuizButtonProps) {
    return (
        <QuizProvider>
            <QuizButtonInner className={className}>
                {children}
            </QuizButtonInner>
        </QuizProvider>
    );
}
