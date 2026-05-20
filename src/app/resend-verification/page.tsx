'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resendVerification } from '@/app/actions/auth'

export default function ResendVerificationPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await resendVerification(email)
            if (result.success) {
                setStatus('success')
            } else {
                setError(result.error ?? 'Произошла ошибка. Попробуйте позже.')
                setStatus('error')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
            <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl">
                <h1 className="mb-2 text-2xl font-bold text-white">Повторная отправка</h1>
                <p className="mb-6 text-sm text-white/50">
                    Введите email, на который вы регистрировались, и мы отправим новую ссылку подтверждения.
                </p>

                {status === 'success' ? (
                    <div className="space-y-4">
                        <p className="rounded-md bg-green-900/40 px-4 py-3 text-sm text-green-400">
                            Письмо отправлено. Проверьте почту и перейдите по ссылке для подтверждения.
                        </p>
                        <Link
                            href="/login"
                            className="block w-full rounded-md bg-purple-600 py-2 text-center font-medium text-white transition-colors hover:bg-purple-700"
                        >
                            Войти
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="mb-1 block text-sm text-white/70">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                            />
                        </div>

                        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-purple-600 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Отправка...' : 'Отправить письмо'}
                        </button>

                        <p className="mt-4 text-center text-sm text-white/50">
                            Вспомнили пароль?{' '}
                            <Link href="/login" className="text-purple-400 hover:text-purple-300">
                                Войти
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
