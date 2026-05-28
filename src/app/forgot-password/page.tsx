'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ForgotPasswordSchema, ForgotPasswordForm } from '@/lib/definitions'
import { requestPasswordReset } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
    const [success, setSuccess] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError: setFormError,
    } = useForm<ForgotPasswordForm>({
        resolver: yupResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (data: ForgotPasswordForm) => {
        const result = await requestPasswordReset(data.email)
        
        if (result.success) {
            setSubmittedEmail(data.email)
            setSuccess(true)
        } else {
            setFormError('root', { message: result.error ?? 'Ошибка при отправке письма' })
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
                <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl text-center">
                    <h1 className="mb-4 text-2xl font-bold text-white">Письмо отправлено</h1>
                    <p className="text-white/70 mb-6">
                        Если аккаунт с email{' '}
                        <span className="text-purple-400">{submittedEmail}</span> существует,
                        вы получите письмо с инструкциями по восстановлению пароля.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-700"
                    >
                        Вернуться к входу
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
                <h1 className="mb-2 text-2xl font-bold text-white">Восстановление пароля</h1>
                <p className="mb-6 text-sm text-white/60">
                    Введите email, указанный при регистрации. Мы отправим ссылку для восстановления пароля.
                </p>

                <div className="mb-4">
                    <label htmlFor="email" className="mb-1 block text-sm text-white/70">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ${
                            errors.email ? 'ring-red-500' : 'ring-white/10 focus:ring-purple-500'
                        }`}
                        {...register('email')}
                    />
                    {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-400">
                            {errors.email.message}
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
                    {isSubmitting ? 'Отправка...' : 'Отправить ссылку'}
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
