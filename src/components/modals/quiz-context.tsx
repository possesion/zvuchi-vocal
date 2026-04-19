'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import { formatPhoneNumber } from '@/lib/format';
import { EXPERIENCE_OPTIONS, GENRE_OPTIONS, MOTIVATION_OPTIONS } from './constants';
import { useUI } from '@/components/providers/ui-context';

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
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [isAgreed, setIsAgreed] = useState(false);
    const [offeraIsOpen, setOfferaIsOpen] = useState(false);
    const trackedStepsKey = 'quiz_tracked_steps';

    const getTrackedSteps = (): Set<number> => {
        try {
            const raw = sessionStorage.getItem(trackedStepsKey);
            return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
        } catch {
            return new Set();
        }
    };

    const addTrackedStep = (step: number) => {
        try {
            const steps = getTrackedSteps();
            steps.add(step);
            sessionStorage.setItem(trackedStepsKey, JSON.stringify([...steps]));
        } catch {
            console.error('Ошибка при получении данных о прохождении опроса');
        }
    };

    useEffect(() => {
        if (step < 2) return;
        if (getTrackedSteps().has(step)) return;
        const eventNames: Record<number, string> = {
            2: 'quiz_step_2_genre',
            3: 'quiz_step_3_motivation',
            4: 'quiz_step_4_contact',
        };
        const eventName = eventNames[step];
        if (eventName) {
            trackEvent(eventName, quizAnswers);
            addTrackedStep(step);
        }
    }, [step, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps


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
            const emailData = {
                ...formData,
                formType: 'quiz',
                quizAnswers: {
                    experience: EXPERIENCE_OPTIONS.find((o) => o.value === quizAnswers.experience)?.label || '',
                    genre: quizAnswers.genre === 'other'
                        ? quizAnswers.genreOther || 'Другое'
                        : GENRE_OPTIONS.find((o) => o.value === quizAnswers.genre)?.label || '',
                    motivation: quizAnswers.motivation === 'other'
                        ? quizAnswers.motivationOther || 'Другое'
                        : MOTIVATION_OPTIONS.find((o) => o.value === quizAnswers.motivation)?.label || '',
                },
            };

            const response = await fetch('/api/send-mail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData),
            });
            const result = await response.json();

            if (response.ok) {
                trackEvent('quiz_form')
                notify('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
                setFormData({ name: '', phone: '' });
                setQuizAnswers({ experience: '', genre: '', motivation: '' });
                setIsAgreed(false);
                setStep(1);
                setTimeout(handleClose, 2000);
            } else {
                notify(result.error || 'Произошла ошибка при отправке заявки. Попробуйте позже.', 'error');
            }
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            notify('Произошла ошибка при отправке заявки. Попробуйте позже.', 'error');
        }
    };

    const handleValidate = (text: string) => (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.setCustomValidity(text);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'phone' ? formatPhoneNumber(value) : value });
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
