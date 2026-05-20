'use client'

import { useState } from 'react'
import Link from 'next/link'
import { registerUser } from '@/app/actions/auth'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Пароли не совпадают')
            return
        }

        setLoading(true)
        try {
            const result = await registerUser({ email, password })
            if (result.success) {
                setSuccess(true)
            } else {
                setError(result.error ?? 'Ошибка регистрации')
            }
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
                <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl text-center">
                    <h1 className="mb-4 text-2xl font-bold text-white">Почти готово!</h1>
                    <p className="text-white/70 mb-6">
                        Проверьте почту для подтверждения аккаунта. Мы отправили письмо на{' '}
                        <span className="text-purple-400">{email}</span>.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-700"
                    >
                        Войти
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl"
            >
                <h1 className="mb-6 text-2xl font-bold text-white">Регистрация</h1>

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

                <div className="mb-4">
                    <label htmlFor="password" className="mb-1 block text-sm text-white/70">
                        Пароль
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-xs text-white/40">Минимум 8 символов</p>
                </div>

                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="mb-1 block text-sm text-white/70">
                        Повторите пароль
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                    />
                </div>

                {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-purple-600 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>

                <p className="mt-4 text-center text-sm text-white/50">
                    Уже есть аккаунт?{' '}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300">
                        Войти
                    </Link>
                </p>
            </form>
        </div>
    )
}
