'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import cn from 'classnames';
import { X } from 'lucide-react';
import { Offera } from '@/components/common/offera';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import { submitMailForm } from '@/lib/submit-mail-form';
import { useUI } from '@/components/providers/ui-context';
import { useContactForm } from '@/hooks/useContactForm';

interface EnrollmentModalProps {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    hasPicture?: boolean;
}

export function EnrollmentModal({ children, isOpen, onClose, hasPicture }: EnrollmentModalProps) {
    const { notify } = useUI();
    const { formData, isAgreed, setIsAgreed, handleChange, handleValidate, reset } = useContactForm();
    const [offeraIsOpen, setOfferaIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await submitMailForm({
                ...formData,
                formType: hasPicture ? 'promo' : 'enrollment-form',
            });
            if (response?.ok) {
                trackEvent('call_request');
                notify(response.data?.message || 'Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
                reset();
                setTimeout(onClose, 2000);
            } else {
                notify(response?.error || 'Произошла ошибка при отправке заявки. Попробуйте позже.', 'error');
            }
        } catch {
            notify('Произошла ошибка при отправке заявки. Попробуйте позже.', 'error');
        }
    };

    // Блокировка скролла при открытии модалки
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            // Сохраняем текущую позицию скролла
            const scrollY = window.scrollY;

            // Блокируем скролл
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            return () => {
                // Восстанавливаем скролл при закрытии
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className={cn(hasPicture && 'md:max-w-[800px]', "animate-fade-in relative mx-4 w-full max-w-[480px] max-h-[100svh] overflow-y-auto rounded-sm bg-white shadow-2xl")}>
                {/* Mobile Layout */}
                <div className="md:hidden">
                    {hasPicture && <div className="relative h-[220px] w-auto">
                        <Image
                            src='/promo/valentine-promo.png'
                            alt='valentine-promo'
                            fill
                            className="object-cover rounded-t-sm"
                        />
                    </div>}
                    <header className={cn(hasPicture ? 'px-3 py-1' : 'px-6 pt-7 pb-3', { 'border-b': hasPicture }, "flex items-center justify-center")}>
                        {children}
                        <button
                            onClick={onClose}
                            className="absolute right-1 top-1 rounded-full p-2 transition-colors hover:bg-gray-100"
                            aria-label="Закрыть модальное окно"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </header>

                    {/* Mobile Form */}
                    <form onSubmit={handleSubmit} className={cn(hasPicture ? 'px-3 py-1' : 'p-6', "space-y-4")}>
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Имя *
                            </label>
                            <input
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
                                id="name"
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
                            <label
                                htmlFor="phone"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Телефон *
                            </label>
                            <input
                                id="phone"
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

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="privacy-mobile"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand"
                            />
                            <Offera document="/documents/privacy.txt" isOpen={offeraIsOpen}>
                                <label
                                    htmlFor="privacy-mobile"
                                    className="text-xs leading-relaxed text-gray-900"
                                >
                                    Я соглашаюсь с{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOfferaIsOpen((prev) => !prev)
                                        }}
                                        className="cursor-pointer text-brand underline transition-colors duration-200 hover:text-brand/80"
                                    >
                                        Политикой конфиденциальности
                                    </button>
                                </label>
                            </Offera>
                        </div>
                        <button
                            type="submit"
                            disabled={!isAgreed}
                            className="w-full cursor-pointer transform rounded-sm bg-linear-to-r from-brand to-brand-secondary px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            Записаться
                        </button>
                    </form>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex">
                    {hasPicture && <div className="relative w-[70%]">
                        <Image
                            src='/promo/valentine-promo.png'
                            alt='valentine-promo'
                            fill
                            className="object-cover rounded-l-sm"
                        />
                    </div>}

                    {/* Desktop Content - Right Side */}
                    <div className={cn(hasPicture && 'w-1/2', "flex flex-col w-full")}>
                        <header className="flex items-center justify-between p-6">
                            {children}
                            <button
                                onClick={onClose}
                                className="absolute right-1 top-1 rounded-full p-2 transition-colors hover:bg-gray-100"
                                aria-label="Закрыть модальное окно"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </header>

                        {/* Desktop Form */}
                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 p-6">
                            <div>
                                <label
                                    htmlFor="name-desktop"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Имя *
                                </label>
                                <input
                                    className="w-full rounded-sm border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
                                    id="name-desktop"
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
                                <label
                                    htmlFor="phone-desktop"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Телефон *
                                </label>
                                <input
                                    id="phone-desktop"
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

                            <div className="flex-1 flex flex-col justify-end space-y-4">
                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="privacy-desktop"
                                        checked={isAgreed}
                                        onChange={(e) => setIsAgreed(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-brand focus:ring-2 focus:ring-brand"
                                    />
                                    <Offera document="/documents/privacy.txt" isOpen={offeraIsOpen}>
                                        <label
                                            htmlFor="privacy-desktop"
                                            className="text-xs leading-relaxed text-gray-900"
                                        >
                                            Я соглашаюсь с{' '}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOfferaIsOpen((prev) => !prev)
                                                }}
                                                className="cursor-pointer text-brand underline transition-colors duration-200 hover:text-brand/80"
                                            >
                                                Политикой конфиденциальности
                                            </button>
                                        </label>
                                    </Offera>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!isAgreed}
                                    className="w-full cursor-pointer transform rounded-sm bg-linear-to-r from-brand to-brand-secondary px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Записаться
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}