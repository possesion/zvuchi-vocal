'use client';

import { InvalidEvent, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Snackbar } from '../common/snackbar';
import { Offera } from '@/components/common/offera';

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
    const [offeraIsOpen, setOfferaIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });

    const formatPhoneNumber = (value: string) => {
        // Удаляем все символы кроме цифр
        const phoneNumber = value.replace(/\D/g, '');

        // Если номер начинается с 8, заменяем на 7
        const normalizedNumber = phoneNumber.startsWith('8')
            ? '7' + phoneNumber.slice(1)
            : phoneNumber;

        // Применяем маску +7 (XXX) XXX-XX-XX
        if (normalizedNumber.length === 0) return '';
        if (normalizedNumber.length <= 1) return `+${normalizedNumber}`;
        if (normalizedNumber.length <= 4) return `+7 (${normalizedNumber.slice(1)}`;
        if (normalizedNumber.length <= 7) return `+7 (${normalizedNumber.slice(1, 4)}) ${normalizedNumber.slice(4)}`;
        if (normalizedNumber.length <= 9) return `+7 (${normalizedNumber.slice(1, 4)}) ${normalizedNumber.slice(4, 7)}-${normalizedNumber.slice(7)}`;
        return `+7 (${normalizedNumber.slice(1, 4)}) ${normalizedNumber.slice(4, 7)}-${normalizedNumber.slice(7, 9)}-${normalizedNumber.slice(9, 11)}`;
    };

    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error',
    });

    // const isDocumentRead = localStorage.getItem('privacy-agreement') ?? false;
    // const [isDocumentRead, setIsDocumentRead] = useState(false);

    // const handleReadChange = (isRead: boolean) => {
    //     setIsDocumentRead(isRead);
    //     // Здесь можно сохранить в базу данных или отправить на сервер
    //     console.log('Документ прочитан:', isRead);
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/send-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                // Показываем успешное уведомление
                setSnackbar({
                    isVisible: true,
                    message:
                        result.message ||
                        'Спасибо! Мы свяжемся с вами в ближайшее время.',
                    type: 'success',
                });

                // Сброс формы
                setFormData({
                    name: '',
                    phone: '',
                });

                // Закрываем модальное окно через 2 секунды
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                // Показываем ошибку
                setSnackbar({
                    isVisible: true,
                    message:
                        result.error ||
                        'Произошла ошибка при отправке заявки. Попробуйте позже.',
                    type: 'error',
                });
            }
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            setSnackbar({
                isVisible: true,
                message:
                    'Произошла ошибка при отправке заявки. Попробуйте позже.',
                type: 'error',
            });
        }
    };

    const handleValidate =
        (text: string) => (e: InvalidEvent<HTMLInputElement>) => {
            e.target.setCustomValidity(text);
        };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const formattedPhone = formatPhoneNumber(value);
            setFormData({
                ...formData,
                [name]: formattedPhone,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    // Блокировка скролла при открытии модалки
    useEffect(() => {
        if (isOpen) {
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
            <div className="animate-fade-in relative mx-4 w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-sm bg-white shadow-2xl">
                <header className="flex items-center justify-between border-b p-6">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                        Записаться на пробное&nbsp;занятие
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 transition-colors hover:bg-gray-100"
                        aria-label="Закрыть модальное окно"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </header>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
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

                    <div className="flex justify-between">
                        <Offera document="/documents/privacy.txt" isOpen={offeraIsOpen}>
                            <button
                                type="button"
                                onClick={() => {
                                    setOfferaIsOpen((prev) => !prev)
                                }}
                                className="group relative transition-colors duration-200 dark:hover:text-red-400"
                            >
                                Нажимая кнопку <span className="mr-1 font-bold">Записаться </span> вы соглашаетесь с <span className="cursor-pointer text-brand">Политикой конфиденциальности.</span>
                            </button>
                        </Offera>
                    </div>
                    <button
                        type="submit"
                        className="w-full cursor-pointer transform rounded-sm bg-linear-to-r from-brand to-brand-secondary px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl"
                    >
                        Записаться
                    </button>
                </form>
            </div>

            {/* Snackbar для уведомлений */}
            <Snackbar
                isVisible={snackbar.isVisible}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() =>
                    setSnackbar((prev) => ({ ...prev, isVisible: false }))
                }
                duration={4000}
            />
        </div>
    );
}
