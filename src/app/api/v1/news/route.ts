import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getLatestNews, createNews, deleteNews, getNewsById, updateNews } from '@/lib/db-prisma';
import { apiOk, apiError } from '@/lib/api-response';
import type { ApiResponse } from '@/types/api';
import type { NewsArticle } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<{ news: NewsArticle[] }>>> {
    return apiOk({ news: await getLatestNews(5) });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<NewsArticle>>> {
    const { title, summary, content, cover_url, published_at } = await req.json();
    if (!title || !summary || !content) {
        return apiError('title, summary, content required', 400);
    }
    const post = await createNews({
        title,
        summary,
        content,
        coverUrl: cover_url ?? '',
        publishedAt: published_at ?? new Date().toISOString(),
    });
    return NextResponse.json({ success: true, data: post, timestamp: new Date() }, { status: 201 });
}

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse<NewsArticle>>> {
    const { id, title, summary, content, cover_url, published_at } = await req.json();
    if (!id) return apiError('id required', 400);
    const existing = await getNewsById(Number(id));
    if (!existing) return apiError('Not found', 404);

    const updated = await updateNews({
        ...existing,
        title: title ?? existing.title,
        summary: summary ?? existing.summary,
        content: content ?? existing.content,
        coverUrl: cover_url ?? existing.coverUrl,
        publishedAt: published_at ?? existing.publishedAt,
    });
    revalidatePath('/');
    return apiOk(updated);
}

export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
    const { id } = await req.json();
    if (!id) return apiError('id required', 400);
    await deleteNews(Number(id));
    return apiOk({ success: true });
}
