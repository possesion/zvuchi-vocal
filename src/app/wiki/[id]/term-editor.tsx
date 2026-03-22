'use client';

import { useState } from 'react';
import { Pencil, X, Check } from 'lucide-react';
import { GlossaryTerm, categoryLabels } from '../glossary-data';

interface TermEditorProps {
    term: GlossaryTerm;
}

export function TermEditor({ term }: TermEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(term.title);
    const [description, setDescription] = useState(term.description);
    const [category, setCategory] = useState(term.category);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`/api/v1/wiki/${term.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, category }),
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
        setIsEditing(false);
        setError('');
    };

    if (!isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-sm text-white transition-all hover:bg-white/20"
                aria-label="Редактировать статью"
            >
                <Pencil className="h-4 w-4" />
                Редактировать
            </button>
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
                    onChange={(e) => setCategory(e.target.value as GlossaryTerm['category'])}
                    className="w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 text-white focus:border-brand focus:outline-none"
                >
                    {(Object.keys(categoryLabels) as GlossaryTerm['category'][]).map((key) => (
                        <option key={key} value={key} className="bg-gray-900">
                            {categoryLabels[key]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Описание</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 focus:border-brand focus:outline-none resize-y"
                />
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
