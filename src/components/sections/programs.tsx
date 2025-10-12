"use client";

import { programs } from "@/app/constants";
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
      sliderRef.current.style.cursor = "grabbing";
      sliderRef.current.style.userSelect = "none";
    }
  };

  const handleMouseLeave = () => {
    isDown = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    isDown = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
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
    <div
      ref={sliderRef}
      className="container mx-auto px-1 pb-4 no-scrollbar cursor-grab xl:justify-center lg:px-2"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="flex flex-col pt-1 space-x-6 md:space-x-8 space-y-4 flex-nowrap">
        {programs.map((program) => (
          <div
            key={program.title}
            // primary-bg
            className="brightness-96 group relative w-full flex p-6 bg-black/85 rounded-lg shadow-md flex-shrink-0"
          >
            {/* <div className="h-12 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4"> */}
            <div className="w-20 flex">
              <div className="text-8xl text-bold text-white/50">
                {program.number}
              </div>
            </div>
            <div className="">
              <h3 className="block text-5xl font-bold mb-4">{program.title}</h3>
              <p className="font-bold mb-2">{program.description}</p>
              <div className="font-bold space-y-2 mb-2">
                {program.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pr-4 ml-auto font-bold text-5xl">
              {program.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
