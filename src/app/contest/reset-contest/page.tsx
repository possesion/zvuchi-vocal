'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function ResetContestPage() {
    const [status, setStatus] = useState<'password' | 'resetting' | 'success' | 'error'>('password');
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('resetting');
        setMessage('Сброс результатов голосования...');

        try {
            // Очищаем localStorage
            localStorage.removeItem('hasVoted');

            // Сбрасываем результаты на сервере с паролем
            const response = await fetch('/api/contest-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Результаты голосования успешно сброшены!');

                // Перенаправляем на страницу голосования через 2 секунды
                setTimeout(() => {
                    router.push('/contest');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Неверный пароль или ошибка при сбросе результатов');
            }
        } catch (error) {
            console.error('Error resetting contest:', error);
            setStatus('error');
            setMessage('Произошла ошибка при сбросе результатов');
        }
    };

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-950 via-purple-900 to-violet-950 px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
                    {status === 'password' && (
                        <>
                            <h1 className="mb-6 text-2xl font-bold text-white">
                                Сброс результатов голосования
                            </h1>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Введите пароль"
                                        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 transition-all duration-300 focus:border-violet-500 focus:bg-white/15 focus:ring-2 focus:ring-violet-500/30"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105"
                                >
                                    Сбросить результаты
                                </button>
                            </form>
                        </>
                    )}

                    {status === 'resetting' && (
                        <>
                            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
                            <h1 className="mb-4 text-2xl font-bold text-white">
                                Сброс результатов
                            </h1>
                            <p className="text-white/80">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                                <svg
                                    className="h-10 w-10 text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h1 className="mb-4 text-2xl font-bold text-white">Успешно!</h1>
                            <p className="mb-4 text-white/80">{message}</p>
                            <p className="text-sm text-white/60">
                                Перенаправление на страницу голосования...
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                                <svg
                                    className="h-10 w-10 text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h1 className="mb-4 text-2xl font-bold text-white">Ошибка</h1>
                            <p className="mb-6 text-white/80">{message}</p>
                            <button
                                onClick={() => router.push('/contest')}
                                className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                Вернуться к голосованию
                            </button>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
