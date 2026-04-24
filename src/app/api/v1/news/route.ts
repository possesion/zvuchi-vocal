import { NextRequest, NextResponse } from 'next/server';
import { getLatestNews, createNews, deleteNews, getNewsById, updateNews } from '@/lib/db';
import { apiOk, apiError } from '@/lib/api-response';

export async function GET() {
    return apiOk({ news: getLatestNews(5) });
}

export async function POST(req: NextRequest) {
    const { title, summary, content, cover_url, published_at } = await req.json();
    if (!title || !summary || !content) {
        return apiError('title, summary, content required', 400);
    }
    const post = createNews({
        title,
        summary,
        content,
        cover_url: cover_url ?? '',
        published_at: published_at ?? new Date().toISOString(),
    });
    return NextResponse.json(post, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    const { id, title, summary, content, cover_url, published_at } = await req.json();
    if (!id) return apiError('id required', 400);
    const existing = getNewsById(Number(id));
    if (!existing) return apiError('Not found', 404);

    const updated = updateNews({
        ...existing,
        title: title ?? existing.title,
        summary: summary ?? existing.summary,
        content: content ?? existing.content,
        cover_url: cover_url ?? existing.cover_url,
        published_at: published_at ?? existing.published_at,
    });
    return apiOk(updated);
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    if (!id) return apiError('id required', 400);
    deleteNews(Number(id));
    return apiOk({ success: true });
}
