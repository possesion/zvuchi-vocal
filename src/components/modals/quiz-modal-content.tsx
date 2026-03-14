'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import cn from 'classnames';
import { Offera } from '@/components/common/offera';
import { EXPERIENCE_OPTIONS, GENRE_OPTIONS, MOTIVATION_OPTIONS } from './constants';
import { useQuiz } from './quiz-context';

interface QuizModalContentProps {
    className?: string;
}

export const QuizModalContent = ({ className }: QuizModalContentProps) => {
    const {
        step, totalSteps, quizAnswers, formData, isAgreed, offeraIsOpen,
        handleQuizAnswer, handleNext, handleBack, handleSubmit,
        handleValidate, handleChange, setIsAgreed, setOfferaIsOpen, canProceed,
    } = useQuiz();

    return (
        <div id="quiz-modal-content" className={className}>
            <h2 className="hidden text-xl text-center font-bold text-gray-900 md:inline md:text-2xl">
                Пройди опрос и получи скидку!
            </h2>
            {/* Progress Bar */}
            <div className="mt-2 mb-4">
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                    <span>Шаг {step} из {totalSteps}</span>
                    <span>{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                        className="h-2 rounded-full bg-brand transition-all duration-300"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                        Занимались ли вы вокалом ранее?
                    </h2>
                    <div className="space-y-3">
                        {EXPERIENCE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleQuizAnswer('experience', option.value)}
                                className={cn(
                                    'w-full rounded-sm border-2 p-3 text-left transition-all hover:border-brand',
                                    quizAnswers.experience === option.value ? 'border-brand bg-brand/10' : 'border-gray-200'
                                )}
                            >
                                <span className="text-lg font-medium">{option.label}</span>
                            </button>
                        ))}
                        <div className="sm:h-[50px] sm:mt-6" />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                        В каком жанре хотите петь?
                    </h2>
                    <div className="space-y-3">
                        {GENRE_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleQuizAnswer('genre', option.value)}
                                className={cn(
                                    'w-full rounded-sm border-2 p-3 text-left transition-all hover:border-brand',
                                    quizAnswers.genre === option.value ? 'border-brand bg-brand/10' : 'border-gray-200'
                                )}
                            >
                                <span className="text-lg font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        disabled={quizAnswers.genre !== 'other'}
                        placeholder="Укажите жанр"
                        value={quizAnswers.genreOther || ''}
                        onChange={(e) => handleQuizAnswer('genreOther', e.target.value)}
                        className="w-full rounded-sm border border-gray-300 px-4 py-3 transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
                    />
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                        Что вас побудило заняться вокалом?
                    </h2>
                    <div className="space-y-3">
                        {MOTIVATION_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleQuizAnswer('motivation', option.value)}
                                className={cn(
                                    'w-full rounded-sm border-2 p-3 text-left transition-all hover:border-brand',
                                    quizAnswers.motivation === option.value ? 'border-brand bg-brand/10' : 'border-gray-200'
                                )}
                            >
                                <span className="text-lg font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        disabled={quizAnswers.motivation !== 'other'}
                        placeholder="Укажите причину"
                        value={quizAnswers.motivationOther || ''}
                        onChange={(e) => handleQuizAnswer('motivationOther', e.target.value)}
                        className="w-full rounded-sm border border-gray-300 px-4 py-3 transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
                    />
                </div>
            )}

            {step === 4 && (
                <div className="h-60 mb-12 rounded-sm bg-green-50 p-4 text-center">
                    <h2 className="mb-2 text-2xl font-bold text-green-800">🎉 Поздравляем!</h2>
                    <div className="mb-2">
                        <span className="font-bold text-lg text-brand line-through lg:text-2xl">3890₽</span>
                        <span className="ml-2 text-lg text-green-700 font-bold">1000₽</span>
                    </div>
                    <p className="text-lg text-green-700">
                        – Стоимость первого занятия с <span className="font-bold">70% скидкой</span>
                    </p>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="quiz-name" className="mb-1 block text-sm font-medium text-gray-700">
                                Имя *
                            </label>
                            <input
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
                                id="quiz-name"
                                name="name"
                                onInvalid={handleValidate('Введите имя')}
                                onInput={handleValidate('')}
                                onChange={handleChange}
                                placeholder="Ваше имя"
                                required
                                type="text"
                                value={formData.name}
                            />
                        </div>
                        <div>
                            <label htmlFor="quiz-phone" className="mb-1 block text-sm font-medium text-gray-700">
                                Телефон *
                            </label>
                            <input
                                id="quiz-phone"
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
                                name="phone"
                                onInvalid={handleValidate('Введите номер телефона')}
                                onInput={handleValidate('')}
                                onChange={handleChange}
                                placeholder="+7 (999) 000-00-00"
                                required
                                type="tel"
                                value={formData.phone}
                                maxLength={18}
                            />
                        </div>
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex align-center gap-x-2">
                                <input
                                    type="checkbox"
                                    id="quiz-privacy"
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand"
                                />
                                <Offera document="/documents/privacy.txt" isOpen={offeraIsOpen}>
                                    <label htmlFor="quiz-privacy" className="text-xs leading-relaxed text-gray-900">
                                        Я соглашаюсь с{' '}
                                        <button
                                            type="button"
                                            onClick={() => setOfferaIsOpen((prev) => !prev)}
                                            className="cursor-pointer text-brand underline transition-colors duration-200 hover:text-brand/80"
                                        >
                                            Политикой конфиденциальности
                                        </button>
                                    </label>
                                </Offera>
                            </div>
                            <button
                                type="submit"
                                disabled={!canProceed()}
                                className="w-full cursor-pointer transform rounded-sm bg-linear-to-r from-brand to-brand-secondary px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Получить скидку
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {step < 4 && (
                <div id="quiz-navigation" className="mt-8 flex justify-between gap-4">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className="flex items-center gap-2 rounded-sm border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        Назад
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 rounded-sm bg-brand px-6 py-3 font-bold text-white transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Далее
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};
