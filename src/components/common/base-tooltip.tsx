'use client';

import { FC, ReactElement, useState, useEffect } from "react";
import { Tooltip } from "radix-ui";

interface BaseTooltipProps {
  trigger: string;
  content: ReactElement;
}

export const BaseTooltip: FC<BaseTooltipProps> = ({ trigger, content }) => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Определяем мобильное устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      setOpen(!open);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isMobile) {
      setOpen(newOpen);
    }
  };

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={200}>
      <Tooltip.Root 
        delayDuration={0} 
        open={open} 
        onOpenChange={handleOpenChange}
      >
        <Tooltip.Trigger asChild>
          <span 
            className="cursor-help underline font-bold touch-manipulation"
            onClick={handleClick}
            onTouchStart={handleClick}
          >
            {trigger}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            className="z-50 mx-2 px-2 py-3 rounded-sm text-brand bg-white max-w-60 shadow-lg data-[state='delayed-open']:animate-flip-in-y data-[state='closed']:animate-flip-out-y"
            sideOffset={5}
            onPointerDownOutside={() => isMobile && setOpen(false)}
            onEscapeKeyDown={() => setOpen(false)}
          > 
            {content}
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}