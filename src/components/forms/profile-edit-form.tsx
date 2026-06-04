'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TextField, Button } from '@radix-ui/themes';
import { updateUserProfile } from '@/app/actions/profile';
import { useUI } from '@/components/providers/ui-context';

interface ProfileFormData {
    name: string;
    phone: string;
}

interface ProfileEditFormProps {
    email: string;
    currentName: string | null | undefined;
    currentPhone: string | null | undefined;
}

const profileSchema = yup.object({
    name: yup
        .string()
        .min(2, 'Имя не должно быть короче 2 символов')
        .max(50, 'Имя не должно превышать 50 символов')
        .default(''),
    phone: yup
        .string()
        .matches(/^(\+7\d{10})?$/, 'Неверный формат номера')
        .default(''),
});

export function ProfileEditForm({ currentName, currentPhone, email }: ProfileEditFormProps) {
    const { notify } = useUI();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
    } = useForm<ProfileFormData>({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            name: currentName || '',
            phone: currentPhone || '',
        },
    });

    const nameError = errors.name?.message ?? '';
    const phoneError = errors.phone?.message ?? '';

    const onSubmit = async (data: ProfileFormData) => {
        const result = await updateUserProfile({
            name: data.name.trim() || null,
            phone: data.phone.trim() || null,
        });

        if (!result.success) {
            notify(result?.error || 'Произошла ошибка при редактировании профиля. Попробуйте позже.', 'error');
            reset()
        } else {
            notify('Данные успешно обновлены!', 'success');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Имя */}
            <div className="space-y-4">

                <div className="flex items-start justify-between border-b border-white/10">
                    <span className="text-white/70">Имя:</span>
                    <div className='w-68'>
                        <TextField.Root
                            id="name"
                            {...register('name')}
                            placeholder="Введите ваше имя"
                            disabled={isSubmitting}
                            size="2"
                            maxLength={50}
                        />
                        <p className="h-5 text-sm text-red-300">{nameError}</p>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-white/10">
                    <span className="text-white/70">Телефон:</span>
                    <div className='w-68'>
                        <TextField.Root
                            id="phone"
                            {...register('phone')}
                            placeholder="Введите номер телефона"
                            disabled={isSubmitting}
                            size="2"
                            maxLength={16}
                        />
                        <p className="h-5 text-sm text-red-300">{phoneError}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-start justify-between border-b border-white/10 pb-7">
                <span className="text-white/70">Email:</span>
                <span className="font-medium">{email}</span>
            </div>

            {/* Кнопка сохранения */}
            <div className="flex justify-end pt-2">
                <Button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    size="2"
                    className="cursor-pointer flex items-center gap-2 rounded-sm bg-brand px-6 py-3 font-bold text-white transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
}
