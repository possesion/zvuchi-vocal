'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Calendar, ArrowRight, Trash2, Pencil, ImagePlus } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { NewsRow } from '@/lib/db';

const inputCls = 'w-full rounded-sm bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-purple-500';

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

// ─── Edit form ────────────────────────────────────────────────────────────────

interface EditFormProps {
    post: NewsRow;
    onSaved: () => void;
    onCancel: () => void;
}

function EditForm({ post, onSaved, onCancel }: EditFormProps) {
    const [form, setForm] = useState({
        title: post.title,
        summary: post.summary,
        content: post.content,
        published_at: post.published_at.slice(0, 16), // datetime-local format
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState(post.cover_url);
    const [saving, setSaving] = useState(false);

    const set = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
            await fetch('/api/v1/news', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: post.id, ...form }),
            });

            if (coverFile) {
                const fd = new FormData();
                fd.append('file', coverFile);
                await fetch(`/api/v1/news/${post.id}/cover`, { method: 'POST', body: fd });
            }

            onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-zinc-900 rounded-sm">
            <div>
                <label className="mb-1 block text-xs text-white/60">Заголовок</label>
                <input value={form.title} onChange={set('title')} required className={inputCls} />
            </div>
            <div>
                <label className="mb-1 block text-xs text-white/60">Краткое описание</label>
                <textarea value={form.summary} onChange={set('summary')} required rows={2} className={inputCls} />
            </div>
            <div>
                <label className="mb-1 block text-xs text-white/60">Полный текст</label>
                <textarea value={form.content} onChange={set('content')} required rows={5} className={`${inputCls} resize-y font-mono`} />
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

// ─── Card ─────────────────────────────────────────────────────────────────────

interface NewsCardProps {
    post: NewsRow;
    onOpen: (post: NewsRow) => void;
    isAuthorized: boolean;
    onDelete: (id: number) => void;
    onEdit: (post: NewsRow) => void;
}

function NewsCard({ post, onOpen, isAuthorized, onDelete, onEdit }: NewsCardProps) {
    return (
        <article className="relative flex flex-col rounded-sm bg-white/10 backdrop-blur-sm overflow-hidden transition-all hover:bg-white/15 hover:shadow-lg">
            {isAuthorized && (
                <div className="absolute right-2 top-2 z-10 flex gap-1">
                    <button
                        onClick={() => onEdit(post)}
                        className="rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-purple-600"
                        aria-label="Редактировать новость"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(post.id)}
                        className="rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
                        aria-label="Удалить новость"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
            <div className="relative h-44 w-full shrink-0 bg-white/5">
                {post.cover_url
                    ? <Image src={post.cover_url} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    : <div className="flex h-full items-center justify-center text-white/20 text-4xl select-none">🎤</div>
                }
            </div>
            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-white/50">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(post.published_at)}
                </div>
                <h3 className="mb-2 text-base font-bold text-white leading-snug">{post.title}</h3>
                <p className="mb-4 flex-1 text-sm text-white/70 line-clamp-3">{post.summary}</p>
                <button
                    onClick={() => onOpen(post)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand/80"
                >
                    Читать дальше <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </article>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function NewsModal({ post, onClose }: { post: NewsRow; onClose: () => void }) {
    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm bg-zinc-900 text-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70" aria-label="Закрыть">
                    <X className="h-5 w-5" />
                </button>
                {post.cover_url && (
                    <div className="relative h-56 w-full">
                        <Image src={post.cover_url} alt={post.title} fill className="object-cover rounded-t-sm" sizes="672px" />
                    </div>
                )}
                <div className="p-6 md:p-8">
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-white/50">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.published_at)}
                    </div>
                    <h2 className="mb-4 text-2xl font-bold">{post.title}</h2>
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-white/80">
                        {post.content}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

interface NewsFeedProps {
    posts: NewsRow[];
    isAuthorized?: boolean;
}

export function NewsFeed({ posts, isAuthorized = false }: NewsFeedProps) {
    const router = useRouter();
    const [activePost, setActivePost] = useState<NewsRow | null>(null);
    const [editingPost, setEditingPost] = useState<NewsRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await fetch('/api/v1/news', {
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

    if (!posts.length) return null;

    return (
        <section className="py-12 text-white">
            <div className="container">
                <h2 className="mb-8 text-2xl font-bold md:text-3xl">Новости студии</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) =>
                        editingPost?.id === post.id ? (
                            <EditForm
                                key={post.id}
                                post={editingPost}
                                onSaved={() => { setEditingPost(null); router.refresh(); }}
                                onCancel={() => setEditingPost(null)}
                            />
                        ) : (
                            <NewsCard
                                key={post.id}
                                post={post}
                                onOpen={setActivePost}
                                isAuthorized={isAuthorized}
                                onDelete={setDeleteTarget}
                                onEdit={setEditingPost}
                            />
                        )
                    )}
                </div>
            </div>

            {activePost && <NewsModal post={activePost} onClose={() => setActivePost(null)} />}

            {deleteTarget !== null && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70">
                    <div className="mx-4 w-full max-w-sm rounded-lg bg-zinc-900 p-6 text-white shadow-xl">
                        <p className="mb-2 text-lg font-semibold">Удалить новость?</p>
                        <p className="mb-6 text-sm text-white/60">Это действие нельзя отменить.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-md px-4 py-2 text-sm text-white/70 hover:text-white">
                                Отмена
                            </button>
                            <button onClick={confirmDelete} disabled={deleting} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                                {deleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
}
