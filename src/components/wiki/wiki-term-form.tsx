'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import cn from 'classnames';
import { useState } from 'react';
import { instructors } from '@/app/constants';
import type { WikiCategoryRow } from '@/lib/db';

enum DescTab { edit = 'edit', preview = 'preview' }

export interface WikiTermFormData {
    title: string;
    description: string;
    category: string;
    author: string;
}

interface WikiTermFormProps {
    value: WikiTermFormData;
    onChange: (data: WikiTermFormData) => void;
    categories: WikiCategoryRow[];
    inputClassName?: string;
}

export function WikiTermForm({ value, onChange, categories, inputClassName }: WikiTermFormProps) {
    const [descTab, setDescTab] = useState<DescTab>(DescTab.edit);

    const set = (field: keyof WikiTermFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        onChange({ ...value, [field]: e.target.value });

    const base = inputClassName ?? 'w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 text-white focus:border-brand focus:outline-none';

    return (
        <>
            <div className="space-y-1">
                <label className="text-sm text-gray-300">Заголовок</label>
                <input value={value.title} onChange={set('title')} required className={base} />
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Категория</label>
                <select value={value.category} onChange={set('category')} className={base}>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-gray-900">{c.label}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-300">Автор</label>
                <select value={value.author} onChange={set('author')} className={base}>
                    <option value="" className="bg-gray-900">— не указан —</option>
                    {instructors.map((inst) => (
                        <option key={inst.name} value={inst.name} className="bg-gray-900">{inst.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-gray-300">Описание</label>
                    <div className="flex rounded-sm overflow-hidden border border-white/20 text-xs">
                        {([DescTab.edit, DescTab.preview] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setDescTab(tab)}
                                className={cn('px-3 py-1 transition-colors', descTab === tab ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white')}
                            >
                                {tab === DescTab.edit ? 'Редактор' : 'Превью'}
                            </button>
                        ))}
                    </div>
                </div>
                {descTab === DescTab.edit ? (
                    <textarea
                        value={value.description}
                        onChange={set('description')}
                        required
                        rows={8}
                        className={cn(base, 'resize-y font-mono text-sm')}
                    />
                ) : (
                    <div className="min-h-[12rem] w-full rounded-sm bg-white/10 border border-white/20 px-3 py-2 prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value.description}</ReactMarkdown>
                    </div>
                )}
            </div>
        </>
    );
}
