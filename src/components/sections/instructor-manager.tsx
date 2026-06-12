'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Pencil, Trash2, ImagePlus, Check } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Instructor } from '@/lib/types';
import { formInputCls } from '@/lib/ui-constants';
import { InstructorSchema, InstructorForm } from '@/lib/definitions';
import { createInstructorAction, updateInstructorAction, deleteInstructorAction } from '@/app/actions/instructors';
import { AlertDialog } from '@/components/common/alert-dialog/alert-dialog';

type FormData = Omit<Instructor, 'id'>;


// ─── Photo uploader ───────────────────────────────────────────────────────────

function PhotoPicker({ currentUrl, onUploaded }: { currentUrl: string; onUploaded: (url: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const localUrl = URL.createObjectURL(file);
        onUploaded(localUrl); // передаём blob: URL, handleAdd/handleEdit загрузят в S3
    };

    return (
        <label className="relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 hover:border-white/40">
            {currentUrl
                ? <Image src={currentUrl} alt="photo" fill className="object-cover rounded-full" />
                : <div className="text-center text-white/40"><ImagePlus className="mx-auto h-5 w-5" /><p className="text-xs mt-1">Фото</p></div>
            }
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="hidden" />
        </label>
    );
}

// ─── Inline form ──────────────────────────────────────────────────────────────

interface InstructorFormProps {
    initial?: Omit<Instructor, 'id'>;
    onSave: (data: FormData) => Promise<void>;
    onCancel: () => void;
    title: string;
}

function InstructorFormComponent({ initial, onSave, onCancel, title }: InstructorFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<InstructorForm>({
        resolver: yupResolver(InstructorSchema),
        defaultValues: {
            name: initial?.name,
            specialty: initial?.specialty,
            feature: initial?.feature,
            experience: initial?.experience,
            bio: initial?.bio,
            image: initial?.image,
            video: initial?.video,
            sortOrder: initial?.sortOrder,
            slug: initial?.slug,
            presentationVideo: initial?.presentationVideo,
            performanceVideos: initial?.performanceVideos.join('\n'),
            techniques: initial?.techniques,
        },
    });

    const imageUrl = useWatch({ control, name: 'image' });

    const onSubmit = async (values: InstructorForm) => {
        const data: FormData = {
            name: values.name,
            specialty: values.specialty ?? '',
            feature: values.feature ?? '',
            experience: values.experience ?? '',
            bio: values.bio ?? '',
            image: values.image ?? '',
            video: values.video ?? '',
            sortOrder: values.sortOrder ?? 0,
            slug: values.slug ?? '',
            presentationVideo: values.presentationVideo ?? '',
            performanceVideos: (values.performanceVideos ?? '')
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            techniques: values.techniques ?? [],
        };
        await onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-sm bg-zinc-900 p-5 space-y-3">
            <div className="flex items-start gap-4">
                <PhotoPicker currentUrl={imageUrl ?? ''} onUploaded={(url) => setValue('image', url)} />
                <div className="flex-1 space-y-3">
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Имя *</label>
                        <input {...register('name')} className={formInputCls} />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                    </div>
                    <div><label className="mb-1 block text-xs text-white/60">Предмет (через запятую)</label><input {...register('specialty')} className={formInputCls} /></div>
                    <div><label className="mb-1 block text-xs text-white/60">Опыт</label><input {...register('experience')} className={formInputCls} /></div>
                </div>
            </div>
            <div><label className="mb-1 block text-xs text-white/60">Сверхсила</label><input {...register('feature')} className={formInputCls} /></div>
            <div><label className="mb-1 block text-xs text-white/60">Биография</label><textarea {...register('bio')} rows={4} className={`${formInputCls} resize-y`} /></div>
            <div><label className="mb-1 block text-xs text-white/60">Ссылка на видео</label><input {...register('video')} className={formInputCls} /></div>
            <div><label className="mb-1 block text-xs text-white/60">Порядок отображения</label><input type="number" {...register('sortOrder')} className={formInputCls} /></div>
            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancel} className="rounded-sm px-3 py-1.5 text-sm text-white/60 hover:text-white">Отмена</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-1.5 rounded-sm bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
                    <Check className="h-4 w-4" />{isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}

// ─── Manager ──────────────────────────────────────────────────────────────────

interface InstructorManagerProps {
    instructors: Instructor[];
}

export function InstructorManager({ instructors }: InstructorManagerProps) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [adding, setAdding] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleAdd = async (data: FormData) => {
        try {
            const result = await createInstructorAction({
                ...data,
                image: '',
            });
            if (!result.success) return;

            const createdId = result.data.id;

            if (data.image.startsWith('blob:') && createdId) {
                const blob = await fetch(data.image).then((r) => r.blob());
                const file = new File([blob], 'photo.jpg', { type: blob.type });
                const fd = new FormData();
                fd.append('file', file);
                await fetch(`/api/v1/instructors/${createdId}/photo`, { method: 'POST', body: fd });
                URL.revokeObjectURL(data.image);
            }
        } catch { /* silent — router.refresh покажет актуальное состояние */ }
        setAdding(false);
        router.refresh();
    };

    const handleEdit = async (id: number, data: FormData) => {
        try {
            if (data.image.startsWith('blob:')) {
                const blob = await fetch(data.image).then((r) => r.blob());
                const file = new File([blob], 'photo.jpg', { type: blob.type });
                const fd = new FormData();
                fd.append('file', file);
                const photoRes = await fetch(`/api/v1/instructors/${id}/photo`, { method: 'POST', body: fd });
                const photoData = await photoRes.json();
                URL.revokeObjectURL(data.image);
                if (photoRes.ok) data = { ...data, image: photoData.url };
            }

            await updateInstructorAction({ id, ...data });
        } catch { /* silent */ }
        setEditingId(null);
        router.refresh();
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteInstructorAction(deleteTarget);
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
            <InstructorFormComponent
                    title="Новый педагог"
                    // initial={emptyForm()}
                    onSave={handleAdd}
                    onCancel={() => setAdding(false)}
                />
            )}

            <div className="space-y-3">
                {instructors.map((inst) =>
                    editingId === inst.id ? (
                        <InstructorFormComponent
                            key={inst.id}
                            title={`Редактирование: ${inst.name}`}
                            initial={{
                                name: inst.name,
                                specialty: inst.specialty,
                                feature: inst.feature,
                                experience: inst.experience,
                                bio: inst.bio,
                                image: inst.image,
                                video: inst.video,
                                sortOrder: inst.sortOrder,
                                slug: inst.slug,
                                presentationVideo: inst.presentationVideo,
                                performanceVideos: inst.performanceVideos,
                                techniques: inst.techniques
                            }}
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

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                title="Удалить педагога?"
                description="Это действие нельзя отменить."
                confirmText={deleting ? 'Удаление...' : 'Удалить'}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                disabled={deleting}
            />
        </div>
    );
}