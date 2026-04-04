'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css';
import { SHORTS } from '@/app/constants';

const breakpoints = {
    320: { slidesPerView: 1 },
    640: { slidesPerView: 3 },
    1024: { slidesPerView: 4 },
};

export const Shorts = ({ isAuthorized = false }: { isAuthorized?: boolean }) => {
    const [urls, setUrls] = useState<string[]>(SHORTS);
    const [input, setInput] = useState('');
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetch('/api/v1/shorts')
            .then((r) => r.json())
            .then(({ urls: fetched }) => { if (fetched?.length) setUrls(fetched); })
            .catch(() => {});
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setAdding(true);
        try {
            await fetch('/api/v1/shorts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'authorized' },
                body: JSON.stringify({ url: input.trim() }),
            });
            setUrls((prev) => [input.trim(), ...prev]);
            setInput('');
            setShowForm(false);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await fetch('/api/v1/shorts', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: 'authorized' },
                body: JSON.stringify({ url: deleteTarget }),
            });
            setUrls((prev) => prev.filter((u) => u !== deleteTarget));
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="relative pt-16 lg:pt-32">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-xl font-semibold text-white/90 md:text-2xl">
                    Музыкальные распевки и отзывы
                </p>
                {isAuthorized && (
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                    >
                        {showForm ? 'Отмена' : '+ Добавить видео'}
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="mb-6 flex gap-2">
                    <input
                        type="url"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ссылка на видео (RuTube embed)"
                        required
                        className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        disabled={adding}
                        className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                    >
                        {adding ? '...' : 'Добавить'}
                    </button>
                </form>
            )}

            <div className="flex justify-center items-center gap-3">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={50}
                    slidesPerView={3}
                    navigation
                    breakpoints={breakpoints}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                >
                    {urls.map((shortUrl, index) => (
                        <SwiperSlide
                            key={shortUrl}
                            className="relative flex-shrink-0 w-full aspect-[9/16] bg-gray-800 rounded-sm"
                        >
                            <iframe
                                src={shortUrl}
                                className="w-full h-full rounded-sm border-none"
                                allow="clipboard-write"
                                allowFullScreen
                                loading="lazy"
                                title={`RuTube Short ${index + 1}`}
                            />
                            {isAuthorized && (
                                <button
                                    onClick={() => setDeleteTarget(shortUrl)}
                                    className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
                                    aria-label="Удалить видео"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
                    <div className="mx-4 w-full max-w-sm rounded-lg bg-zinc-900 p-6 text-white shadow-xl">
                        <p className="mb-2 text-lg font-semibold">Удалить видео?</p>
                        <p className="mb-6 text-sm text-white/60">Это действие нельзя отменить.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="rounded-md px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
