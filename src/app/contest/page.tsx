'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
    const voted = localStorage.getItem('hasVoted');
    if (voted) {
      setHasVoted(true);
    }
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
        localStorage.setItem('hasVoted', 'true');
        setHasVoted(true);
        await fetchResults();
      }
    } catch (error) {
      console.error('Ошибка голосования:', error);
    } finally {
      setVotingFor(null);
    }
  };

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);

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
