'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Trophy } from 'lucide-react';
import { ContestPieChart } from '@/components/contest/contest-pie-chart';

interface Contestant {
    id: number;
    name: string;
    song: string;
    votes: number;
    photo?: string;
}

export default function ContestResultPage() {
    const [contestants, setContestants] = useState<Contestant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await fetch('/api/contest');
            const data = await response.json();
            setContestants(data.contestants);
        } catch (error) {
            console.error('Ошибка загрузки результатов:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);

    // Находим победителя
    const winner = contestants.reduce((prev, current) =>
        (current.votes > prev.votes) ? current : prev
        , contestants[0] || { id: 0, name: '', song: '', votes: 0 });

    // Данные для pie chart (только участники с голосами)
    const chartData = contestants
        .filter(c => c.votes > 0)
        .map(c => ({
            name: c.name,
            value: c.votes,
            percentage: totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : '0'
        }));

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-950 via-purple-900 to-violet-950">
                <div className="text-2xl font-bold text-white">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-violet-950 px-4 py-24">
                <div className="container mx-auto max-w-6xl">
                    <header className="mb-12 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                            Результаты голосования
                        </h1>
                        {totalVotes > 0 && (
                            <p className="text-lg text-white/80">
                                Всего голосов: {totalVotes}
                            </p>
                        )}
                    </header>

                    {/* Победитель */}
                    {winner && winner.votes > 0 && (
                        <div className="mb-12 rounded-2xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-2 backdrop-blur-md">
                            <div className="mb-6 flex items-center justify-center gap-3">
                                <Trophy className="h-10 w-10 text-yellow-400" />
                                <h2 className="text-3xl font-bold text-white">Победитель</h2>
                                <Trophy className="h-10 w-10 text-yellow-400" />
                            </div>

                            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                                {winner.photo && (
                                    <div className="relative h-[200px] w-[200px] flex-shrink-0">
                                        <Image
                                            src={winner.photo}
                                            alt={winner.name}
                                            fill
                                            className="rounded-full object-cover ring-4 ring-yellow-400"
                                        />
                                    </div>
                                )}

                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="mb-3 text-3xl font-bold text-white">
                                        {winner.name}
                                    </h3>
                                    <p className="mb-4 text-xl text-white/90">{winner.song}</p>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
                                        <span className="text-2xl font-bold text-yellow-400">
                                            {winner.votes}
                                        </span>
                                        <span className="text-lg text-white">
                                            {winner.votes === 1 ? 'голос' : 'голосов'}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-lg text-white/80">
                                        {((winner.votes / totalVotes) * 100).toFixed(1)}% от всех голосов
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pie Chart */}
                    {chartData.length > 0 && (
                        <div className="mb-12">
                            <ContestPieChart data={chartData} />
                        </div>
                    )}

                    {/* Топ-3 */}
                    <div className="mb-12">
                        <h2 className="mb-6 text-center text-2xl font-bold text-white">
                            Топ-3 участников
                        </h2>
                        <div className="grid gap-6 md:grid-cols-3">
                            {contestants
                                .filter(c => c.votes > 0)
                                .sort((a, b) => b.votes - a.votes)
                                .slice(0, 3)
                                .map((contestant, index) => (
                                    <div
                                        key={contestant.id}
                                        className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-4xl font-bold text-yellow-400">
                                                #{index + 1}
                                            </span>
                                            <span className="text-2xl font-bold text-white">
                                                {contestant.votes}
                                            </span>
                                        </div>
                                        {contestant.photo && (
                                            <div className="relative mx-auto mb-4 h-[120px] w-[120px]">
                                                <Image
                                                    src={contestant.photo}
                                                    alt={contestant.name}
                                                    fill
                                                    className="rounded-full object-cover ring-2 ring-white/20"
                                                />
                                            </div>
                                        )}
                                        <h3 className="mb-2 text-center text-lg font-bold text-white">
                                            {contestant.name}
                                        </h3>
                                        <p className="text-center text-sm text-white/70">
                                            {contestant.song}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
