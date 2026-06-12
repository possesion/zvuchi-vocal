"use client";

import { Program as ProgramType } from "@/lib/types";
import cn from 'classnames'
import { Program } from "../common/program";
import { QuizModal } from "../modals/quiz-modal";
import { useEffect, useState } from "react";
import { Trash2 } from 'lucide-react';
import { FirstLessonCard } from "@/components/sections/first-lesson-card";
import { AlertDialog } from "@/components/common/alert-dialog/alert-dialog";
import { formatPrice } from "@/lib/format";

interface ProgramsProps {
  programs?: ProgramType[];
  isAuthorized?: boolean;
}

export const Programs = ({ programs = [], isAuthorized = false }: ProgramsProps) => {
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { deleteProgramAction } = await import('@/app/actions/programs');
      await deleteProgramAction(deleteTarget);
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
        <FirstLessonCard onEnroll={() => setOpen(true)} />
        {programs.map(({ id, shortDescription, packages, title, slug }) => (
          <div key={id} className="relative">
            {isAuthorized && (
              <button
                onClick={() => setDeleteTarget(id)}
                className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
                aria-label="Удалить абонемент"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <Program 
              description={shortDescription}
              features={packages.length > 0 ? [`От ${packages[0].lessons_count} занятий`] : []}
              title={title} 
              price={packages.length > 0 ? formatPrice(packages[0].price) : 'Цена не указана'}
              slug={slug}
            />
          </div>
        ))}
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Удалить абонемент?"
        description="Это действие нельзя отменить."
        confirmText={deleting ? 'Удаление...' : 'Удалить'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        disabled={deleting}
      />
    </div>
  );
};
