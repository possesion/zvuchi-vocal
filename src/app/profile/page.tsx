import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { auth } from '@/auth';
import { generatePageMetadata } from '@/lib/metadata';
import { User, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';
import { NameEditForm } from './name-edit-form';
import { getUserById } from '@/lib/db-prisma';

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

    const roleLabels: Record<string, string> = {
        admin: 'Администратор',
        manager: 'Менеджер',
        client: 'Клиент',
    };

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <section className="py-12 text-white min-h-[calc(100vh-80px)]">
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
                                {/* Основная информация */}
                                <div className="rounded-sm bg-white/10 p-6 backdrop-blur-md">
                                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                                        <User className="h-6 w-6 text-brand" />
                                        Основная информация
                                    </h2>
                                    <div className="space-y-4">
                                        {user.id && (
                                            <div className="flex items-start justify-between">
                                                <span className="pl-1 text-white/70">ID:</span>
                                                <span className="font-mono text-sm text-white/50">{user.id}</span>
                                            </div>
                                        )}
                                        <div className="flex items-start justify-between border-b border-white/10 pb-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-5 w-5 text-white/50" />
                                                <span className="text-white/70">Имя:</span>
                                            </div>
                                            <NameEditForm currentName={dbUser?.name} />
                                        </div>
                                        <div className="flex items-start justify-between border-b border-white/10 pb-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-5 w-5 text-white/50" />
                                                <span className="text-white/70">Email:</span>
                                            </div>
                                            <span className="font-medium">{user.email}</span>
                                        </div>

                                        

                                        {user.role && user.role !== 'client' && (
                                            <div className="flex items-start justify-between border-b border-white/10 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-5 w-5 text-white/50" />
                                                    <span className="text-white/70">Роль:</span>
                                                </div>
                                                <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase">
                                                    {roleLabels[user.role] || user.role}
                                                </span>
                                            </div>
                                        )}

                                        
                                    </div>
                                </div>

                                {/* Статус верификации */}
                                <div className="rounded-sm bg-white/10 p-6 backdrop-blur-md">
                                    <h2 className="mb-4 text-2xl font-bold">Статус аккаунта</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/70">Email подтверждён:</span>
                                            {dbUser?.email_verified === 1 ? (
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
