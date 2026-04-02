'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password }),
            })

            if (res.ok) {
                router.push('/gallery')
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.error ?? 'Ошибка входа')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl"
            >
                <h1 className="mb-6 text-2xl font-bold text-white">Вход</h1>

                <div className="mb-4">
                    <label htmlFor="login" className="mb-1 block text-sm text-white/70">
                        Логин
                    </label>
                    <input
                        id="login"
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                        autoComplete="username"
                        className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="mb-1 block text-sm text-white/70">
                        Пароль
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500"
                    />
                </div>

                {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-purple-600 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    )
}
