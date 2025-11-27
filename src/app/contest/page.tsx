'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface Contestant {
  id: number;
  name: string;
  song: string;
  votes: number;
  photo?: string;
}

export default function ContestPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [votingFor, setVotingFor] = useState<number | null>(null);

  useEffect(() => {
    checkVotingStatus();
    fetchResults();
  }, []);

  const checkVotingStatus = async () => {
    try {
      const response = await fetch('/api/contest/check-vote');
      const data = await response.json();
      setHasVoted(data.hasVoted);
    } catch (error) {
      console.error('Ошибка проверки статуса голосования:', error);
    }
  };

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

  const handleVote = async (id: number) => {
    if (hasVoted) return;

    setVotingFor(id);
    try {
      const response = await fetch('/api/contest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId: id }),
      });

      if (response.ok) {
        setHasVoted(true);
        await fetchResults();
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Ошибка голосования:', error);
    } finally {
      setVotingFor(null);
    }
  };

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);

  // Данные для pie chart (только участники с голосами)
  const chartData = contestants
    .filter(c => c.votes > 0)
    .map(c => ({
      name: c.name,
      value: c.votes,
      percentage: totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : '0'
    }));

  // Цвета для секторов
  const COLORS = [
    '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
    '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
    '#ec4899', '#f472b6', '#f9a8d4', '#fce7f3',
    '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc',
    '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
    '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'
  ];

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
        <div className="container mx-auto max-w-4xl">
          <header className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Голосование за лучший номер
            </h1>
            <p className="text-lg text-white/80">
              {hasVoted
                ? 'Спасибо за ваш голос! Результаты обновляются в реальном времени.'
                : 'Выберите понравившийся номер и проголосуйте за него'}
            </p>
            {totalVotes > 0 && (
              <p className="mt-2 text-sm text-white/60">
                Всего голосов: {totalVotes}
              </p>
            )}
          </header>

          {/* Pie Chart */}
          {hasVoted && chartData.length > 0 && (
            <div className="mb-12 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <h2 className="mb-6 text-center text-2xl font-bold text-white">
                Распределение голосов
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${((entry.percent || 0) * 100).toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value: number) => [`${value} голосов`, 'Голоса']}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                    formatter={(value) => <span style={{ color: 'white' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-4">
            {contestants.map((contestant) => {
              const percentage = totalVotes > 0
                ? ((contestant.votes / totalVotes) * 100).toFixed(1)
                : '0';

              return (
                <div
                  key={contestant.id}
                  className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/15"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-col items-center gap-4 md:flex-row md:items-center">
                      {contestant.photo && (
                        <div className="relative h-[150px] w-[150px] flex-shrink-0 md:h-16 md:w-16">
                          <Image
                            src={contestant.photo}
                            alt={contestant.name}
                            fill
                            className="rounded-full object-cover ring-2 ring-white/20"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="mb-1 text-xl font-bold text-white">
                          {contestant.name}
                        </h3>
                        <p className="text-white/70">{contestant.song}</p>
                        {hasVoted && (
                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span className="text-white/60">
                                {contestant.votes} {contestant.votes === 1 ? 'голос' : 'голосов'}
                              </span>
                              <span className="font-semibold text-white">
                                {percentage}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/20">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleVote(contestant.id)}
                      disabled={hasVoted || votingFor !== null}
                      className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {votingFor === contestant.id
                        ? 'Голосуем...'
                        : hasVoted
                          ? 'Проголосовано'
                          : 'Голосовать'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
