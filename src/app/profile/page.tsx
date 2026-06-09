import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { auth } from '@/auth';
import { generatePageMetadata } from '@/lib/metadata';
import { User, ShieldCheck, CheckCircle, XCircle, BookOpenText } from 'lucide-react';
import { ProfileEditForm } from '../../components/forms/profile-edit-form';
import { getUserById } from '@/lib/db-prisma';
import { ROLE_LABELS } from '@/lib/roles';
import { ClientBalance } from '@/components/sections/client-balance';
import { PhoneVerification } from '@/components/sections/profile/phone-verification';

export const metadata: Metadata = generatePageMetadata({
    title: 'Профиль',
    description: 'Профиль пользователя',
    path: '/profile',
});

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const { user } = session;

    // Получаем полные данные пользователя из БД
    const userId = parseInt(user.id);
    const dbUser = await getUserById(userId);

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <section className="relative z-10 py-12 text-white min-h-[calc(100vh-80px)]">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl">
                            <header className="mb-8">
                                <h1 className="mb-4 text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl">
                                    Профиль
                                </h1>
                                <p className="text-lg text-white/70">
                                    Информация о вашем аккаунте
                                </p>
                            </header>

                            <div className="space-y-6">
                                <div className="rounded-sm bg-white/10 p-6 backdrop-blur-md">
                                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                                        <User className="h-6 w-6 text-white" />
                                        Основная информация
                                    </h2>
                                    <div className="space-y-4">
                                        {user.role && user.role !== 'client' && (
                                            <div className="flex items-start justify-between border-b border-white/10 pb-7 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white/70">Роль:</span>
                                                </div>
                                                <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase">
                                                    {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <ProfileEditForm
                                        currentName={dbUser?.name}
                                        currentPhone={dbUser?.phone}
                                        email={user.email}
                                    />
                                </div>

                                <div className="rounded-sm bg-white/10 p-6 backdrop-blur-md">
                                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                                        <BookOpenText className="h-6 w-6 text-white" />
                                        Моё обучение
                                    </h2>
                                    <ClientBalance phoneVerified={dbUser?.phoneVerified === true} />
                                </div>

                                {/* Статус верификации */}
                                <div className="rounded-sm bg-white/10 p-6 backdrop-blur-md">
                                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                                        <ShieldCheck className="h-6 w-6 text-white" />
                                        Статус аккаунта
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/70">Email подтверждён:</span>
                                            {dbUser?.emailVerified ? (
                                                <div className="flex items-center gap-2 text-green-400">
                                                    <CheckCircle className="h-5 w-5" />
                                                    <span className="font-medium">Да</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-yellow-400">
                                                    <XCircle className="h-5 w-5" />
                                                    <span className="font-medium">Нет</span>
                                                </div>
                                            )}
                                        </div>
                                        {dbUser?.phone && dbUser.phone !== null && (
                                           <PhoneVerification phone={dbUser.phone} phoneVerified={dbUser.phoneVerified} />
                                        )}
                                    </div>
                                </div>

                                {/* Debug информация (только для админов) */}
                                {user.role === 'admin' && (
                                    <details className="rounded-sm bg-white/5 p-6 backdrop-blur-md">
                                        <summary className="cursor-pointer text-lg font-bold text-white/70 hover:text-white">
                                            Debug: Полная информация о сессии
                                        </summary>
                                        <pre className="mt-4 overflow-x-auto rounded bg-black/50 p-4 text-xs text-white/70">
                                            {JSON.stringify(session, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
