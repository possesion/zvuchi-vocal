"use client";

import { ProgramRow } from "@/lib/types";
import cn from 'classnames'
import { Program } from "../common/program";
import { QuizModal } from "../modals/quiz-modal";
import { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface ProgramsProps {
  programs?: ProgramRow[];
  isAuthorized?: boolean;
}

export const Programs = ({ programs = [], isAuthorized = false }: ProgramsProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + '₽';
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { deleteProgramAction } = await import('@/app/actions/programs');
      await deleteProgramAction(deleteTarget);
      router.refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className={cn("container mx-auto cursor-grab pb-4 no-scrollbar lg:px-2 xl:justify-center")}>
      <QuizModal
        className="fixed inset-0 z-51 flex items-center justify-center text-black shadow-md rounded-sm w-full"
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex flex-col flex-nowrap space-y-4 pt-1">
        <article
          key='Разовое посещение'
          className={cn('group relative flex w-full shrink-0 flex-col rounded-sm bg-black/85 p-6 shadow-md brightness-96 md:flex-row')}
        >
          <div className="flex w-20">
            <div className="hidden font-bold text-white/50 md:text-6xl lg:block xl:text-8xl" aria-hidden="true"></div>
          </div>
          <div>
            <h3 className="mb-4 inline-block text-2xl font-bold xl:text-4xl">Первое занятие</h3>
            <div className="inline-flex justify-end items-center gap-2">
              <span className="pl-3 text-white/60 line-through sm:hidden">3890₽</span>
              <span className="text-lg text-white lg:text-2xl sm:hidden">1000₽</span>
            </div>
            <p className="mb-2 font-bold">Открой для себя новое хобби</p>
            <ul className="mb-2 space-y-2 font-bold">
              <li className="flex items-center">
                <span className="text-base">Длительность урока - 55 минут</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-between pr-4 text-xl font-bold md:ml-auto md:flex-col lg:text-4xl">
            <div className="hidden justify-end items-center gap-3 sm:flex">
              <span className="text-lg text-white/60 line-through lg:text-2xl">3890₽</span>
              <span>1000₽</span>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="w-full ml-auto block cursor-pointer rounded-sm border px-3 hover:animate-rotational-wave sm:w-[280px] md:py-2"
              aria-label={`Записаться на первое занятие`}
            >
              <span className="relative text-xl lg:text-3xl">
                <div>Получить скидку</div>
              </span>
            </button>
          </div>
        </article>
        {programs.map((program, index) => (
          <div key={program.id} className="relative">
            {isAuthorized && (
              <button
                onClick={() => setDeleteTarget(program.id)}
                className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
                aria-label="Удалить абонемент"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <Program 
              description={program.short_description}
              features={program.packages.length > 0 ? [`От ${program.packages[0].lessons_count} занятий`] : []}
              title={program.title} 
              number={index + 1} 
              price={program.packages.length > 0 ? formatPrice(program.packages[0].price) : 'Цена не указана'}
              slug={program.slug}
            />
          </div>
        ))}
      </div>

      {deleteTarget !== null && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-zinc-900 p-6 text-white shadow-xl">
            <p className="mb-2 text-lg font-semibold">Удалить абонемент?</p>
            <p className="mb-6 text-sm text-white/60">Это действие нельзя отменить.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-sm px-4 py-2 text-sm text-white/70 hover:text-white">
                Отмена
              </button>
              <button onClick={confirmDelete} disabled={deleting} className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
