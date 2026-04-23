'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X, Check, Trash2 } from 'lucide-react';
import { WikiTermForm, type WikiTermFormData } from '@/components/wiki/wiki-term-form';
import { WikiCoverUploader } from '@/components/wiki/wiki-cover-uploader';
import type { WikiTermRow, WikiCategoryRow } from '@/lib/db';

interface TermEditorProps {
    term: WikiTermRow;
    categories: WikiCategoryRow[];
}

export function TermEditor({ term, categories }: TermEditorProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [formData, setFormData] = useState<WikiTermFormData>({
        title: term.title,
        description: term.description,
        category: term.category,
        author: term.author ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`/api/v1/wiki/${term.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Ошибка сохранения');
                return;
            }
            setIsEditing(false);
            router.refresh();
        } catch {
            setError('Ошибка сети');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ title: term.title, description: term.description, category: term.category, author: term.author ?? '' });
        setIsEditing(false);
        setError('');
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch(`/api/v1/wiki/${term.id}`, { method: 'DELETE' });
            router.push('/wiki');
            router.refresh();
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-sm text-white transition-all hover:bg-white/20"
                >
                    <Pencil className="h-4 w-4" /> Редактировать
                </button>
                {confirmDelete ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">Удалить статью?</span>
                        <button onClick={handleDelete} disabled={deleting} className="rounded-sm bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                            {deleting ? '...' : 'Да'}
                        </button>
                        <button onClick={() => setConfirmDelete(false)} className="rounded-sm bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20">
                            Нет
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-sm text-white transition-all hover:bg-red-600/80">
                        <Trash2 className="h-4 w-4" /> Удалить
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-sm bg-white/10 backdrop-blur-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Редактирование</h2>
                <button onClick={handleCancel} className="text-gray-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <WikiTermForm value={formData} onChange={setFormData} categories={categories} />

            <WikiCoverUploader termId={term.id} currentUrl={term.cover_url ?? ''} onChanged={() => router.refresh()} />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-brand px-5 py-2 font-bold text-white hover:bg-brand/90 disabled:opacity-50">
                    <Check className="h-4 w-4" />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button onClick={handleCancel} className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-2 text-white hover:bg-white/10">
                    Отмена
                </button>
            </div>
        </div>
    );
}
