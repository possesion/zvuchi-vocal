'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import { EXPERIENCE_OPTIONS, GENRE_OPTIONS, MOTIVATION_OPTIONS } from './constants';
import { useUI } from '@/components/providers/ui-context';
import { useQuizAnalytics } from '@/hooks/use-quiz-analytics';
import { useContactForm } from '@/hooks/useContactForm';
import { submitQuizAction } from '@/app/actions/quiz';

export type QuizAnswers = {
    experience: string;
    genre: string;
    genreOther?: string;
    motivation: string;
    motivationOther?: string;
};

interface QuizContextValue {
    step: number;
    totalSteps: number;
    quizAnswers: QuizAnswers;
    formData: { name: string; phone: string };
    isAgreed: boolean;
    offeraIsOpen: boolean;
    isOpen: boolean;
    canProceed: () => boolean;
    handleOpen: () => void;
    handleClose: () => void;
    handleNext: () => void;
    handleBack: () => void;
    handleQuizAnswer: (field: keyof QuizAnswers, value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleValidate: (text: string) => (e: React.FormEvent<HTMLInputElement>) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setIsAgreed: (value: boolean) => void;
    setOfferaIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function useQuiz() {
    const ctx = useContext(QuizContext);
    if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
    return ctx;
}

export function QuizProvider({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
    const totalSteps = 4;
    const { notify } = useUI();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({ experience: '', genre: '', motivation: '' });
    const [offeraIsOpen, setOfferaIsOpen] = useState(false);

    const { formData, isAgreed, setIsAgreed, handleChange, handleValidate, reset } = useContactForm();

    useQuizAnalytics(step, isOpen, quizAnswers);

    const handleOpen = () => {
        trackEvent('open_quiz_modal');
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        onClose?.();
    };

    const handleNext = () => { if (step < totalSteps) setStep(step + 1); };
    const handleBack = () => { if (step > 1) setStep(step - 1); };

    const handleQuizAnswer = (field: keyof QuizAnswers, value: string) => {
        setQuizAnswers((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const resolvedAnswers = {
                experience: EXPERIENCE_OPTIONS.find((o) => o.value === quizAnswers.experience)?.label || '',
                genre: quizAnswers.genre === 'other'
                    ? quizAnswers.genreOther || 'Другое'
                    : GENRE_OPTIONS.find((o) => o.value === quizAnswers.genre)?.label || '',
                motivation: quizAnswers.motivation === 'other'
                    ? quizAnswers.motivationOther || 'Другое'
                    : MOTIVATION_OPTIONS.find((o) => o.value === quizAnswers.motivation)?.label || '',
            };

            const result = await submitQuizAction({
                name: formData.name,
                phone: formData.phone,
                formType: 'quiz',
                quizAnswers: resolvedAnswers,
            });

            if (result.success) {
                trackEvent('quiz_form');
                notify('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
                reset();
                setQuizAnswers({ experience: '', genre: '', motivation: '' });
                setStep(1);
                setTimeout(handleClose, 2000);
            } else {
                notify(result.error, 'error');
            }
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            notify('Произошла ошибка при отправке заявки. Попробуйте позже.', 'error');
        }
    };

    const canProceed = (): boolean => {
        switch (step) {
            case 1: return quizAnswers.experience !== '';
            case 2: return quizAnswers.genre !== '' && (quizAnswers.genre !== 'other' || !!quizAnswers.genreOther);
            case 3: return quizAnswers.motivation !== '' && (quizAnswers.motivation !== 'other' || !!quizAnswers.motivationOther);
            case 4: return !!(formData.name && formData.phone.length === 18 && isAgreed);
            default: return false;
        }
    };

    return (
        <QuizContext.Provider value={{
            step, totalSteps, quizAnswers, formData, isAgreed, offeraIsOpen,
            isOpen, canProceed, handleOpen, handleClose, handleNext,
            handleBack, handleQuizAnswer, handleSubmit, handleValidate,
            handleChange, setIsAgreed, setOfferaIsOpen,
        }}>
            {children}
        </QuizContext.Provider>
    );
}
