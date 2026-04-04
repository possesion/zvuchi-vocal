'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { instructors } from '@/app/constants';
import type { WikiCategoryRow } from '@/lib/db';

interface WikiAddFormProps {
    categories: WikiCategoryRow[];
}

export const WikiAddForm = ({ categories }: WikiAddFormProps) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: categories[0]?.id ?? '',
        author: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch('/api/v1/wiki', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'authorized' },
                body: JSON.stringify(form),
            });
            setForm({ title: '', description: '', category: categories[0]?.id ?? '', author: '' });
            setOpen(false);
            router.refresh();
        } finally {
            setSaving(false);
        }
    };

    if (!open) {
        return (
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setOpen(true)}
                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                    + Добавить статью
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">Новая статья</h2>

            <div className="mb-4">
                <label className="mb-1 block text-sm text-white/70">Название</label>
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                    className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                />
            </div>

            <div className="mb-4">
                <label className="mb-1 block text-sm text-white/70">Категория</label>
                <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                >
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="mb-1 block text-sm text-white/70">Автор</label>
                <select
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                    className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                >
                    <option value="">— не указан —</option>
                    {instructors.map((inst) => (
                        <option key={inst.name} value={inst.name}>{inst.name}</option>
                    ))}
                </select>
            </div>

            <div className="mb-6">
                <label className="mb-1 block text-sm text-white/70">Описание</label>
                <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    required
                    rows={5}
                    className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                />
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
};
