'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProgramSchema, ProgramForm } from '@/lib/definitions';
import { updateProgramAction } from '@/app/actions/programs';
import { Program } from '@/lib/types';
import { Trash2 } from 'lucide-react';

const inputCls = 'w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500';
const inputErrorCls = 'w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-red-500';

interface ProgramEditFormProps {
    program: Program;
}

const programPackages = [
    {
        title: 'Месяц',
        value: 30
    },
    {
        title: 'Три месяца',
        value: 90
    },
    {
        title: 'Пол года',
        value: 180
    },
];

export function ProgramEditForm({ program }: ProgramEditFormProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ProgramForm>({
        resolver: yupResolver(ProgramSchema),
        defaultValues: {
            title: program.title,
            short_description: program.shortDescription,
            full_description: program.fullDescription,
            packages: program.packages,
            lesson_duration: program.lessonDuration,
            program_duration: program.programDuration,
            features: program.features.join('\n'),
            is_popular: program.isPopular,
            sort_order: program.sortOrder,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'packages',
    });

    const isPopular = watch('is_popular');

    const onSubmit = async (data: ProgramForm) => {
        const result = await updateProgramAction(program.id, data);

        if (result.success) {
            setEditing(false);
            router.refresh();
        }
    };

    const handleCancel = () => {
        reset();
        setEditing(false);
    };

    const handleAddPackage = () => {
        append({ lessons_count: 4, price: 0 });
    };

    if (!editing) {
        return (
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setEditing(true)}
                    className="rounded-sm bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                    Редактировать
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 rounded-sm bg-white/10 p-4 md:p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-lg font-semibold text-white">Редактирование абонемента</h2>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Название *</label>
                <input
                    {...register('title')}
                    placeholder="Например: Базовый"
                    className={errors.title ? inputErrorCls : inputCls}
                />
                {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Краткое описание *</label>
                <input
                    {...register('short_description')}
                    placeholder="Отображается в списке абонементов"
                    className={errors.short_description ? inputErrorCls : inputCls}
                />
                {errors.short_description && <p className="text-sm text-red-400">{errors.short_description.message}</p>}
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Полное описание *</label>
                <textarea
                    {...register('full_description')}
                    rows={4}
                    placeholder="Подробное описание абонемента для страницы деталей"
                    className={`${errors.full_description ? inputErrorCls : inputCls} resize-y`}
                />
                {errors.full_description && <p className="text-sm text-red-400">{errors.full_description.message}</p>}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Пакеты *</label>
                    <button
                        type="button"
                        onClick={handleAddPackage}
                        className="text-sm text-purple-400 hover:text-purple-300"
                    >
                        + Добавить пакет
                    </button>
                </div>

                {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 md:grid-cols-3 p-3 bg-white/5 rounded-sm">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-300">Кол-во занятий</label>
                            <input
                                type="number"
                                {...register(`packages.${index}.lessons_count`)}
                                className={inputCls}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-300">Цена (₽)</label>
                            <input
                                type="number"
                                {...register(`packages.${index}.price`)}
                                className={inputCls}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="w-full rounded-sm bg-red-600/20 px-3 py-2 text-red-400 hover:bg-red-600/30 transition-colors"
                            >
                                <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                        </div>
                    </div>
                ))}
                {errors.packages && <p className="text-sm text-red-400">{errors.packages.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                    <label className="text-sm text-gray-300">Длительность урока (мин)</label>
                    <input
                        type="number"
                        {...register('lesson_duration')}
                        className={inputCls}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm text-gray-300">Срок действия (дней) *</label>
                    <select
                        {...register('program_duration')}
                        className={errors.program_duration ? inputErrorCls : inputCls}
                    >
                        {programPackages.map((duration) => <option key={duration.value} value="30">{duration.title}</option>)}
                    </select>
                    {errors.program_duration && <p className="text-sm text-red-400">{errors.program_duration.message}</p>}
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Особенности (каждая с новой строки)</label>
                <textarea
                    {...register('features')}
                    rows={3}
                    placeholder="Бесплатная заморозка на 1 неделю&#10;Индивидуальный подбор репертуара&#10;Запись урока"
                    className={`${inputCls} resize-y text-sm`}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_popular_edit"
                        checked={isPopular}
                        onChange={(e) => setValue('is_popular', e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-zinc-800 accent-purple-500"
                    />
                    <label htmlFor="is_popular_edit" className="text-sm text-gray-300 cursor-pointer">
                        Популярный абонемент
                    </label>
                </div>
                <div className="space-y-1">
                    <label className="text-sm text-gray-300">Порядок сортировки</label>
                    <input
                        type="number"
                        {...register('sort_order')}
                        className={inputCls}
                    />
                </div>
            </div>

            {errors.root && <p className="text-sm text-red-400">{errors.root.message}</p>}

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="rounded-sm px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
                >
                    Отмена
                </button>
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
}
