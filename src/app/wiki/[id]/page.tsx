import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Header } from '@/components';
import { Footer } from '@/components/layout/footer';
import { ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TermEditor } from './term-editor';
import { getTermById, getAllTerms, getCategories } from '@/lib/db';

interface WikiTermPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WikiTermPageProps) {
    const { id } = await params;
    const term = getTermById(id);
    if (!term) return { title: 'Термин не найден' };
    return {
        title: `${term.title} | Звучи`,
        description: term.description,
    };
}

export default async function WikiTermPage({ params }: WikiTermPageProps) {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const term = getTermById(decodedId);
    if (!term) notFound();

    const headersList = await headers();
    const isAuthorized = !!headersList.get('Authorization');

    const categories = getCategories();
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.label]));
    const otherTerms = getAllTerms()
        .filter((t) => t.id !== decodedId)
        .slice(0, 4);

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <section className="relative main-bg min-h-screen py-12 text-white">
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative z-10 container mx-auto px-4">
                        <Link
                            href="/wiki"
                            className="mb-8 inline-flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Назад к глоссарию
                        </Link>

                        <div className="mx-auto max-w-4xl">
                            {isAuthorized && (
                                <div className="mb-6">
                                    <TermEditor term={term} categories={categories} />
                                </div>
                            )}
                            <article className="rounded-sm bg-white/10 backdrop-blur-sm p-4 md:p-10">
                                <div className="mb-6 flex items-center gap-3">
                                    <span className="rounded-full bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide">
                                        {categoryMap[term.category] ?? term.category}
                                    </span>
                                </div>
                                <h1 className="mb-6 text-3xl font-bold text-white md:text-5xl">
                                    {term.title}
                                </h1>
                                <div className="prose prose-invert prose-md max-w-none text-wrap hyphens-auto" lang="ru">
                                    <ReactMarkdown>{term.description}</ReactMarkdown>
                                </div>
                                {term.author && (
                                    <p className="mt-6 text-sm text-gray-400">
                                        Автор:{' '}
                                        <Link
                                            href="/instructors"
                                            className="text-gray-200 font-medium hover:text-brand transition-colors"
                                        >
                                            {term.author}
                                        </Link>
                                    </p>
                                )}
                            </article>

                            <div className="mt-8">
                                <h2 className="mb-4 text-xl font-bold text-white">Другие термины</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {otherTerms.map((t) => (
                                        <Link
                                            key={t.id}
                                            href={`/wiki/${t.id}`}
                                            className="group rounded-sm bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/15 hover:shadow-lg"
                                        >
                                            <span className="mb-2 inline-block rounded-full bg-brand/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                                                {categoryMap[t.category] ?? t.category}
                                            </span>
                                            <h3 className="text-lg font-bold text-white group-hover:text-brand transition-colors">
                                                {t.title}
                                            </h3>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
