import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Header } from "@/components";
import { Footer } from "@/components/layout/footer";
import { glossaryTerms, categoryLabels, GlossaryTerm } from "../glossary-data";
import { ChevronLeft } from "lucide-react";
import { TermEditor } from "./term-editor";
import { getTermOverride } from "@/lib/db";

interface WikiTermPageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    return glossaryTerms.map((term) => ({
        id: term.id,
    }));
}

export async function generateMetadata({ params }: WikiTermPageProps) {
    const { id } = await params;
    const term = glossaryTerms.find((t) => t.id === id);
    
    if (!term) {
        return { title: 'Термин не найден' };
    }

    return {
        title: `${term.title} | Звучи`,
        description: term.description,
    };
}

export default async function WikiTermPage({ params }: WikiTermPageProps) {
    const { id } = await params;
    const term = glossaryTerms.find((t) => t.id === id);

    if (!term) {
        notFound();
    }

    const headersList = await headers();
    const isAuthorized = !!headersList.get('Authorization');

    // Подтягиваем override из БД если есть
    const override = getTermOverride(id);
    const author = override?.author ?? '';
    const displayTerm: GlossaryTerm = override
        ? { ...term, title: override.title, description: override.description, category: override.category as GlossaryTerm['category'] }
        : term;

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <section className="relative main-bg min-h-screen py-12 text-white">
                    {/* Overlay для затемнения фона */}
                    <div className="absolute inset-0 bg-black/50" />
                    
                    {/* Контент поверх overlay */}
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
                                    <TermEditor term={{ ...displayTerm, author }} />
                                </div>
                            )}
                            <article className="rounded-sm bg-white/10 backdrop-blur-sm p-8 md:p-12">
                                <div className="mb-6 flex items-center gap-3">
                                    <span className="rounded-full bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide">
                                        {categoryLabels[displayTerm.category]}
                                    </span>
                                </div>
                                
                                <h1 className="mb-6 text-3xl font-bold text-white md:text-5xl">
                                    {displayTerm.title}
                                </h1>
                                
                                <div className="prose prose-invert prose-lg max-w-none">
                                    <p className="leading-relaxed whitespace-pre-wrap text-gray-200">
                                        {displayTerm.description}
                                    </p>
                                </div>

                                {author && (
                                    <p className="mt-6 text-sm text-gray-400">
                                        Автор: {' '}
                                        <Link
                                            href="/instructors"
                                            className="text-gray-200 font-medium hover:text-brand transition-colors"
                                        >
                                            {author}
                                        </Link>
                                    </p>
                                )}
                            </article>

                            <div className="mt-8">
                                <h2 className="mb-4 text-xl font-bold text-white">
                                    Другие термины
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {glossaryTerms
                                        .filter((t) => t.id !== term.id)
                                        .slice(0, 4)
                                        .map((relatedTerm) => (
                                            <Link
                                                key={relatedTerm.id}
                                                href={`/wiki/${relatedTerm.id}`}
                                                className="group rounded-sm bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/15 hover:shadow-lg"
                                            >
                                                <span className="mb-2 inline-block rounded-full bg-brand/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                                                    {categoryLabels[relatedTerm.category]}
                                                </span>
                                                <h3 className="text-lg font-bold text-white group-hover:text-brand transition-colors">
                                                    {relatedTerm.title}
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
