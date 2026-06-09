'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { submitMailForm } from '@/lib/submit-mail-form';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import { Offera } from '@/components/common/offera';
import { useUI } from '@/components/providers/ui-context';
import { ContactSchema, ContactForm } from '@/lib/definitions';
import { formatPhoneNumber } from '@/lib/format';

export default function EnrollmentForm() {
    const { notify } = useUI();
    const [offeraIsOpen, setOfferaIsOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactForm>({
        resolver: yupResolver(ContactSchema),
        defaultValues: { name: '', phone: '', isAgreed: false },
    });

    const onSubmit = async (data: ContactForm) => {
        try {
            const response = await submitMailForm({ name: data.name, phone: data.phone, formType: 'enrollment-form' });
            if (response?.ok) {
                trackEvent('call_request');
                notify(response.data?.message || 'Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
                reset();
            } else {
                notify(response?.error || 'Произошла ошибка при отправке заявки. Попробуйте позже.', 'error');
            }
        } catch {
            notify('Произошла ошибка при отправке заявки. Попробуйте позже.', 'error');
        }
    };

    return (
        <div className="w-full rounded-sm bg-white/15 p-8 shadow-xl backdrop-blur-md border border-white/10">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 text-center">
                    <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-4xl">
                        Готов начать свой вокальный&nbsp;путь?
                    </h2>
                    <p className="text-lg/5 text-white/90 md:text-xl">
                        Присоединяйтесь к нашей вокальной школе и раскройте свой талант под руководством опытных педагогов
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="max-w-[700px] mx-auto grid gap-6 md:grid-cols-2 md:gap-8">
                    <div className="group">
                        <label htmlFor="form-name" className="mb-2 block text-sm font-semibold uppercase tracking-wide text-white/80">
                            Ваше имя
                        </label>
                        <input
                            {...register('name')}
                            className="w-full rounded-sm border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-all duration-300 focus:border-brand focus:bg-white/15 focus:ring-2 focus:ring-brand/30 group-hover:border-white/40"
                            id="form-name"
                            placeholder="Как вас зовут?"
                            type="text"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-300">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="group">
                        <label htmlFor="form-phone" className="mb-2 block text-sm font-semibold uppercase tracking-wide text-white/80">
                            Телефон
                        </label>
                        <input
                            {...register('phone')}
                            onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                setValue('phone', formatted, { shouldValidate: true });
                            }}
                            value={watch('phone')}
                            id="form-phone"
                            className="w-full rounded-sm border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-all duration-300 focus:border-brand focus:bg-white/15 focus:ring-2 focus:ring-brand/30 group-hover:border-white/40"
                            placeholder="+7 (999) 000-00-00"
                            type="tel"
                            maxLength={18}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-300">{errors.phone.message}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <div className="flex items-start justify-center gap-2">
                            <input
                                {...register('isAgreed')}
                                type="checkbox"
                                id="privacy-enrollment"
                                className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 text-brand focus:ring-2 focus:ring-brand"
                            />
                            <Offera document="/documents/privacy.txt" isOpen={offeraIsOpen}>
                                <label htmlFor="privacy-enrollment" className="text-xs leading-relaxed text-white/90">
                                    Я соглашаюсь с{' '}
                                    <button
                                        type="button"
                                        onClick={() => setOfferaIsOpen((prev) => !prev)}
                                        className="cursor-pointer text-white underline transition-colors duration-200 hover:font-bold"
                                    >
                                        Политикой конфиденциальности
                                    </button>
                                </label>
                            </Offera>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer bg-radial-[at_40%] from-violet-800 to-violet-950 to-80% group relative mx-auto block overflow-hidden rounded-sm w-full px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:shadow-[rgb(88,22,66)]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 md:w-70"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
                            <div className="relative flex items-center justify-center">
                                {isSubmitting ? (
                                    <>
                                        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        <span className="text-lg">Отправляем заявку...</span>
                                    </>
                                ) : (
                                    <span className="text-xl">Хочу записаться</span>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
