"use client";

import { useState } from "react";
import { EnrollmentModal } from "./enrollment-modal";

export function EnrollmentSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section id="study" className="py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
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
            
            <p className="text-sm text-muted-foreground mt-4">
              Первое занятие - бесплатно! 🎵
            </p>
          </div>
        </div>
      </section>

      {/* Модальное окно для записи */}
      <EnrollmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
