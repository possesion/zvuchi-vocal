'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NewsSchema, NewsForm } from '@/lib/definitions';
import { newsInputCls } from '@/components/sections/news/utils';

export function NewsAddForm() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState('');
    const coverInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<NewsForm>({
        resolver: yupResolver(NewsSchema),
        defaultValues: { title: '', summary: '', content: '', published_at: '' },
    });

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const resetAll = () => {
        reset();
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverFile(null);
        setCoverPreview('');
        setError('');
    };

    const onSubmit = async (data: NewsForm) => {
        setError('');
        try {
            const res = await fetch('/api/v1/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    published_at: data.published_at || new Date().toISOString(),
                }),
            });
            if (!res.ok) { setError('Ошибка при создании новости'); return; }
            const created = await res.json();

            if (coverFile && created.id) {
                const fd = new FormData();
                fd.append('file', coverFile);
                const coverRes = await fetch(`/api/v1/news/${created.id}/cover`, { method: 'POST', body: fd });
                if (!coverRes.ok) setError('Новость создана, но обложку загрузить не удалось');
            }

            resetAll();
            setOpen(false);
            router.refresh();
        } catch {
            setError('Произошла ошибка. Попробуйте ещё раз.');
        }
    };

    if (!open) {
        return (
            <div className="flex justify-end">
                <button onClick={() => setOpen(true)} className="rounded-sm bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700">
                    + Добавить новость
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 rounded-sm bg-white/10 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-lg font-semibold text-white">Новая новость</h2>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Заголовок</label>
                <input {...register('title')} className={newsInputCls} />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm text-gray-300">Краткое описание</label>
                <textarea {...register('summary')} rows={2} className={newsInputCls} />
                {errors.summary && <p className="text-xs text-red-400">{errors.summary.message}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm text-gray-300">Полный текст</label>
                <textarea {...register('content')} rows={6} className={`${newsInputCls} resize-y font-mono text-sm`} />
                {errors.content && <p className="text-xs text-red-400">{errors.content.message}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm text-gray-300">Дата публикации (необязательно)</label>
                <input type="datetime-local" {...register('published_at')} className={newsInputCls} />
            </div>
            <div className="space-y-1">
                <label className="text-sm text-gray-300">Обложка</label>
                <div
                    onClick={() => coverInputRef.current?.click()}
                    className="relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-white/20 transition-colors hover:border-white/40"
                >
                    {coverPreview
                        ? <Image src={coverPreview} alt="cover preview" fill className="object-cover" />
                        : <div className="text-center text-white/40"><ImagePlus className="mx-auto mb-1 h-6 w-6" /><p className="text-xs">JPG, PNG, WebP до 5MB</p></div>
                    }
                </div>
                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { resetAll(); setOpen(false); }} className="rounded-sm px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
                    Отмена
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-sm bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50">
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}
