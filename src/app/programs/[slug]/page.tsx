import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getProgramBySlug } from '@/lib/db-prisma';
import { generatePageMetadata } from '@/lib/metadata';
import { auth } from '@/auth';
import { canEdit } from '@/lib/roles';
import { ProgramEditForm } from './program-edit-form';
import { ProgramPricingTabs } from './program-pricing-tabs';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, Calendar } from 'lucide-react';
import { WikiCta } from '@/components/wiki/wiki-cta';

interface ProgramPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
    const { slug } = await params;
    const program = await getProgramBySlug(slug);

    if (!program) {
        return {
            title: 'Программа не найдена',
        };
    }

    return generatePageMetadata({
        title: program.title,
        description: program.short_description,
        path: `/programs/${slug}`,
    });
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
    const { slug } = await params;
    const program = await getProgramBySlug(slug);

    if (!program) {
        notFound();
    }

    const session = await auth();
    const isAuthorized = canEdit(session?.user?.role);

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 overflow-x-hidden">
                <section className="relative main-bg py-12 text-white">
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 container mx-auto px-4">
                        <Link
                            href="/programs"
                            className="inline-flex items-center gap-2 mb-8 text-white/70 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Назад к абонементам
                        </Link>

                        <article className="max-w-4xl mx-auto">
                            {isAuthorized && <ProgramEditForm program={program} />}
                            
                            <header className="mb-8">
                                <h1 className="mb-4 text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl">
                                    {program.title}
                                </h1>
                                <p className="text-xl text-white/80">
                                    {program.short_description}
                                </p>
                            </header>

                            <div className="grid gap-8 md:grid-cols-2 mb-8">
                                <div className="rounded-sm bg-white/10 p-6 backdrop-blur-md">
                                    <h2 className="text-2xl font-bold mb-6">Пакет и Стоимость</h2>
                                    <ProgramPricingTabs packages={program.packages} />
                                    <div className="mt-6 space-y-2 text-sm text-white/70">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-brand" />
                                            <span>Длительность урока: {program.lesson_duration} мин</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-brand" />
                                            <span>Срок действия: {program.program_duration} дней</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-sm bg-white/10 p-6 backdrop-blur-md">
                                    <h2 className="text-2xl font-bold mb-4">Включено</h2>
                                    <ul className="space-y-3">
                                        {program.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-brand mt-0.5 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {program.full_description && (
                                <div className="rounded-sm bg-white/10 p-6 backdrop-blur-md mb-8">
                                    <h2 className="text-2xl font-bold mb-4">Описание</h2>
                                    <div className="prose prose-invert max-w-none text-white/80">
                                        <p className="whitespace-pre-line">{program.full_description}</p>
                                    </div>
                                </div>
                            )}
                            <WikiCta category='program' />
                        </article>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
