import type { ContestResult } from '@/lib/types';

/**
 * Возвращает всех участников с максимальным количеством голосов.
 * Если максимум равен 0 (нет голосов) или список участников пуст, возвращает пустой массив.
 */
export function getWinners(results: ContestResult[]): ContestResult[] {
    if (results.length === 0) return [];
    const maxVotes = Math.max(...results.map((c) => c.votes));
    if (maxVotes === 0) return [];
    return results.filter((c) => c.votes === maxVotes);
}
