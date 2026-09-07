'use client';

import { useState, useLayoutEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Pencil, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ContestPieChart } from '@/components/contest/contest-pie-chart';
import { ContestantAdminForm } from '@/components/contest/contestant-admin-form';
import { isAdmin } from '@/lib/roles';
import type { ContestResult } from '@/lib/types';

export default function ContestPage() {
  const { data: session } = useSession();
  const userIsAdmin = isAdmin(session?.user?.role);

  const [contestants, setContestants] = useState<ContestResult[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedForId, setVotedForId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const checkVotingStatus = async () => {
    try {
      const response = await fetch('/api/v1/contest/vote');
      const result = await response.json();
      if (result.success) {
        setHasVoted(result.data.hasVoted);
        setVotedForId(result.data.contestantId);
      } else {
        console.error('[Contest] Ошибка проверки статуса голосования:', result.error);
      }
    } catch (error) {
      console.error('[Contest] Ошибка проверки статуса голосования:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/v1/contest');
      const data = await response.json();
      if (data.success) {
        setContestants(data.data);
      } else {
        console.error('[Contest] Ошибка загрузки результатов:', data.error);
      }
    } catch (error) {
      console.error('[Contest] Ошибка загрузки результатов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (id: number) => {
    if (votedForId === id) return;

    setVotingFor(id);
    try {
      const response = await fetch('/api/v1/contest/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId: id }),
      });

      if (response.ok) {
        setHasVoted(true);
        setVotedForId(id);
        await fetchResults();
        window.scrollTo(0, 0);
      } else {
        console.error('[Contest] Ошибка голосования, статус:', response.status);
      }
    } catch (error) {
      console.error('[Contest] Ошибка голосования:', error);
    } finally {
      setVotingFor(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/contest/contestants/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('[Contest] Ошибка удаления участника, статус:', res.status);
        return;
      }
      setDeleteTarget(null);
      await fetchResults();
    } catch (error) {
      console.error('[Contest] Ошибка удаления участника:', error);
    } finally {
      setDeleting(false);
    }
  };

  useLayoutEffect(() => {
    checkVotingStatus();
    fetchResults();
  }, []);

  const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);

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

          {!session && (<div className="rounded-sm bg-yellow-400/10 border border-yellow-400/30 px-4 py-3 mb-2 text-sm text-yellow-400">
                        ⚠️ Авторизуйтесь на сайте для голосования
                    </div>)
                    }

          {/* Pie Chart */}
          {hasVoted && chartData.length > 0 && (
            <div className="mb-12">
              <ContestPieChart data={chartData} />
            </div>
          )}

          {userIsAdmin && (
            <div className="mb-8">
              {showCreateForm ? (
                <ContestantAdminForm
                  onSaved={() => {
                    setShowCreateForm(false);
                    fetchResults();
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="rounded-sm bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                  >
                    + Добавить участника
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {contestants.map((contestant) => {
              const percentage = totalVotes > 0
                ? ((contestant.votes / totalVotes) * 100).toFixed(1)
                : '0';

              if (userIsAdmin && editingId === contestant.id) {
                return (
                  <ContestantAdminForm
                    key={contestant.id}
                    contestant={contestant}
                    onSaved={() => {
                      setEditingId(null);
                      fetchResults();
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                );
              }

              return (
                <div
                  key={contestant.id}
                  className={`group relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/15 ${
                    votedForId === contestant.id
                      ? 'border-violet-400/60 bg-white/15'
                      : 'border-white/20 bg-white/10'
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-col items-center gap-4 md:flex-row md:items-center">
                      {contestant.photoUrl && (
                        <div className="relative h-[150px] w-[150px] flex-shrink-0 md:h-16 md:w-16">
                          <Image
                            src={contestant.photoUrl}
                            alt={contestant.name}
                            fill
                            sizes="(max-width: 768px) 150px, 64px"
                            className="rounded-full object-cover ring-2 ring-white/20"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="mb-1 text-xl font-bold text-white">
                          {contestant.name}
                        </h3>
                        <p className="text-white/70">{contestant.originalArtist}</p>
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

                    <div className="flex flex-col items-center gap-2 md:items-end">
                      <button
                        onClick={() => handleVote(contestant.id)}
                        disabled={!session || votedForId === contestant.id || votingFor !== null}
                        className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {votingFor === contestant.id
                          ? 'Голосуем...'
                          : votedForId === contestant.id
                            ? 'Проголосовано'
                            : 'Голосовать'}
                      </button>

                      {userIsAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(contestant.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                            aria-label={`Редактировать участника ${contestant.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Редактировать
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: contestant.id, name: contestant.name })}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                            aria-label={`Удалить участника ${contestant.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />

      {/* Диалог подтверждения удаления участника */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-zinc-900 p-6 text-white shadow-xl">
            <p className="mb-2 text-lg font-semibold">Удалить участника?</p>
            <p className="mb-1 text-sm text-white/60">
              <span className="font-medium text-white">{deleteTarget.name}</span>
            </p>
            <p className="mb-6 text-sm text-white/60">Это действие нельзя отменить.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-sm px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
