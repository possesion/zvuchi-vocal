"use client";

import { programs } from "@/app/constants";
import cn from 'classnames'
import { Program } from "../common/program";
import { QuizModal } from "../modals/quiz-modal";
import { useState } from "react";

export const Programs = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("container mx-auto cursor-grab pb-4 no-scrollbar lg:px-2 xl:justify-center")}>
      <QuizModal
        className="fixed inset-0 z-51 flex items-center justify-center text-black shadow-md rounded-sm w-full"
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex flex-col flex-nowrap space-x-6 space-y-4 pt-1 md:space-x-8">
        <article
          key='Разовое посещение'
          className={cn('group relative flex w-full shrink-0 flex-col rounded-sm bg-black/85 p-6 shadow-md brightness-96 md:flex-row')}
        >
          <div className="flex w-20">
            <div className="hidden font-bold text-white/50 lg:block xl:text-8xl" aria-hidden="true"></div>
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
        {programs.map(({ description, features, title, number, price }) => (
          <Program key={title} description={description} features={features} title={title} number={number} price={price} />
        ))}
      </div>
    </div>
  );
};
