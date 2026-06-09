'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Button } from '@radix-ui/themes';
import { updateUserProfile } from '@/app/actions/profile';
import { useUI } from '@/components/providers/ui-context';
import { AlertDialog } from '@/components/common/alert-dialog/alert-dialog';
import { ProfileSchema, ProfileForm } from '@/lib/definitions';

interface ProfileEditFormProps {
    email: string;
    currentName: string | null | undefined;
    currentPhone: string | null | undefined;
}

export function ProfileEditForm({ currentName, currentPhone, email }: ProfileEditFormProps) {
    const { notify } = useUI();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingData, setPendingData] = useState<ProfileForm | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty, dirtyFields },
        reset,
    } = useForm<ProfileForm>({
        resolver: yupResolver(ProfileSchema),
        defaultValues: {
            name: currentName || '',
            phone: currentPhone || '',
        },
    });

    const nameError = errors.name?.message ?? '';
    const phoneError = errors.phone?.message ?? '';
    const isPhoneChanged = dirtyFields.phone ?? false;

    const executeUpdate = async (data: ProfileForm) => {
        const result = await updateUserProfile({
            name: data.name.trim() || null,
            phone: data.phone.trim() || null,
        });

        if (!result.success) {
            notify(result?.error || 'Произошла ошибка при редактировании профиля. Попробуйте позже.', 'error');
            reset();
        } else {
            const message = isPhoneChanged 
                ? 'Данные успешно обновлены! Необходимо подтвердить новый номер телефона.' 
                : 'Данные успешно обновлены!';
            notify(message, 'success');
        }
    };

    const onSubmit = async (data: ProfileForm) => {
        // Если телефон изменился, показываем диалог подтверждения
        if (isPhoneChanged) {
            setPendingData(data);
            setShowConfirmDialog(true);
        } else {
            // Если телефон не изменился, сразу сохраняем
            await executeUpdate(data);
        }
    };

    const handleConfirm = async () => {
        if (pendingData) {
            setShowConfirmDialog(false);
            await executeUpdate(pendingData);
            setPendingData(null);
        }
    };

    const handleCancel = () => {
        setShowConfirmDialog(false);
        setPendingData(null);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Имя */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between border-b border-white/10">
                        <span className="text-white/70">Имя:</span>
                        <div className='w-68'>
                            <TextField.Root
                                id="name"
                                className='w-40 ml-auto'
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
                                className='w-40 ml-auto'
                                {...register('phone')}
                                placeholder="Введите номер"
                                disabled={isSubmitting}
                                size="2"
                                maxLength={16}
                            />
                            <p className="h-5 text-sm text-red-300">{phoneError}</p>
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-start justify-between border-b border-white/10 pb-7">
                    <span className="text-white/70">Email:</span>
                    <span className="font-medium">{email}</span>
                </div>
                {isPhoneChanged && (
                    <div className="rounded-sm bg-yellow-400/10 border border-yellow-400/30 px-4 py-3 text-sm text-yellow-400">
                        ⚠️ После изменения телефона потребуется повторная верификация
                    </div>
                )}

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
            <AlertDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                title="Изменение номера телефона"
                description="Вы уверены, что хотите изменить номер телефона?"
                confirmText={isSubmitting ? 'Сохранение...' : 'Подтвердить'}
                cancelText="Отменить"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                disabled={isSubmitting}
            />
        </>
    );
}
