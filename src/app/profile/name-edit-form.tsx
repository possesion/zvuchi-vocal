'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserName } from '@/app/actions/profile';
import { Pencil, Check, X } from 'lucide-react';

interface NameEditFormProps {
    currentName: string | null | undefined;
}

export function NameEditForm({ currentName }: NameEditFormProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(currentName || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        
        const result = await updateUserName(name);
        
        if (result.success) {
            setEditing(false);
            router.refresh();
        } else {
            setError(result.error || 'Ошибка при сохранении');
        }
        
        setSaving(false);
    };

    const handleCancel = () => {
        setName(currentName || '');
        setError(null);
        setEditing(false);
    };

    if (!editing) {
        return (
            <div className="flex items-center gap-3">
                <span className="font-medium">{currentName || 'Не указано'}</span>
                <button
                    onClick={() => setEditing(true)}
                    className="rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Редактировать имя"
                >
                    <Pencil className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите ваше имя"
                    className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                    disabled={saving}
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full p-2 bg-green-600 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    aria-label="Сохранить"
                >
                    <Check className="h-4 w-4" />
                </button>
                <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded-full p-2 bg-red-600 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    aria-label="Отмена"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
    );
}
