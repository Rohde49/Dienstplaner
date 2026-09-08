import type { HTMLAttributes } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** Zeigt Inhalte in einem abgegrenzten Kartenbereich an. */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={[
        'border-app-border bg-app-surface rounded-lg border shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

/** Ordnet Überschrift und Beschreibung am Anfang einer Karte an. */
export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['space-y-1.5 p-6', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

/** Zeigt die Überschrift einer Karte an. */
export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={['text-app-text text-lg font-semibold', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

/** Zeigt einen kurzen Beschreibungstext innerhalb einer Karte an. */
export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={['text-app-muted text-sm leading-6', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

/** Enthält den hauptsächlichen Inhalt einer Karte. */
export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['px-6 pb-6', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

/** Ordnet abschließende Informationen oder Aktionen am Ende einer Karte an. */
export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'border-app-border flex items-center gap-3 border-t px-6 py-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
