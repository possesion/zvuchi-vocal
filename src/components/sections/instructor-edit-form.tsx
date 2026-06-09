'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Check, X } from 'lucide-react';
import { updateInstructorAction } from '@/app/actions/instructors';
import { useUI } from '@/components/providers/ui-context';
import { formInputCls } from '@/lib/ui-constants';
import { InstructorSchema, type InstructorForm } from '@/lib/definitions';
import type { Instructor, WikiTermRow } from '@/lib/types';

export interface InstructorEditFormProps {
    instructor: Instructor;
    onSaved: () => void;
}

export function InstructorEditForm({ instructor, onSaved }: InstructorEditFormProps) {
    const { notify } = useUI();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<InstructorForm>({
        resolver: yupResolver(InstructorSchema),
        defaultValues: {
            name: instructor.name,
            specialty: instructor.specialty,
            feature: instructor.feature,
            experience: instructor.experience,
            bio: instructor.bio,
            image: instructor.image,
            video: instructor.video,
            sortOrder: instructor.sortOrder,
            slug: instructor.slug,
            presentationVideo: instructor.presentationVideo,
            performanceVideos: instructor.performanceVideos.join('\n'),
            techniques: instructor.techniques,
        },
    });

    const [formTechniques, setFormTechniques] = useState<string[]>(instructor.techniques);
    const [allWikiTerms, setAllWikiTerms] = useState<WikiTermRow[]>([]);
    const [wikiLoaded, setWikiLoaded] = useState(false);

    // Load wiki terms lazily on first render
    useEffect(() => {
        if (!wikiLoaded) {
            fetch('/api/v1/wiki')
                .then((res) => {
                    if (res.ok) return res.json();
                })
                .then((data) => {
                    if (data) setAllWikiTerms(data.terms ?? []);
                })
                .catch(() => {
                    console.error('ошибка получения wiki статей');
                })
                .finally(() => {
                    setWikiLoaded(true);
                });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTechnique = (id: string) => {
        setFormTechniques((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const onSubmit = async (data: InstructorForm) => {
        const result = await updateInstructorAction({
            ...instructor,
            name: data.name,
            specialty: data.specialty ?? '',
            feature: data.feature ?? '',
            experience: data.experience ?? '',
            bio: data.bio ?? '',
            image: data.image ?? '',
            video: data.video ?? '',
            sortOrder: data.sortOrder ?? 0,
            slug: data.slug ?? '',
            presentationVideo: data.presentationVideo ?? '',
            performanceVideos: (data.performanceVideos ?? '')
                .split('\n')
                .map((href) => href.trim())
                .filter(Boolean),
            techniques: formTechniques,
        });

        if (result.success) {
            onSaved();
        } else {
            notify(result.error ?? 'Ошибка при сохранении', 'error');
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-8 rounded-sm bg-zinc-900 p-6 space-y-4 ring-1 ring-white/10"
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white">Редактирование профиля</h2>
                <button
                    type="button"
                    onClick={onSaved}
                    className="text-white/50 hover:text-white"
                    aria-label="Закрыть форму"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs text-white/60">Имя *</label>
                    <input
                        {...register('name')}
                        className={`${formInputCls} ${errors.name ? 'ring-red-500' : 'ring-white/10'}`}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-xs text-white/60">Предмет</label>
                    <input
                        {...register('specialty')}
                        className={`${formInputCls} ${errors.specialty ? 'ring-red-500' : 'ring-white/10'}`}
                    />
                    {errors.specialty && (
                        <p className="text-xs text-red-400 mt-1">{errors.specialty.message}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-xs text-white/60">Опыт</label>
                    <input
                        {...register('experience')}
                        className={`${formInputCls} ${errors.experience ? 'ring-red-500' : 'ring-white/10'}`}
                    />
                    {errors.experience && (
                        <p className="text-xs text-red-400 mt-1">{errors.experience.message}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-xs text-white/60">Сверхсила</label>
                    <input
                        {...register('feature')}
                        className={`${formInputCls} ${errors.feature ? 'ring-red-500' : 'ring-white/10'}`}
                    />
                    {errors.feature && (
                        <p className="text-xs text-red-400 mt-1">{errors.feature.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-xs text-white/60">Биография (Markdown)</label>
                <textarea
                    {...register('bio')}
                    rows={6}
                    className={`${formInputCls} resize-y ${errors.bio ? 'ring-red-500' : 'ring-white/10'}`}
                />
                {errors.bio && (
                    <p className="text-xs text-red-400 mt-1">{errors.bio.message}</p>
                )}
            </div>

            <div>
                <label className="mb-1 block text-xs text-white/60">Фото (URL)</label>
                <input
                    {...register('image')}
                    className={`${formInputCls} ${errors.image ? 'ring-red-500' : 'ring-white/10'}`}
                />
                {errors.image && (
                    <p className="text-xs text-red-400 mt-1">{errors.image.message}</p>
                )}
            </div>

            <div>
                <label className="mb-1 block text-xs text-white/60">Видео-представление (S3 URL)</label>
                <input
                    {...register('presentationVideo')}
                    className={`${formInputCls} ${errors.presentationVideo ? 'ring-red-500' : 'ring-white/10'}`}
                />
                {errors.presentationVideo && (
                    <p className="text-xs text-red-400 mt-1">{errors.presentationVideo.message}</p>
                )}
            </div>

            <div>
                <label className="mb-1 block text-xs text-white/60">
                    Видео выступлений (каждый URL на новой строке)
                </label>
                <textarea
                    {...register('performanceVideos')}
                    rows={4}
                    className={`${formInputCls} resize-y ${errors.performanceVideos ? 'ring-red-500' : 'ring-white/10'}`}
                    placeholder="https://s3.example.com/video1.mp4&#10;https://s3.example.com/video2.mp4"
                />
                {errors.performanceVideos && (
                    <p className="text-xs text-red-400 mt-1">{errors.performanceVideos.message}</p>
                )}
            </div>

            {allWikiTerms.length > 0 && (
                <div>
                    <label className="mb-2 block text-xs text-white/60">Техники (из вики)</label>
                    <div className="flex flex-wrap gap-2">
                        {allWikiTerms.map((term) => (
                            <label
                                key={term.id}
                                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={formTechniques.includes(term.id)}
                                    onChange={() => toggleTechnique(term.id)}
                                    className="accent-[var(--color-brand)]"
                                />
                                {term.title}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onSaved}
                    className="rounded-sm px-4 py-2 text-sm text-white/60 hover:text-white"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-brand)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    <Check className="h-4 w-4" />
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}
