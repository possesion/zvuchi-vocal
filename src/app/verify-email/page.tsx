import Link from 'next/link'
import { verifyEmail } from '@/app/actions/auth'

interface Props {
    searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
    const { token } = await searchParams
    const result = await verifyEmail(token ?? '')

    if (result.success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
                <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl text-center">
                    <h1 className="mb-4 text-2xl font-bold text-white">Email подтверждён!</h1>
                    <p className="text-white/70 mb-6">
                        Ваш email успешно подтверждён. Теперь вы можете войти в аккаунт.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-700"
                    >
                        Войти в аккаунт
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
            <div className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 shadow-xl text-center">
                <h1 className="mb-4 text-2xl font-bold text-white">Ссылка недействительна</h1>
                <p className="text-white/70 mb-6">
                    {result.error ?? 'Ссылка для подтверждения устарела или уже была использована.'}
                </p>
                <Link
                    href="/resend-verification"
                    className="inline-block rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-700"
                >
                    Отправить письмо повторно
                </Link>
            </div>
        </div>
    )
}
