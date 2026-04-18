import { useEffect } from 'react';
import { QuizModal } from '../../modals/quiz-modal';
import { useQuiz } from '../../modals/quiz-context';
import { useUI } from '../../providers/ui-context';
import { QuizButtonProps } from './types';

export function QuizButtonInner({ children }: QuizButtonProps) {
    const { isOpen, handleOpen, handleClose } = useQuiz();
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
                className="fixed inset-0 z-[200] flex items-center justify-center text-black shadow-md rounded-sm w-full"
                isOpen={isOpen}
                onClose={handleClose}
            />
        </>
    );
}
