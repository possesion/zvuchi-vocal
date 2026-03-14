import Link from "next/link";
import { Header } from "@/components";
import { Footer } from "@/components/layout/footer";
import { glossaryTerms, categoryLabels } from "./glossary-data";
import { ChevronRight } from "lucide-react";

export default function WikiPage() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <section className="relative min-h-screen main-bg py-12 text-white">
                    {/* Overlay для затемнения фона */}
                    <div className="absolute inset-0 bg-black/50" />
                    
                    {/* Контент поверх overlay */}
                    <div className="relative z-10">
                        <header className="container mb-12 flex flex-col items-center">
                            <div className="w-full flex flex-col justify-center items-center bg-dark px-6 py-4 rounded-sm opacity-85">
                                <h1 className="text-4xl font-bold tracking-tight text-shadow-lg md:text-5xl xl:text-7xl">
                                    Про<br />
                                    <span className="ml-5">вокал</span>
                                </h1>
                            </div>
                        </header>
                        
                        <div className="container mx-auto mt-8 px-4">
                            <div className="mx-auto max-w-4xl">
                                {/* <p className="mb-8 text-center text-lg text-gray-200 md:text-xl">
                                    База вокальных техник и методик
                                </p> */}
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                    {glossaryTerms.map((term) => (
                                        <Link
                                            key={term.id}
                                            href={`/wiki/${term.id}`}
                                            className="group rounded-sm bg-white/10 backdrop-blur-sm p-6 transition-all hover:bg-white/15 hover:shadow-lg hover:scale-[1.02]"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                                                    {categoryLabels[term.category]}
                                                </span>
                                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white md:text-2xl">
                                                {term.title}
                                            </h2>
                                            <p className="mt-2 line-clamp-2 text-sm text-gray-300">
                                                {term.description}
                                            </p>
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
