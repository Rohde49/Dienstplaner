import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export const AlertDialogRoot = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;

type AlertDialogContentProps = Omit<
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
  'title'
> & {
  title: string;
  description: string;
  headerIcon?: ReactNode;
};

/** Zeigt den einheitlich gestalteten Inhalt eines Bestätigungsdialogs an. */
export function AlertDialogContent({
  title,
  description,
  headerIcon,
  children,
  className,
  ...props
}: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="bg-app-overlay/40 fixed inset-0 z-50 backdrop-blur-[1px]" />

      <AlertDialogPrimitive.Content
        className={[
          'border-app-border bg-app-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border shadow-xl',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="border-app-border border-b px-6 py-5">
          <div className="flex items-start gap-3">
            {headerIcon ? <div className="shrink-0">{headerIcon}</div> : null}

            <div className="min-w-0">
              <AlertDialogPrimitive.Title className="text-app-text text-lg font-semibold">
                {title}
              </AlertDialogPrimitive.Title>

              <AlertDialogPrimitive.Description className="text-app-muted mt-1 text-sm leading-6">
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>
        </div>

        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}
