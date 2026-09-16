import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { IconButton } from './Button';

export const DialogRoot = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

type DialogContentProps = Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  'title'
> & {
  title: string;
  description: string;
  headerAside?: ReactNode;
};

/** Zeigt den einheitlich gestalteten Inhalt eines Eingabedialogs an. */
export function DialogContent({
  title,
  description,
  headerAside,
  children,
  className,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="bg-app-overlay/40 fixed inset-0 z-50 backdrop-blur-[1px]" />

      <DialogPrimitive.Content
        className={[
          'border-app-border bg-app-surface fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-3rem)] w-[calc(100%-3rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border shadow-xl',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="border-app-border shrink-0 border-b px-6 py-5 pr-14">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-app-text text-lg font-semibold">
                {title}
              </DialogPrimitive.Title>

              <DialogPrimitive.Description className="text-app-muted mt-1 text-sm leading-6">
                {description}
              </DialogPrimitive.Description>
            </div>

            {headerAside ? <div className="shrink-0">{headerAside}</div> : null}
          </div>
        </div>

        {children}

        <DialogPrimitive.Close asChild>
          <IconButton
            label="Dialog schließen"
            className="absolute top-3.5 right-3.5"
          >
            <X aria-hidden="true" size={18} />
          </IconButton>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
