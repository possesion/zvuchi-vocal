'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import type { NewsRow } from '@/lib/db';
import { newsInputCls } from './news.utils';

interface NewsEditFormProps {
    post: NewsRow;
    onSaved: () => void;
    onCancel: () => void;
}

export function NewsEditForm({ post, onSaved, onCancel }: NewsEditFormProps) {
    const [form, setForm] = useState({
        title: post.title,
        summary: post.summary,
        content: post.content,
        published_at: post.published_at.slice(0, 16),
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState(post.cover_url);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/v1/news', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: post.id, ...form }),
            });
            if (!res.ok) { setError('Ошибка при сохранении'); return; }
            if (coverFile) {
                const fd = new FormData();
                fd.append('file', coverFile);
                await fetch(`/api/v1/news/${post.id}/cover`, { method: 'POST', body: fd });
                URL.revokeObjectURL(coverPreview);
            }
            onSaved();
        } catch {
            setError('Произошла ошибка. Попробуйте ещё раз.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-zinc-900 rounded-sm">
            <div>
                <label className="mb-1 block text-xs text-white/60">Заголовок</label>
                <input value={form.title} onChange={set('title')} required className={newsInputCls} />
            </div>
            <div>
                <label className="mb-1 block text-xs text-white/60">Краткое описание</label>
                <textarea value={form.summary} onChange={set('summary')} required rows={2} className={newsInputCls} />
            </div>
            <div>
                <label className="mb-1 block text-xs text-white/60">Полный текст</label>
                <textarea value={form.content} onChange={set('content')} required rows={5} className={`${newsInputCls} resize-y font-mono`} />
            </div>
            <div>
                <label className="mb-1 block text-xs text-white/60">Обложка</label>
                <label className="relative flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-white/20 hover:border-white/40">
                    {coverPreview
                        ? <Image src={coverPreview} alt="cover" fill className="object-cover" />
                        : <div className="text-center text-white/40"><ImagePlus className="mx-auto h-5 w-5" /><p className="text-xs mt-1">Заменить</p></div>
                    }
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
                </label>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancel} className="rounded-sm px-3 py-1.5 text-sm text-white/60 hover:text-white">
                    Отмена
                </button>
                <button type="submit" disabled={saving} className="rounded-sm bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}
