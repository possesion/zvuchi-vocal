"use client";

import { programs } from "@/app/constants";
import cn from 'classnames'
import { Program } from "../common/program";

export const Programs = () => {

  return (
    <div className={cn("container mx-auto pb-4 no-scrollbar cursor-grab xl:justify-center lg:px-2")}>
      <div className="flex flex-col pt-1 space-x-6 md:space-x-8 space-y-4 flex-nowrap">
        {programs.map(({ description, features, title, number, price }) => (
          <Program key={title} description={description} features={features} title={title} number={number} price={price} />
        ))}
      </div>
    </div>
  );
};
