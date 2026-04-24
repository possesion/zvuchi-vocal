'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Pencil, Trash2, ImagePlus, Check } from 'lucide-react';
import type { InstructorRow } from '@/lib/db';

const inputCls = 'w-full rounded-sm bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-purple-500';

type FormData = Omit<InstructorRow, 'id'>;

const emptyForm = (): FormData => ({
    name: '', specialty: '', feature: '', experience: '',
    bio: '', image: '', video: '', sort_order: 0,
});

// ─── Photo uploader ───────────────────────────────────────────────────────────

function PhotoPicker({ currentUrl, onUploaded }: { currentUrl: string; onUploaded: (url: string) => void }) {
    const [preview, setPreview] = useState(currentUrl);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        onUploaded(localUrl); // передаём blob: URL, handleAdd/handleEdit загрузят в S3
    };

    return (
        <label className="relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 hover:border-white/40">
            {preview
                ? <Image src={preview} alt="photo" fill className="object-cover rounded-full" />
                : <div className="text-center text-white/40"><ImagePlus className="mx-auto h-5 w-5" /><p className="text-xs mt-1">Фото</p></div>
            }
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="hidden" />
        </label>
    );
}

// ─── Inline form ──────────────────────────────────────────────────────────────

interface InstructorFormProps {
    initial: FormData;
    onSave: (data: FormData) => Promise<void>;
    onCancel: () => void;
    title: string;
}

function InstructorForm({ initial, onSave, onCancel, title }: InstructorFormProps) {
    const [form, setForm] = useState<FormData>(initial);
    const [saving, setSaving] = useState(false);

    const set = (field: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [field]: field === 'sort_order' ? Number(e.target.value) : e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(form); } finally { setSaving(false); }
    };

    return (
        // TODO ОТРЕФАЧИТЬ
        <form onSubmit={handleSubmit} className="rounded-sm bg-zinc-900 p-5 space-y-3">
            <div className="flex items-start gap-4">
                <PhotoPicker currentUrl={form.image} onUploaded={(url) => setForm((f) => ({ ...f, image: url }))} />
                <div className="flex-1 space-y-3">
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <div><label className="mb-1 block text-xs text-white/60">Имя *</label><input value={form.name} onChange={set('name')} required className={inputCls} /></div>
                    <div><label className="mb-1 block text-xs text-white/60">Предмет (через запятую)</label><input value={form.specialty} onChange={set('specialty')} className={inputCls} /></div>
                    <div><label className="mb-1 block text-xs text-white/60">Опыт</label><input value={form.experience} onChange={set('experience')} className={inputCls} /></div>
                </div>
            </div>
            <div><label className="mb-1 block text-xs text-white/60">Сверхсила</label><input value={form.feature} onChange={set('feature')} className={inputCls} /></div>
            <div><label className="mb-1 block text-xs text-white/60">Биография</label><textarea value={form.bio} onChange={set('bio')} rows={4} className={`${inputCls} resize-y`} /></div>
            <div><label className="mb-1 block text-xs text-white/60">Ссылка на видео</label><input value={form.video} onChange={set('video')} className={inputCls} /></div>
            <div><label className="mb-1 block text-xs text-white/60">Порядок отображения</label><input type="number" value={form.sort_order} onChange={set('sort_order')} className={inputCls} /></div>
            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancel} className="rounded-sm px-3 py-1.5 text-sm text-white/60 hover:text-white">Отмена</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-sm bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
                    <Check className="h-4 w-4" />{saving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}

// ─── Manager ──────────────────────────────────────────────────────────────────

interface InstructorManagerProps {
    instructors: InstructorRow[];
}

export function InstructorManager({ instructors }: InstructorManagerProps) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [adding, setAdding] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleAdd = async (data: FormData) => {
        const res = await fetch('/api/v1/instructors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, image: '' }), // фото загружается отдельно
        });
        const created = await res.json();

        // Если выбрано локальное фото (blob:) — загружаем в S3
        if (data.image.startsWith('blob:') && created.id) {
            const blob = await fetch(data.image).then((r) => r.blob());
            const file = new File([blob], 'photo.jpg', { type: blob.type });
            const fd = new FormData();
            fd.append('file', file);
            await fetch(`/api/v1/instructors/${created.id}/photo`, { method: 'POST', body: fd });
        }

        setAdding(false);
        router.refresh();
    };

    const handleEdit = async (id: number, data: FormData) => {
        // Если фото изменилось на blob — загружаем в S3 отдельно
        if (data.image.startsWith('blob:')) {
            const blob = await fetch(data.image).then((r) => r.blob());
            const file = new File([blob], 'photo.jpg', { type: blob.type });
            const fd = new FormData();
            fd.append('file', file);
            const photoRes = await fetch(`/api/v1/instructors/${id}/photo`, { method: 'POST', body: fd });
            const photoData = await photoRes.json();
            if (photoRes.ok) data = { ...data, image: photoData.url };
        }

        await fetch(`/api/v1/instructors/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        setEditingId(null);
        router.refresh();
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await fetch('/api/v1/instructors', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deleteTarget }),
            });
            router.refresh();
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="space-y-4">
            {!adding ? (
                <div className="flex justify-end">
                    <button onClick={() => setAdding(true)} className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                        + Добавить педагога
                    </button>
                </div>
            ) : (
                <InstructorForm
                    title="Новый педагог"
                    initial={emptyForm()}
                    onSave={handleAdd}
                    onCancel={() => setAdding(false)}
                />
            )}

            <div className="space-y-3">
                {instructors.map((inst) =>
                    editingId === inst.id ? (
                <InstructorForm
                    key={inst.id}
                    title={`Редактирование: ${inst.name}`}
                    initial={{ name: inst.name, specialty: inst.specialty, feature: inst.feature, experience: inst.experience, bio: inst.bio, image: inst.image, video: inst.video, sort_order: inst.sort_order }}
                    onSave={(data) => handleEdit(inst.id, data)}
                    onCancel={() => setEditingId(null)}
                />
                    ) : (
                        <div key={inst.id} className="flex items-center gap-4 rounded-sm bg-white/5 px-4 py-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10">
                                {inst.image && <Image src={inst.image} alt={inst.name} fill className="object-cover" sizes="48px" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{inst.name}</p>
                                <p className="text-xs text-white/50 truncate">{inst.specialty} · {inst.experience}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => setEditingId(inst.id)} className="rounded-full bg-white/10 p-1.5 text-white hover:bg-purple-600" aria-label="Редактировать">
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setDeleteTarget(inst.id)} className="rounded-full bg-white/10 p-1.5 text-white hover:bg-red-600" aria-label="Удалить">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>

            {deleteTarget !== null && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70">
                    <div className="mx-4 w-full max-w-sm rounded-lg bg-zinc-900 p-6 text-white shadow-xl">
                        <p className="mb-2 text-lg font-semibold">Удалить педагога?</p>
                        <p className="mb-6 text-sm text-white/60">Это действие нельзя отменить.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-md px-4 py-2 text-sm text-white/70 hover:text-white">Отмена</button>
                            <button onClick={confirmDelete} disabled={deleting} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                                {deleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
