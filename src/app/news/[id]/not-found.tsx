import { Header } from "@/components";
import { Footer } from "@/components/layout/footer";

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
                                Новость не найдена
                            </h2>
                            <p className="mb-8 text-lg text-gray-300">
                                К сожалению, запрашиваемая новость не существует.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
