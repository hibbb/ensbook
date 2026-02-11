// src/components/ui/Tooltip.tsx

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string | React.ReactNode;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

        {/* 添加 Portal，将内容渲染到 body 根节点，避免被父容器遮挡 */}
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={5}
            className="z-[9999] overflow-hidden rounded-md bg-text-main px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 whitespace-pre-wrap break-words max-w-[300px]"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-text-main" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
