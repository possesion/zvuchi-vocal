'use client';

import { useState, useEffect, useRef, InvalidEvent } from 'react';
import { QuizModal } from '../modals/quiz-modal';
import { QuizModalContent } from '../modals/quiz-modal-content';
import { Snackbar } from '../common/snackbar';
import { trackEvent, trackFormSubmit } from '@/hooks/use-yandex-metrica';
import { actionButtonStyle } from '@/app/constants';
import { formatPhoneNumber } from '../common/utils';
import { EXPERIENCE_OPTIONS, GENRE_OPTIONS, MOTIVATION_OPTIONS } from '../modals/constants';

interface QuizButtonProps {
    className?: string;
}

type QuizAnswers = {
    experience: string;
    genre: string;
    genreOther?: string;
    motivation: string;
    motivationOther?: string;
};

export function QuizButton({ className }: QuizButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [step, setStep] = useState(1);
    const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({
        experience: '',
        genre: '',
        motivation: '',
    });
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [isAgreed, setIsAgreed] = useState(false);
    const [offeraIsOpen, setOfferaIsOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error',
    });

    const trackedStepsRef = useRef<Set<number>>(new Set());
    const totalSteps = 4;

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset'; // Возвращаем скролл
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && step >= 2 && !trackedStepsRef.current.has(step)) {
            const eventNames: Record<number, string> = {
                2: 'quiz_step_2_genre',
                3: 'quiz_step_3_motivation',
                4: 'quiz_step_4_contact',
            };

            const eventName = eventNames[step];
            if (eventName) {
                trackEvent(eventName, quizAnswers);
                trackedStepsRef.current.add(step);
            }
        }
    }, [step, isOpen, quizAnswers]);

    useEffect(() => {
        if (!isOpen) {
            trackedStepsRef.current.clear();
        }
    }, [isOpen]);

    const handleOpen = () => {
        trackEvent('open_quiz_modal');
        setIsOpen(true);
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleQuizAnswer = (field: keyof QuizAnswers, value: string) => {
        setQuizAnswers({
            ...quizAnswers,
            [field]: value,
            genreOther: field !== 'genreOther' ? '' : value,
            motivationOther: field !== 'motivationOther' ? '' : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const emailData = {
                ...formData,
                formType: 'quiz',
                quizAnswers: {
                    experience: EXPERIENCE_OPTIONS.find((opt) => opt.value === quizAnswers.experience)?.label || '',
                    genre:
                        quizAnswers.genre === 'other'
                            ? quizAnswers.genreOther || 'Другое'
                            : GENRE_OPTIONS.find((opt) => opt.value === quizAnswers.genre)?.label || '',
                    motivation:
                        quizAnswers.motivation === 'other'
                            ? quizAnswers.motivationOther || 'Другое'
                            : MOTIVATION_OPTIONS.find((opt) => opt.value === quizAnswers.motivation)?.label || '',
                },
            };

            const response = await fetch('/api/send-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const result = await response.json();

            if (response.ok) {
                trackFormSubmit('quiz_form');

                setSnackbar({
                    isVisible: true,
                    message: result.message || 'Спасибо! Мы свяжемся с вами в ближайшее время.',
                    type: 'success',
                });

                setFormData({ name: '', phone: '' });
                setQuizAnswers({ experience: '', genre: '', motivation: '' });
                setIsAgreed(false);
                setStep(1);

                setTimeout(() => {
                    setIsOpen(false);
                }, 2000);
            } else {
                setSnackbar({
                    isVisible: true,
                    message: result.error || 'Произошла ошибка при отправке заявки. Попробуйте позже.',
                    type: 'error',
                });
            }
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            setSnackbar({
                isVisible: true,
                message: 'Произошла ошибка при отправке заявки. Попробуйте позже.',
                type: 'error',
            });
        }
    };

    const handleValidate = (text: string) => (e: InvalidEvent<HTMLInputElement>) => {
        e.target.setCustomValidity(text);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const formattedPhone = formatPhoneNumber(value);
            setFormData({ ...formData, [name]: formattedPhone });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const canProceed = (): boolean => {
        switch (step) {
            case 1:
                return quizAnswers.experience !== '';
            case 2:
                return quizAnswers.genre !== '' && (quizAnswers.genre !== 'other' || !!quizAnswers.genreOther);
            case 3:
                return quizAnswers.motivation !== '' && (quizAnswers.motivation !== 'other' || !!quizAnswers.motivationOther);
            case 4:
                return !!(formData.name && formData.phone && isAgreed);
            default:
                return false;
        }
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

            {/* Мобильная версия с модальным окном */}
            <QuizModal
                className="fixed inset-0 z-50 flex items-center justify-center shadow-md brightness-96 rounded-sm w-full sm:hidden"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />

            {/* Десктопная версия без модального окна */}
            <div className="hidden sm:block sm:bg-white md:w-[630px] sm:h-[630px] shadow-md rounded-sm">
                <QuizModalContent
                    className="h-full pt-8 pb-6 px-4 md:p-6 flex flex-col justify-between"
                    step={step}
                    totalSteps={totalSteps}
                    quizAnswers={quizAnswers}
                    formData={formData}
                    isAgreed={isAgreed}
                    offeraIsOpen={offeraIsOpen}
                    handleQuizAnswer={handleQuizAnswer}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    handleSubmit={handleSubmit}
                    handleValidate={handleValidate}
                    handleChange={handleChange}
                    setIsAgreed={setIsAgreed}
                    setOfferaIsOpen={setOfferaIsOpen}
                    canProceed={canProceed}
                />
            </div>

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
