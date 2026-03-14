"use client";

import { programs } from "@/app/constants";
import cn from 'classnames'
import { Program } from "../common/program";

export const Programs = () => {

  return (
    <div className={cn("container mx-auto cursor-grab pb-4 no-scrollbar lg:px-2 xl:justify-center")}>
      <div className="flex flex-col flex-nowrap space-x-6 space-y-4 pt-1 md:space-x-8">
        <article
          key='Разовое посещение'
          className={cn('group relative flex w-full shrink-0 flex-col rounded-sm bg-black/85 p-6 shadow-md brightness-96 md:flex-row')}
        // ref={ref}
        >
          <div className="flex w-20">
            <div className="hidden font-bold text-white/50 lg:block xl:text-8xl" aria-hidden="true"></div>
          </div>
          <div className="">
            <h3 className="mb-4 block text-2xl font-bold xl:text-4xl">Первое занятие</h3>
            <p className="mb-2 font-bold">Открой для себя новое хобби</p>
            <ul className="mb-2 space-y-2 font-bold">
              <li className="flex items-center">
                <span className="text-base">Длительность урока - 55 минут</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-between pr-4 text-xl font-bold md:ml-auto md:flex-col lg:text-4xl">
            <div className="flex justify-end items-center gap-3">
              <span className="text-lg text-white/60 line-through lg:text-2xl">
                3890₽
              </span>
              <span>1000₽</span>
            </div>
            <button
              // onClick={handleOpenLink(YANDEX_ENROLLMENT_URL)}
              className="ml-auto block cursor-pointer rounded-sm border px-3 hover:animate-rotational-wave md:py-2"
              aria-label={`Записаться на разовое занятие`}
            >
              <span className="relative text-xl lg:text-3xl">
                <div>Получить скидку</div>
              </span>
              {/* <QuizButton isModal /> */}
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

// {
//         icon: (
//             <div className="flex flex-col gap-1">
//                 {[1, 2].map((id) => (
//                     <StarIcon
//                         key={id}
//                         color="var(--brand)"
//                         className="h-8 w-8"
//                     />
//                 ))}
//             </div>
//         ),
//         number: '',
//         title: 'Разовое посещение',
//         description: '',
// features: [
//     'Длительность урока - 55 минут',
// ],
//         price: '3890₽',
//     },