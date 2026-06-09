'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Music, Clock, Star, Pencil } from 'lucide-react';
import type { Instructor, WikiTermRow } from '@/lib/types';
import { InstructorEditForm } from '@/components/sections/instructor-edit-form';
import { VideoPlaceholder } from '@/components/sections/video-placeholder';

export interface InstructorProfileProps {
    instructor: Instructor;
    techniqueTerms: WikiTermRow[];
    isAuthorized: boolean;
}

export function InstructorProfile({ instructor, techniqueTerms, isAuthorized }: InstructorProfileProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="relative">
            {/* Edit button */}
            {isAuthorized && !isEditing && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setIsEditing(true)}
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
                <InstructorEditForm
                    instructor={instructor}
                    onSaved={() => {
                        setIsEditing(false);
                        router.refresh();
                    }}
                />
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
                {instructor.presentationVideo ? (
                    <video
                        controls
                        className="w-full rounded-sm"
                        src={instructor.presentationVideo}
                        aria-label={`Видео-представление педагога ${instructor.name}`}
                    />
                ) : (
                    <VideoPlaceholder />
                )}
            </section>

            {/* ── Performance videos ─────────────────────────────────────── */}
            <section className="mt-10" aria-labelledby="performances-heading">
                <h2 id="performances-heading" className="mb-4 text-2xl font-bold text-white">
                    Примеры выступлений
                </h2>
                {instructor.performanceVideos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {instructor.performanceVideos.map((url: string) => (
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
                    <VideoPlaceholder />
                )}
            </section>
        </div>
    );
}
