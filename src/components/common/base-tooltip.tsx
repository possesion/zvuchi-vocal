'use client';

import { useState } from "react";
import { Tooltip } from "radix-ui";
import { evtTooltipContent, evtTooltipTitle } from "@/app/constants";

export const BaseTooltip = () => {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip.Provider delayDuration={800} skipDelayDuration={500}>
      <Tooltip.Root onOpenChange={setOpen} open={open} delayDuration={0}>
        <div className="inline-flex" onClick={() => setOpen(true)}>
          <Tooltip.Trigger className="pr-1 cursor-help underline font-bold">EVT</Tooltip.Trigger>
          <Tooltip.Content className="px-2 py-3 rounded-sm text-brand bg-white max-w-60 data-[state='delayed-open']:animate-flip-in-y data-[state='closed']:animate-flip-out-y"><b>{evtTooltipTitle}</b> {evtTooltipContent}</Tooltip.Content>
        </div>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}