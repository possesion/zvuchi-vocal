'use client';

import { InvalidEvent, useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Snackbar } from '../common/snackbar';
import { trackEvent, trackFormSubmit } from '@/hooks/use-yandex-metrica';
import { formatPhoneNumber } from '../common/utils';
import { EXPERIENCE_OPTIONS, GENRE_OPTIONS, MOTIVATION_OPTIONS } from './constants';
import { QuizModalContent } from './quiz-modal-content';

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

type QuizAnswers = {
    experience: string;
    genre: string;
    genreOther?: string;
    motivation: string;
    motivationOther?: string;
};

export function QuizModal({ className, isOpen, onClose }: QuizModalProps) {
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

    // Ref для отслеживания отправленных событий метрики
    const trackedStepsRef = useRef<Set<number>>(new Set());

    const totalSteps = 4;

    // Отслеживание шагов квиза
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

    // Сброс отслеживания при закрытии модального окна
    useEffect(() => {
        if (!isOpen) {
            trackedStepsRef.current.clear();
        }
    }, [isOpen]);

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
                    onClose();
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

    if (!isOpen) return null;

    return (
        <div 
        className={className}
        role="dialog" 
        aria-modal="true"
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md sm:static" onClick={onClose} aria-hidden="true" />
            <div className="animate-fade-in relative mx-4 w-full max-w-[600px] h-[670px] overflow-y-auto rounded-sm bg-white shadow-2xl sm:hidden">
                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 z-10 rounded-full p-2 transition-colors hover:bg-gray-100"
                    aria-label="Закрыть модальное окно"
                >
                    <X className="h-6 w-6" />
                </button>

                <QuizModalContent
                    className='h-full flex flex-col justify-between pt-8 pb-6 px-4 md:p-8'
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
        </div>
    );
}
