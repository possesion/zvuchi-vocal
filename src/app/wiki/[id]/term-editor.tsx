'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Pencil, X, Check, Trash2 } from 'lucide-react';
import cn from 'classnames';
import { instructors } from '@/app/constants';
import type { WikiTermRow, WikiCategoryRow } from '@/lib/db';

enum EditorMode {
    edit = 'edit',
    preview = 'preview'
}

interface TermEditorProps {
    term: WikiTermRow;
    categories: WikiCategoryRow[];
}

export function TermEditor({ term, categories }: TermEditorProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [title, setTitle] = useState(term.title);
    const [description, setDescription] = useState(term.description);
    const [category, setCategory] = useState(term.category);
    const [author, setAuthor] = useState(term.author ?? '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [descTab, setDescTab] = useState<EditorMode>(EditorMode.edit);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`/api/v1/wiki/${term.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, category, author }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Ошибка сохранения');
                return;
            }

            setIsEditing(false);
        } catch {
            setError('Ошибка сети');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTitle(term.title);
        setDescription(term.description);
        setCategory(term.category);
        setAuthor(term.author ?? '');
        setIsEditing(false);
        setError('');
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch(`/api/v1/wiki/${term.id}`, {
                method: 'DELETE',
                headers: { Authorization: 'authorized' },
            });
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
                    aria-label="Редактировать статью"
                >
                    <Pencil className="h-4 w-4" />
                    Редактировать
                </button>
                {confirmDelete ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">Удалить статью?</span>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded-sm bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleting ? '...' : 'Да'}
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="rounded-sm bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20"
                        >
                            Нет
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-sm text-white transition-all hover:bg-red-600/80"
                        aria-label="Удалить статью"
                    >
                        <Trash2 className="h-4 w-4" />
                        Удалить
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

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Заголовок</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 focus:border-brand focus:outline-none"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Категория</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 text-white focus:border-brand focus:outline-none"
                >
                    {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-gray-900">
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Автор</label>
                <select
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 text-white focus:border-brand focus:outline-none"
                >
                    <option value="" className="bg-gray-900">— не указан —</option>
                    {instructors.map((inst) => (
                        <option key={inst.name} value={inst.name} className="bg-gray-900">
                            {inst.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-gray-300">Описание</label>
                    <div className="flex rounded-sm overflow-hidden border border-white/20 text-xs">
                        <button
                            type="button"
                            onClick={() => setDescTab(EditorMode.edit)}
                            className={cn('px-3 py-1 transition-colors', descTab === EditorMode.edit ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white')}
                        >
                            Редактор
                        </button>
                        <button
                            type="button"
                            onClick={() => setDescTab(EditorMode.preview)}
                            className={cn('px-3 py-1 transition-colors', descTab === EditorMode.preview ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white')}
                        >
                            Превью
                        </button>
                    </div>
                </div>
                {descTab === 'edit' ? (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={8}
                        className="w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 focus:border-brand focus:outline-none resize-y font-mono text-sm"
                    />
                ) : (
                    <div className="min-h-[12rem] w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{description}</ReactMarkdown>
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-sm bg-brand px-5 py-2 font-bold text-white transition-all hover:bg-brand/90 disabled:opacity-50"
                >
                    <Check className="h-4 w-4" />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-2 text-white transition-all hover:bg-white/10"
                >
                    Отмена
                </button>
            </div>
        </div>
    );
}
