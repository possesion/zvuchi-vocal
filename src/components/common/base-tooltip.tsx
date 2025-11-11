'use client';

import { FC, ReactElement, useState } from "react";
import { Tooltip } from "radix-ui";

interface BaseTooltipProps {
  trigger: string;
  content: ReactElement;
}
export const BaseTooltip:FC<BaseTooltipProps> = ({ trigger, content }) => {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip.Provider delayDuration={800} skipDelayDuration={500}>
      <Tooltip.Root onOpenChange={setOpen} open={open} delayDuration={0}>
        <div className="inline-flex" onClick={() => setOpen(true)}>
          <Tooltip.Trigger className="pr-1 cursor-help underline font-bold">
            {trigger}
            </Tooltip.Trigger>
          <Tooltip.Content className="px-2 py-3 rounded-sm text-brand bg-white max-w-60 data-[state='delayed-open']:animate-flip-in-y data-[state='closed']:animate-flip-out-y"> 
            {content}
            </Tooltip.Content>
        </div>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}