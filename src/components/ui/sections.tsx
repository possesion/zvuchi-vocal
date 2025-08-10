'use client';

import { Element } from 'react-scroll';
import { Programs } from './programs';

export const Sections = () => {
    return (
        <Element name="programs">
          {/* <section id="programs" className="py-12 md:py-16"> */}
            {/* <div className="container"> */}
              <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Наши абонементы</h2>
                <p className="text-muted-foreground max-w-2xl">
                  От джаза до рока — учим петь в любом жанре!
                  Индивидуальный подход для всех уровней: от нуля до профессионала.
                </p>
              </div>
                <Programs />
            {/* </div> */}
          </Element>
    )
}