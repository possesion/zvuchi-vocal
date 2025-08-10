'use client';

import { programs } from "@/app/constants"
import { useRef } from "react";

export const Programs = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    startX = e.pageX - (sliderRef.current?.offsetLeft || 0);
    scrollLeft = sliderRef.current?.scrollLeft || 0;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grabbing';
      sliderRef.current.style.userSelect = 'none';
    }
  };

  const handleMouseLeave = () => {
    isDown = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    isDown = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Умножаем на 2 для более быстрого скролла
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div ref={sliderRef}
      className="flex overflow-x-auto pb-4 no-scrollbar cursor-grab"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}>
      
      <div className="flex pt-1 space-x-6 md:space-x-8 flex-nowrap">
        {programs.map((program) => (
          <div
            key={program.title}
            className="group relative w-[380px] flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md flex-shrink-0"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <div className="text-primary">{program.icon}</div>
            </div>
            <h3 className="text-xl font-bold mb-2">{program.title}</h3>
            <p className="text-muted-foreground mb-4">{program.description}</p>
            <div className="space-y-2 mb-4">
              {program.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                  <span className="text-base">{feature}</span>
                </div>
              ))}
            </div>
            <span className="font-bold text-red-800 text-lg">{program.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}