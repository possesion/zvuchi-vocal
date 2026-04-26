'use client';

import Image from 'next/image';
import { Calendar, ArrowRight, Trash2, Eye } from 'lucide-react';
import type { NewsRow } from '@/lib/db';
import { formatNewsDate } from './news.utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NewsCardProps {
    post: NewsRow;
    onOpen: (post: NewsRow) => void;
    isAuthorized: boolean;
    onDelete: (id: number) => void;
}

export function NewsCard({ post, onOpen, isAuthorized, onDelete }: NewsCardProps) {
    return (
        <article className="relative w-full h-full flex flex-col rounded-sm bg-white/10 backdrop-blur-sm overflow-hidden transition-all hover:bg-white/15 hover:shadow-lg">
            {isAuthorized && (
                <div className="absolute right-2 top-2 z-10 flex gap-1">
                    <button
                        onClick={() => onDelete(post.id)}
                        className="rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
                        aria-label="Удалить новость"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
            <div
                className="relative h-70 bg-white/5"
            >
                {post.cover_url
                    ? <Image
                        src={post.cover_url}
                        alt={post.title}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    : <div className="flex h-full items-center justify-center text-white/20 text-4xl select-none">🎤</div>
                }
            </div>
            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-white/50">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatNewsDate(post.published_at)}
                </div>
                <h3 className="mb-2 text-base font-bold text-white leading-snug">{post.title}</h3>
                <p className="mb-4 flex-1 text-sm text-white/70 line-clamp-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.summary}</ReactMarkdown>
                </p>
                <section className='flex items-center justify-between'>
                    <button
                        onClick={() => onOpen(post)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand/80"
                    >
                        Читать дальше <ArrowRight className="h-4 w-4" />
                    </button>
                    <span className="inline-flex items-center gap-1 text-xs text-white/40">
                        <Eye className="h-3.5 w-3.5" />
                        {post.views ?? 0}
                    </span>
                </section>
            </div>
        </article>
    );
}
