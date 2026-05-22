'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { validate } from './utils'

const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30 // 30 дней

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const validationError = validate(email, password)
        if (validationError) {
            setError(validationError)
            return
        }

        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                ...(rememberMe && { maxAge: REMEMBER_ME_MAX_AGE }),
            })

            if (result?.ok) {
                router.push('/')
            } else {
                setError(
                    result?.error === 'EmailNotVerified'
                        ? `Подтвердите email. Письмо отправлено на ${email}`
                        : 'Неверный email или пароль'
                )
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
            <form
                onSubmit={handleSubmit}
                noValidate
                className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl"
            >
                <h1 className="mb-6 text-2xl font-bold text-white">Вход</h1>

                <div className="mb-4">
                    <label htmlFor="email" className="mb-1 block text-sm text-white/70">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError('') }}
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
                        onChange={(e) => { setPassword(e.target.value); setError('') }}
                        autoComplete="current-password"
                        className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                    />
                </div>

                <div className="mb-6 flex items-center gap-2">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-zinc-800 accent-purple-500"
                    />
                    <label htmlFor="rememberMe" className="cursor-pointer select-none text-sm text-white/70">
                        Запомнить меня
                    </label>
                </div>

                {error && (
                    <p role="alert" className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-purple-600 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>

                <p className="mt-4 text-center text-sm text-white/50">
                    Нет аккаунта?{' '}
                    <Link href="/register" className="text-purple-400 hover:text-purple-300">
                        Зарегистрироваться
                    </Link>
                </p>
            </form>
        </div>
    )
}
