'use client';

import { beltingDescription, driveDescription, evtTooltipContent, evtTooltipTitle } from "@/app/constants";
import { BaseTooltip } from "../common/base-tooltip";
import { useEffect, useState } from "react";
import { CAROUSEL_TIMEOUT } from "../constants";

const features = [
  {
    id: 1,
    title: "Персональный подход",
    description: (
      <>
        Ваш голос - уникален. Наши занятия помогут раскрыть его потенциал, изучить техники от <BaseTooltip trigger='Бэлтинга' content={<>{beltingDescription}</>} /> до <BaseTooltip trigger='Драйва' content={<>{driveDescription}</>} /> и создать свой узнаваемый стиль
      </>
    ),
    image: "/about/about-1.jpg"
  },
  {
    id: 2,
    title: "Лучшие эксперты",
    description: (
      <>
        Учитесь у профессионалов – наши педагоги сертифицированы по методике{' '}
        <BaseTooltip trigger="EVT" content={<><b>{evtTooltipTitle}</b>{evtTooltipContent} </>} />
        {' '}и имеют многолетний опыт выступлений и преподавания.
      </>
    ),
    image: "/about/about-2.jpg"
  },
  {
    id: 3,
    title: "Сообщество близких по духу людей",
    description: (
      <>
        Присоединяйтесь к нашему творческому <a className="underline text-white font-bold animate-tilt" target="_blank" href="https://t.me/zvuchivocal">сообществу</a> — где вдохновляют и поддерживают!
      </>
    ),
    image: "/about/about-4.jpg"
  }
];

export const FeatureList = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, CAROUSEL_TIMEOUT);

    return () => clearInterval(interval);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Свайп влево - следующий слайд
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }
    
    if (isRightSwipe) {
      // Свайп вправо - предыдущий слайд
      setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    }
  };

  return (
    <section className="bg-muted/50 py-8 lg:py-16">
      <div className="flex justify-center">
        {/* Mobile Carousel */}
        <div 
          className="relative w-full overflow-hidden md:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {features.map((feature) => (
              <article
                key={feature.id}
                className="flex h-[600px] w-full flex-shrink-0 flex-col items-center justify-end rounded-sm bg-cover bg-image p-6 text-center shadow-sm text-white"
                style={{ backgroundImage: `url(${feature.image})` }}
              >
                <div className="h-[400px] rounded-sm bg-linear-to-b from-black/70 to-transparent pt-2">
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="px-1 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-white' : 'bg-white/50'
                  }`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden flex-col gap-6 overflow-auto text-white sm:gap-2 md:flex md:flex-row lg:gap-4">
          {features.map((feature) => (
            <article
              key={feature.id}
              className="flex h-[500px] w-full flex-col items-center justify-end rounded-sm bg-cover bg-image p-6 text-center shadow-sm sm:w-[380px] xl:h-[600px]"
              style={{ backgroundImage: `url(${feature.image})` }}
            >
              <div className="h-[400px] rounded-sm bg-linear-to-b from-black/70 to-transparent pt-2">
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="px-1 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
