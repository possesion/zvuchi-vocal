'use client';

import Image from 'next/image';
import { X, Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { NewsRow } from '@/lib/db';
import { formatNewsDate } from './news.utils';

interface NewsModalProps {
    post: NewsRow;
    onClose: () => void;
}

export function NewsModal({ post, onClose }: NewsModalProps) {
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
                    <div className="relative h-[50lvh] w-full">
                        <Image src={post.cover_url} alt={post.title} fill className="object-cover object-top rounded-t-sm" />
                    </div>
                )}
                <div className="p-6 md:p-8">
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-white/50">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatNewsDate(post.published_at)}
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
