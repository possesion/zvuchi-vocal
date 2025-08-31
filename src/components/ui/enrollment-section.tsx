"use client";

import { useState } from "react";
import { EnrollmentModal } from "./enrollment-modal";

export function EnrollmentSection({ main = false}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section id="study" className="py-12 md:py-16 bg-muted/50">
        {main ? (<button
          onClick={() => setIsModalOpen(true)}
          className="block m-auto cursor-pointer relative overflow-hidden group px-8 py-4 bg-[#ab1515] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <span className="relative z-10">Бесплатное пробное!!</span>
          <span
            className="absolute inset-0 bg-gradient-to-r from-[#d42e2e] to-[#ab1515] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></span>
          {/* Блестящий эффект */}
          <span className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  <span
                    className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-[100%] transition-all duration-1000"></span>
                </span>
          {/* Эффект пульсации */}
          <span
            className="absolute inset-0 rounded-lg border-2 border-white/30 group-active:border-white/50 group-active:scale-95 transition-all duration-200"></span>
        </button>) : <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Готов начать свой вокальный путь?
            </h2>
            <p className="text-brand-secondary max-w-2xl mb-8">
              Присоединяйтесь к нашей вокальной школе и раскройте свой талант под руководством опытных педагогов
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-brand to-brand-secondary rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              {/* Основной контент кнопки */}
              <span className="relative z-10 flex items-center gap-3">
                <svg
                  className="w-6 h-6 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Записаться
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>

            <p className="text-xl text-muted-foreground mt-4">
              Первое занятие – бесплатно! 🎵
            </p>
          </div>
        </div>}
      </section>

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
