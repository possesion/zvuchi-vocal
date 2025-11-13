'use client';

import { InvalidEvent, useState } from 'react';
import { Snackbar } from '../common/snackbar';
import { submitMailForm } from '@/lib/submit-mail-form';

export function EnrollmentForm() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        preferredDate: '',
    });

    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: '',
        type: 'success' as 'success' | 'error',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await submitMailForm({
                ...formData,
                formType: 'enrollment-form',
            });

            if (response && response.ok) {
                setSnackbar({
                    isVisible: true,
                    message:
                        response.data?.message ||
                        'Спасибо! Мы свяжемся с вами в ближайшее время.',
                    type: 'success',
                });

                setFormData({
                    name: '',
                    phone: '',
                    preferredDate: '',
                });
            } else {
                setSnackbar({
                    isVisible: true,
                    message:
                        response?.error ||
                        'Произошла ошибка при отправке заявки. Попробуйте позже.',
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
        } finally {
            setIsSubmitting(false);
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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Получаем минимальную дату (завтра)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <div className="w-full rounded-2xl bg-white/15 p-8 shadow-xl backdrop-blur-md border border-white/10">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 text-center">
                    <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-4xl">
                        Готов начать свой вокальный&nbsp;путь?
                    </h2>
                    <p className="text-lg/5 text-white/90 md:text-xl">
                        Присоединяйтесь к нашей вокальной школе и раскройте свой талант под руководством опытных педагогов
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3 md:gap-8">
                    <div className="group">
                        <label
                            htmlFor="form-name"
                            className="mb-2 block text-sm font-semibold uppercase tracking-wide text-white/80"
                        >
                            Ваше имя
                        </label>
                        <input
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-all duration-300 focus:border-brand focus:bg-white/15 focus:ring-2 focus:ring-brand/30 group-hover:border-white/40"
                            id="form-name"
                            name="name"
                            onInvalid={handleValidate('Введите имя')}
                            onInput={handleValidate('')}
                            onChange={handleChange}
                            placeholder="Как вас зовут?"
                            required
                            type="text"
                            value={formData.name}
                        />
                    </div>

                    <div className="group">
                        <label
                            htmlFor="form-phone"
                            className="mb-2 block text-sm font-semibold uppercase tracking-wide text-white/80"
                        >
                            Телефон
                        </label>
                        <input
                            id="form-phone"
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-all duration-300 focus:border-brand focus:bg-white/15 focus:ring-2 focus:ring-brand/30 group-hover:border-white/40"
                            name="phone"
                            onInvalid={handleValidate('Введите номер телефона')}
                            onInput={handleValidate('')}
                            onChange={handleChange}
                            placeholder="+7 (000) 000-00-00"
                            required
                            type="tel"
                            value={formData.phone}
                        />
                    </div>

                    <div className="group">
                        <label
                            htmlFor="form-date"
                            className="mb-2 block text-sm font-semibold uppercase tracking-wide text-white/80"
                        >
                            Желаемая дата урока
                        </label>
                        <input
                            id="form-date"
                            className="standart-date w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white transition-all duration-300 focus:border-brand focus:bg-white/15 focus:ring-2 focus:ring-brand/30 group-hover:border-white/40"
                            name="preferredDate"
                            onChange={handleChange}
                            type='date'
                            min={getMinDate()}
                            value={formData.preferredDate}
                        />
                        <p className="mt-1 text-xs text-white/60">
                            Необязательно
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer bg-radial-[at_40%] from-violet-800 to-violet-950 to-80% group relative mx-auto block overflow-hidden rounded-xl w-full px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:shadow-[rgb(88,22,66)]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 md:w-70"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full"></div>
                            <div className="relative flex items-center justify-center">
                                {isSubmitting ? (
                                    <>
                                        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                        <span className="text-lg">Отправляем заявку...</span>
                                    </>
                                ) : (
                                    <span className="text-lg">Хочу записаться</span>
                                )}
                            </div>
                        </button>
                    </div>
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