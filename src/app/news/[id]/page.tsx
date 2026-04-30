import Link from 'next/link';
import { headers } from 'next/headers';
import { Header } from '@/components';
import { Footer } from '@/components/layout/footer';
import { ChevronLeft } from 'lucide-react';
import { getNewsById } from '@/lib/db';
import { NewsArticle } from '@/components/sections/news/news-article';
import notFound from './not-found';

interface WikiTermPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WikiTermPageProps) {
    const { id } = await params;
    const newsId = Number(decodeURIComponent(id));
    const news = getNewsById(newsId);
    
    if (!news) {
        return {
            title: 'Новость не найдена | Звучи',
            description: 'Запрашиваемая новость не найдена',
        };
    }

    return {
        title: `${news.title} | Звучи - Вокальная студия`,
        description: news.summary || news.content.substring(0, 160),
        openGraph: {
            title: news.title,
            description: news.summary || news.content.substring(0, 160),
            type: 'article',
            publishedTime: news.published_at,
            images: news.cover_url ? [{ url: news.cover_url }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: news.title,
            description: news.summary || news.content.substring(0, 160),
            images: news.cover_url ? [news.cover_url] : [],
        },
    };
}

export default async function NewsArticlePage({ params }: WikiTermPageProps) {
    const { id } = await params;
    const newsId = Number(decodeURIComponent(id));
    const news = getNewsById(newsId);
    if (!news) notFound();

    const headersList = await headers();
    const isAuthorized = !!headersList.get('Authorization');

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <section className="relative main-bg min-h-screen py-12 text-white">
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative z-10 container mx-auto px-4">
                        <Link
                            href="/"
                            className="mb-6 inline-flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Назад
                        </Link>

                        <div className="mx-auto max-w-4xl rounded-sm">
                            {news && (
                                <NewsArticle 
                                  post={news}
                                  isAuthorized={isAuthorized}
                            />)}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
