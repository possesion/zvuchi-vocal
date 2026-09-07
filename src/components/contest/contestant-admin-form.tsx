'use client';

import { useRef, useState, type FC } from 'react';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ContestantSchema, ContestantForm } from '@/lib/definitions';
import type { Contestant } from '@/lib/types';

interface ContestantAdminFormProps {
    contestant?: Contestant; // если передан — режим редактирования, иначе создание
    onSaved: () => void;
    onCancel?: () => void;
}

const inputCls =
    'w-full rounded-sm bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-purple-500';

export const ContestantAdminForm: FC<ContestantAdminFormProps> = ({ contestant, onSaved, onCancel }) => {
    const [error, setError] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ContestantForm>({
        resolver: yupResolver(ContestantSchema),
        defaultValues: {
            name: contestant?.name ?? '',
            song: contestant?.song ?? '',
            originalArtist: contestant?.originalArtist ?? '',
        },
    });

    const isPreviewableInBrowser = (file: File) => {
        // HEIC/HEIF не поддерживаются нативным рендерингом <img> в большинстве браузеров
        const ext = file.name.split('.').pop()?.toLowerCase();
        return !['heic', 'heif'].includes(ext ?? '') && !file.type.includes('heic') && !file.type.includes('heif');
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoFile(file);
        setPhotoPreview(isPreviewableInBrowser(file) ? URL.createObjectURL(file) : '');
    };

    const onSubmit = async (data: ContestantForm) => {
        setError('');
        try {
            const isEdit = !!contestant;
            const url = isEdit
                ? `/api/v1/contest/contestants/${contestant.id}`
                : '/api/v1/contest/contestants';
            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                console.error('[Contest] Ошибка сохранения участника:', res.status);
                setError('Ошибка при сохранении участника');
                return;
            }

            const saved = await res.json();
            const savedId = saved?.data?.id ?? contestant?.id;

            if (photoFile && savedId) {
                const fd = new FormData();
                fd.append('file', photoFile);
                const photoRes = await fetch(`/api/v1/contest/contestants/${savedId}/photo`, {
                    method: 'POST',
                    body: fd,
                });
                if (!photoRes.ok) {
                    console.error('[Contest] Ошибка загрузки фото участника:', photoRes.status);
                    setError('Участник сохранён, но фото загрузить не удалось');
                }
            }

            if (photoPreview) URL.revokeObjectURL(photoPreview);
            onSaved();
        } catch (error) {
            console.error('[Contest] Сетевая ошибка при сохранении участника:', error);
            setError('Произошла ошибка. Попробуйте ещё раз.');
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-8 space-y-4 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
        >
            <h2 className="text-lg font-semibold text-white">
                {contestant ? 'Редактировать участника' : 'Новый участник'}
            </h2>

            <div className="space-y-1">
                <label className="text-sm text-white/70">Имя</label>
                <input {...register('name')} className={inputCls} />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm text-white/70">Песня</label>
                <input {...register('song')} className={inputCls} />
                {errors.song && <p className="text-xs text-red-400">{errors.song.message}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm text-white/70">Исполнитель</label>
                <input {...register('originalArtist')} className={inputCls} />
                {errors.originalArtist && <p className="text-xs text-red-400">{errors.originalArtist.message}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm text-white/70">Фото (необязательно)</label>
                <div
                    onClick={() => photoInputRef.current?.click()}
                    className="relative flex h-36 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 transition-colors hover:border-white/40"
                >
                    {photoPreview || contestant?.photoUrl ? (
                        <Image
                            src={photoPreview || contestant!.photoUrl}
                            alt="Предпросмотр фото участника"
                            fill
                            sizes="144px"
                            className="object-cover"
                        />
                    ) : photoFile ? (
                        <div className="px-2 text-center text-white/60">
                            <ImagePlus className="mx-auto mb-1 h-6 w-6" />
                            <p className="truncate text-xs">{photoFile.name}</p>
                        </div>
                    ) : (
                        <div className="text-center text-white/40">
                            <ImagePlus className="mx-auto mb-1 h-6 w-6" />
                            <p className="text-xs">JPG, PNG, WebP, GIF, HEIC до 5MB</p>
                        </div>
                    )}
                </div>
                <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
                    onChange={handlePhotoChange}
                    className="hidden"
                />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-sm px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
                    >
                        Отмена
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-sm bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
};
