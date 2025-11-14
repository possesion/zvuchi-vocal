'use client';

import { FC, ReactElement } from "react";
import { Tooltip } from "radix-ui";

interface BaseTooltipProps {
  trigger: string;
  content: ReactElement;
}
export const BaseTooltip:FC<BaseTooltipProps> = ({ trigger, content }) => {
  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={200}>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          <span className="cursor-help underline font-bold">
            {trigger}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            className="z-50 mx-2 px-2 py-3 rounded-sm text-brand bg-white max-w-60 shadow-lg data-[state='delayed-open']:animate-flip-in-y data-[state='closed']:animate-flip-out-y"
            sideOffset={5}
          > 
            {content}
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}