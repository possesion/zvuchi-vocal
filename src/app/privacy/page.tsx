import { readFile } from 'fs/promises';
import path from 'path';
import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
    title: 'Политика конфиденциальности',
    description:
        'Политика в отношении обработки персональных данных вокальной студии ЗВУЧИ.',
    path: '/privacy',
    keywords: [
        'политика конфиденциальности',
        'обработка персональных данных',
        'защита данных',
    ],
});

async function getPrivacyText(): Promise<string> {
    // Читаем текст политики из public/documents, так как это статический документ
    const filePath = path.join(process.cwd(), 'public', 'documents', 'privacy.txt');
    return readFile(filePath, 'utf-8');
}

export default async function PrivacyPage() {
    const privacyText = await getPrivacyText();

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <div className="primary-bg py-12">
                    <section className="container mx-auto text-white">
                        <header className="mb-12 text-center">
                            <h1 className="mb-6 text-3xl font-bold tracking-tight text-shadow-lg md:text-4xl xl:text-5xl">
                                Политика конфиденциальности
                            </h1>
                        </header>

                        <article className="mx-auto max-w-4xl rounded-sm bg-white p-6 text-black md:p-10">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
                                {privacyText}
                            </pre>
                        </article>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
