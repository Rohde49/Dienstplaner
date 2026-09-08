import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentPropsWithoutRef } from 'react';

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
};

/** Zeigt den einheitlich gestalteten Inhalt eines Eingabedialogs an. */
export function DialogContent({
  title,
  description,
  children,
  className,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[1px]" />

      <DialogPrimitive.Content
        className={[
          'border-app-border bg-app-surface fixed top-1/2 left-1/2 z-50 max-h-[calc(100vh-3rem)] w-[calc(100%-3rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border shadow-xl',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="border-app-border border-b px-6 py-5 pr-14">
          <DialogPrimitive.Title className="text-app-text text-lg font-semibold">
            {title}
          </DialogPrimitive.Title>

          <DialogPrimitive.Description className="text-app-muted mt-1 text-sm leading-6">
            {description}
          </DialogPrimitive.Description>
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
