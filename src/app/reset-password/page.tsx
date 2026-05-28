'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ResetPasswordSchema, ResetPasswordForm } from '@/lib/definitions'
import { resetPassword } from '@/app/actions/auth'

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [success, setSuccess] = useState(false)
    const [invalidToken, setInvalidToken] = useState(false)

    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setInvalidToken(true)
        }
    }, [token])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError: setFormError,
    } = useForm<ResetPasswordForm>({
        resolver: yupResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (data: ResetPasswordForm) => {
        if (!token) {
            setInvalidToken(true)
            return
        }

        const result = await resetPassword(token, data.password)
        
        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } else {
            setFormError('root', { message: result.error ?? 'Ошибка при сбросе пароля' })
        }
    }

    if (invalidToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
                <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl text-center">
                    <h1 className="mb-4 text-2xl font-bold text-white">Неверная ссылка</h1>
                    <p className="text-white/70 mb-6">
                        Ссылка для восстановления пароля недействительна или устарела.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="inline-block rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-700"
                    >
                        Запросить новую ссылку
                    </Link>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
                <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl text-center">
                    <h1 className="mb-4 text-2xl font-bold text-white">Пароль изменён</h1>
                    <p className="text-white/70 mb-6">
                        Ваш пароль успешно изменён. Сейчас вы будете перенаправлены на страницу входа.
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
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl"
            >
                <h1 className="mb-2 text-2xl font-bold text-white">Новый пароль</h1>
                <p className="mb-6 text-sm text-white/60">
                    Введите новый пароль для вашего аккаунта.
                </p>

                <div className="mb-4">
                    <label htmlFor="password" className="mb-1 block text-sm text-white/70">
                        Новый пароль
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        className={`w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ${
                            errors.password ? 'ring-red-500' : 'ring-white/10 focus:ring-purple-500'
                        }`}
                        {...register('password')}
                    />
                    {errors.password && (
                        <p id="password-error" className="mt-1 text-sm text-red-400">
                            {errors.password.message}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-white/40">Минимум 8 символов</p>
                </div>

                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="mb-1 block text-sm text-white/70">
                        Повторите пароль
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                        className={`w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ${
                            errors.confirmPassword ? 'ring-red-500' : 'ring-white/10 focus:ring-purple-500'
                        }`}
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                        <p id="confirmPassword-error" className="mt-1 text-sm text-red-400">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {errors.root && (
                    <p role="alert" className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
                        {errors.root.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-purple-600 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить пароль'}
                </button>

                <p className="mt-4 text-center text-sm text-white/50">
                    Вспомнили пароль?{' '}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300">
                        Войти
                    </Link>
                </p>
            </form>
        </div>
    )
}
