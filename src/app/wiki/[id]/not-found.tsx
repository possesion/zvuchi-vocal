import Link from "next/link";
import { Header } from "@/components";
import { Footer } from "@/components/layout/footer";
import { ChevronLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <section className="main-bg py-12 text-white">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="mb-4 text-6xl font-bold">404</h1>
                            <h2 className="mb-6 text-3xl font-bold">
                                Термин не найден
                            </h2>
                            <p className="mb-8 text-lg text-gray-300">
                                К сожалению, запрашиваемый термин не существует в нашем глоссарии.
                            </p>
                            <Link
                                href="/wiki"
                                className="inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3 font-bold text-white transition-all hover:bg-brand/90"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Вернуться к глоссарию
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
