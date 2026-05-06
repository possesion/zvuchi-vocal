'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Music, Clock, Star, Play, Pencil, Check, X } from 'lucide-react';
import type { InstructorRow, WikiTermRow } from '@/lib/types';

export interface InstructorProfileProps {
    instructor: InstructorRow;
    techniqueTerms: WikiTermRow[];
    isAuthorized: boolean;
}

const inputCls =
    'w-full rounded-sm bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-[var(--color-brand)]';

export function InstructorProfile({ instructor, techniqueTerms, isAuthorized }: InstructorProfileProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    // ── Edit form state ──────────────────────────────────────────────────────
    const [formName, setFormName] = useState(instructor.name);
    const [formSpecialty, setFormSpecialty] = useState(instructor.specialty);
    const [formFeature, setFormFeature] = useState(instructor.feature);
    const [formExperience, setFormExperience] = useState(instructor.experience);
    const [formBio, setFormBio] = useState(instructor.bio);
    const [formImage, setFormImage] = useState(instructor.image);
    const [formPresentationVideo, setFormPresentationVideo] = useState(instructor.presentation_video);
    const [formPerformanceVideos, setFormPerformanceVideos] = useState(
        instructor.performance_videos.join('\n')
    );
    const [formTechniques, setFormTechniques] = useState<string[]>(instructor.techniques);
    const [allWikiTerms, setAllWikiTerms] = useState<WikiTermRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [wikiLoaded, setWikiLoaded] = useState(false);

    const openEdit = async () => {
        if (!wikiLoaded) {
            try {
                const res = await fetch('/api/v1/wiki');
                if (res.ok) {
                    const data = await res.json();
                    setAllWikiTerms(data.terms ?? []);
                }
            } catch {
                console.error('ошибка получения wiki статей')
            }
            setWikiLoaded(true);
        }
        setIsEditing(true);
    };

    const toggleTechnique = (id: string) => {
        setFormTechniques((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/v1/instructors/${instructor.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formName,
                    specialty: formSpecialty,
                    feature: formFeature,
                    experience: formExperience,
                    bio: formBio,
                    image: formImage,
                    presentation_video: formPresentationVideo,
                    performance_videos: formPerformanceVideos
                        .split('\n')
                        .map((href: string) => href.trim())
                        .filter(Boolean),
                    techniques: formTechniques,
                }),
            });

            if (res.ok) {
                setIsEditing(false);
                router.refresh();
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative">
            {/* Edit button */}
            {isAuthorized && !isEditing && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={openEdit}
                        className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-sm text-white hover:bg-[var(--color-brand)]/30 transition-colors"
                        aria-label="Редактировать профиль"
                    >
                        <Pencil className="h-4 w-4" />
                        Редактировать
                    </button>
                </div>
            )}

            {/* ── Edit form ──────────────────────────────────────────────── */}
            {isEditing && (
                <form
                    onSubmit={handleSave}
                    className="mb-8 rounded-sm bg-zinc-900 p-6 space-y-4 ring-1 ring-white/10"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-white">Редактирование профиля</h2>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="text-white/50 hover:text-white"
                            aria-label="Закрыть форму"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Имя *</label>
                            <input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                required
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Предмет</label>
                            <input
                                value={formSpecialty}
                                onChange={(e) => setFormSpecialty(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Опыт</label>
                            <input
                                value={formExperience}
                                onChange={(e) => setFormExperience(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Сверхсила</label>
                            <input
                                value={formFeature}
                                onChange={(e) => setFormFeature(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-white/60">Биография (Markdown)</label>
                        <textarea
                            value={formBio}
                            onChange={(e) => setFormBio(e.target.value)}
                            rows={6}
                            className={`${inputCls} resize-y`}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-white/60">Фото (URL)</label>
                        <input
                            value={formImage}
                            onChange={(e) => setFormImage(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-white/60">Видео-представление (S3 URL)</label>
                        <input
                            value={formPresentationVideo}
                            onChange={(e) => setFormPresentationVideo(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-white/60">
                            Видео выступлений (каждый URL на новой строке)
                        </label>
                        <textarea
                            value={formPerformanceVideos}
                            onChange={(e) => setFormPerformanceVideos(e.target.value)}
                            rows={4}
                            className={`${inputCls} resize-y`}
                            placeholder="https://s3.example.com/video1.mp4&#10;https://s3.example.com/video2.mp4"
                        />
                    </div>

                    {allWikiTerms.length > 0 && (
                        <div>
                            <label className="mb-2 block text-xs text-white/60">Техники (из вики)</label>
                            <div className="flex flex-wrap gap-2">
                                {allWikiTerms.map((term) => (
                                    <label
                                        key={term.id}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formTechniques.includes(term.id)}
                                            onChange={() => toggleTechnique(term.id)}
                                            className="accent-[var(--color-brand)]"
                                        />
                                        {term.title}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="rounded-sm px-4 py-2 text-sm text-white/60 hover:text-white"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-brand)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            <Check className="h-4 w-4" />
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            )}

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Photo */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                    <Image
                        src={instructor.image || '/placeholder.png'}
                        alt={`Фото преподавателя ${instructor.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                    />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-5">
                    <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                        {instructor.name}
                    </h1>

                    {instructor.specialty && (
                        <div className="pl-4 flex items-center gap-2 text-white/80">
                            <Music className="h-5 w-5 shrink-0 text-[var(--color-brand)]" aria-hidden="true" />
                            <span>{instructor.specialty}</span>
                        </div>
                    )}

                    {instructor.experience && (
                        <div className="pl-4 flex items-center gap-2 text-white/80">
                            <Clock className="h-5 w-5 shrink-0 text-[var(--color-brand)]" aria-hidden="true" />
                            <span>Опыт преподавания: {instructor.experience}</span>
                        </div>
                    )}

                    {instructor.feature && (
                        <div className="flex items-start gap-3 rounded-sm border border-[var(--color-brand)]/30 bg-black/65 shadow-lg shadow-[rgb(88,22,66)] px-4 py-3">
                            <Star className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]" aria-hidden="true" />
                            <p className="text-white">{instructor.feature}</p>
                        </div>
                    )}

                    {/* Bio (shown inline on desktop) */}
                    {instructor.bio && (
                        <div className="hidden lg:block prose prose-invert prose-md max-w-non">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {instructor.bio}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bio (mobile) ───────────────────────────────────────────── */}
            {instructor.bio && (
                <section className="mt-10 lg:hidden" aria-labelledby="bio-heading">
                    <h2 id="bio-heading" className="mb-4 text-2xl font-bold text-white">
                        О педагоге
                    </h2>
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {instructor.bio}
                        </ReactMarkdown>
                    </div>
                </section>
            )}

            {/* ── Techniques ─────────────────────────────────────────────── */}
            {techniqueTerms.length > 0 && (
                <section className="mt-10" aria-labelledby="techniques-heading">
                    <h2 id="techniques-heading" className="mb-4 text-2xl font-bold text-white">
                        Любимые техники
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {techniqueTerms.map((term) => (
                            <Link
                                key={term.id}
                                href={`/wiki/${term.id}`}
                                className="rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-[var(--color-brand)]/20 transition-colors"
                            >
                                {term.title}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Presentation video ─────────────────────────────────────── */}
            <section className="mt-10" aria-labelledby="presentation-heading">
                <h2 id="presentation-heading" className="mb-4 text-2xl font-bold text-white">
                    Визитка
                </h2>
                {instructor.presentation_video ? (
                    <video
                        controls
                        className="w-full rounded-sm"
                        src={instructor.presentation_video}
                        aria-label={`Видео-представление педагога ${instructor.name}`}
                    />
                ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-sm bg-white/5">
                        <div className="flex flex-col items-center gap-3 text-white/40">
                            <Play className="h-12 w-12" aria-hidden="true" />
                            <p className="text-sm">Видео скоро появится</p>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Performance videos ─────────────────────────────────────── */}
            <section className="mt-10" aria-labelledby="performances-heading">
                <h2 id="performances-heading" className="mb-4 text-2xl font-bold text-white">
                    Примеры выступлений
                </h2>
                {instructor.performance_videos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {instructor.performance_videos.map((url: string) => (
                            <video
                                key={url}
                                controls
                                className="w-full rounded-sm aspect-video object-cover"
                                src={url}
                                aria-label={`Выступление педагога ${instructor.name}`}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-sm bg-white/5">
                        <div className="flex flex-col items-center gap-3 text-white/40">
                            <Play className="h-12 w-12" aria-hidden="true" />
                            <p className="text-sm">Видео скоро появится</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
