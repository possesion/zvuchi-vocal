'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css/navigation';
import type { NewsRow } from '@/lib/db';
import { NewsCard } from './news-card';
import { NewsModal } from './news-modal';

interface NewsFeedProps {
    posts: NewsRow[];
    isAuthorized?: boolean;
}

export function NewsFeed({ posts, isAuthorized = false }: NewsFeedProps) {
    const router = useRouter();
    const [activePost, setActivePost] = useState<NewsRow | null>(null);
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
                <h2 className="mb-8 text-2xl font-bold md:text-3xl">Новости и мероприятия</h2>
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={50}
                    slidesPerView="auto"
                    navigation
                    scrollbar={{ draggable: true }}
                    breakpoints={{
                        320: { slidesPerView: 1 },
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {posts.map((post) => (
                        <SwiperSlide className="relative flex-shrink-0 w-full aspect-[4/4] rounded-sm overflow-auto" key={post.id}>
                            <NewsCard
                                post={post}
                                onOpen={setActivePost}
                                isAuthorized={isAuthorized}
                                onDelete={setDeleteTarget}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {activePost && (
                <NewsModal
                    post={activePost}
                    onClose={() => setActivePost(null)}
                    isAuthorized={isAuthorized}
                />
            )}

            {deleteTarget !== null && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70">
                    <div className="mx-4 w-full max-w-sm rounded-lg bg-zinc-900 p-6 text-white shadow-xl">
                        <p className="mb-2 text-lg font-semibold">Удалить новость?</p>
                        <p className="mb-6 text-sm text-white/60">Это действие нельзя отменить.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-sm px-4 py-2 text-sm text-white/70 hover:text-white">
                                Отмена
                            </button>
                            <button onClick={confirmDelete} disabled={deleting} className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
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
