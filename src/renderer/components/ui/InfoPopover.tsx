import { Info, X } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { useId, type ReactNode } from 'react';

import { IconButton } from './Button';

type InfoPopoverProps = {
  title: string;
  children: ReactNode;
  triggerLabel?: string;
};

/** Zeigt zusätzliche Erklärungen kompakt an einem Begriff oder Bereich an. */
export function InfoPopover({
  title,
  children,
  triggerLabel = 'Weitere Informationen anzeigen',
}: InfoPopoverProps) {
  const titleId = useId();

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <IconButton
          label={triggerLabel}
          className="text-app-primary hover:bg-app-primary-subtle size-7"
        >
          <Info aria-hidden="true" size={16} />
        </IconButton>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          role="dialog"
          aria-labelledby={titleId}
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="border-app-border bg-app-surface z-[60] w-[min(28rem,calc(100vw-2rem))] rounded-lg border p-4 pr-11 shadow-md"
        >
          <h3 id={titleId} className="text-app-text text-sm font-semibold">
            {title}
          </h3>

          <div className="text-app-muted mt-3 text-sm leading-6">
            {children}
          </div>

          <PopoverPrimitive.Close asChild>
            <IconButton
              label="Information schließen"
              className="absolute top-2 right-2 size-7"
            >
              <X aria-hidden="true" size={16} />
            </IconButton>
          </PopoverPrimitive.Close>

          <PopoverPrimitive.Arrow className="fill-app-surface stroke-app-border" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
