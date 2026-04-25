export const newsInputCls = 'w-full rounded-sm bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-purple-500';

export function formatNewsDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}
