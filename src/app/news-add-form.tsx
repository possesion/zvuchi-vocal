'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';

const inputCls = 'w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500';

export function NewsAddForm() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState('');
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ title: '', summary: '', content: '', published_at: '' });

    const setNewsField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/v1/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    published_at: new Date().toISOString(),
                }),
            });
            const created = await res.json();

            if (coverFile && created.id) {
                const fd = new FormData();
                fd.append('file', coverFile);
                await fetch(`/api/v1/news/${created.id}/cover`, { method: 'POST', body: fd });
            }

            setForm({ title: '', summary: '', content: '', published_at: '' });
            setCoverFile(null);
            setCoverPreview('');
            setOpen(false);
            router.refresh();
        } finally {
            setSaving(false);
        }
    };

    if (!open) {
        return (
            <div className="mb-6 flex justify-end">
                <button onClick={() => setOpen(true)} className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700">
                    + Добавить новость
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg bg-white/10 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-lg font-semibold text-white">Новая новость</h2>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Заголовок</label>
                <input value={form.title} onChange={setNewsField('title')} required className={inputCls} />
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Краткое описание</label>
                <textarea value={form.summary} onChange={setNewsField('summary')} required rows={2} className={inputCls} />
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Полный текст</label>
                <textarea value={form.content} onChange={setNewsField('content')} required rows={6} className={`${inputCls} resize-y font-mono text-sm`} />
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Дата публикации (необязательно)</label>
                <input type="datetime-local" value={form.published_at} onChange={setNewsField('published_at')} className={inputCls} />
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Обложка</label>
                <div
                    onClick={() => coverInputRef.current?.click()}
                    className="relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-white/20 transition-colors hover:border-white/40"
                >
                    {coverPreview
                        ? <Image src={coverPreview} alt="cover preview" fill className="object-cover" />
                        : <div className="text-center text-white/40"><ImagePlus className="mx-auto mb-1 h-6 w-6" /><p className="text-xs">JPG, PNG, WebP до 5MB</p></div>
                    }
                </div>
                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
                    Отмена
                </button>
                <button type="submit" disabled={saving} className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50">
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}
