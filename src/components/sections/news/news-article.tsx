'use client';

import Image from 'next/image';
import { Calendar, Eye, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NewsRow } from '@/lib/db';
import { formatNewsDate } from './news.utils';
import { NewsEditForm } from './news-edit-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NewsModalProps {
    post: NewsRow;
    isAuthorized?: boolean;
}

export function NewsArticle({ post, isAuthorized = false }: NewsModalProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetch(`/api/v1/news/${post.id}/view`, { method: 'POST' })
            .catch((error) => {
                console.error('Ошибка при увеличении счетчика просмотров: ', error?.message)
            });
    }, [post.id]);

    return (
        <div
            className="relative w-full max-w-4xl pt-6 rounded-sm bg-zinc-900/90 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="absolute right-3 top-3 z-10 flex gap-1">
                {isAuthorized && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                        aria-label="Редактировать"
                    >
                        <Pencil className="h-5 w-5" />
                    </button>

                )}
            </div>

            {isEditing ? (
                <div className="p-6">
                    <NewsEditForm
                        post={post}
                        onSaved={() => { setIsEditing(false); router.refresh(); }}
                        onCancel={() => setIsEditing(false)}
                    />
                </div>
            ) : (
                <>
                    {post.cover_url && (
                        <div className="relative h-60 sm:h-[50lvh] w-full">
                            <Image
                                src={post.cover_url}
                                alt={post.title}
                                fill
                                className="px-3 object-cover object-top rounded-t-sm"
                            />
                        </div>
                    )}
                    <div className="p-6 md:p-8">
                        <div className="mb-3 flex justify-end items-center gap-1.5 text-xs text-white/50">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatNewsDate(post.published_at)}

                            <span className="ml-4 inline-flex items-center gap-1 text-xs text-white/40">
                                <Eye className="h-3.5 w-3.5" />
                                {post.views ?? 0}
                            </span>
                        </div>
                        <h2 className="mb-4 text-2xl text-center font-bold">{post.title}</h2>
                        <div className="prose prose-invert prose-md max-w-none text-wrap hyphens-auto text-white/80">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
