'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { LoginSchema, REMEMBER_ME_MAX_AGE, LoginForm } from '@/lib/definitions'

export default function LoginPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
        setError: setFormError,
    } = useForm<LoginForm>({
        resolver: yupResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    })

    const rememberMe = watch('rememberMe')

    const onSubmit = async (data: LoginForm) => {
        try {
            const authResult = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
                ...(data.rememberMe && { maxAge: REMEMBER_ME_MAX_AGE }),
            })

            if (authResult?.error) {
                setFormError('root', {
                    message:
                        authResult.error === 'EmailNotVerified'
                            ? `Подтвердите email. Письмо отправлено на ${data.email}`
                            : authResult.error === 'UseGoogle'
                            ? 'Этот аккаунт зарегистрирован через Google. Войдите через Google.'
                            : 'Неверный email или пароль',
                })
            } else if (authResult?.ok) {
                router.push('/profile')
            }
        } catch {
            setFormError('root', { message: 'Произошла ошибка. Попробуйте позже.' })
        }
    }

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/profile' })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
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

                <div className="mb-4">
                    <label htmlFor="password" className="mb-1 block text-sm text-white/70">
                        Пароль
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
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
                </div>

                <div className="mb-6 flex items-center gap-2">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setValue('rememberMe', e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-zinc-800 accent-purple-500"
                    />
                    <label htmlFor="rememberMe" className="cursor-pointer select-none text-sm text-white/70">
                        Запомнить меня
                    </label>
                </div>

                {errors.root && (
                    <p role="alert" className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
                        {errors.root.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer w-full rounded-md bg-purple-600 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Вход...' : 'Войти'}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-zinc-900 px-2 text-white/40">или</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-300"
                >
                    <Image
                        src="/socials/google.svg"
                        alt=""
                        aria-hidden="true"
                        width={18}
                        height={18}
                    />
                    Войти через Google
                </button>

                <p className="mt-4 text-center text-sm text-white/50">
                    <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300">
                        Забыли пароль?
                    </Link>
                </p>

                <p className="mt-2 text-center text-sm text-white/50">
                    Нет аккаунта?{' '}
                    <Link href="/register" className="text-purple-400 hover:text-purple-300">
                        Зарегистрироваться
                    </Link>
                </p>
            </form>
        </div>
    )
}
