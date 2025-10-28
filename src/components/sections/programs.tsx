"use client";

import { programs } from "@/app/constants";
import cn from 'classnames'
import { Program } from "../common/program";

export const Programs = () => {

  return (
    <div className={cn("container mx-auto cursor-grab pb-4 no-scrollbar lg:px-2 xl:justify-center")}>
      <div className="flex flex-col flex-nowrap space-x-6 space-y-4 pt-1 md:space-x-8">
        {programs.map(({ description, features, title, number, price }) => (
          <Program key={title} description={description} features={features} title={title} number={number} price={price} />
        ))}
      </div>
    </div>
  );
};
