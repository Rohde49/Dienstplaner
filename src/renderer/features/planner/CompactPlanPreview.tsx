import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { MonthlyPlan } from '../../../shared/schemas';
import { Alert } from '../../components/ui';
import { CompactPlanDocument } from './CompactPlanDocument';
import { createCompactPlanModel } from './compactPlanModel';
import {
  A4_DOCUMENT_HEIGHT,
  A4_DOCUMENT_WIDTH,
  calculateCompactPlanLayoutMetrics,
} from './compactPlanLayout';

type CompactPlanPreviewProps = {
  plan: MonthlyPlan;
};

/** Skaliert das feste A4-Dokument ausschließlich für die Bildschirmdarstellung. */
export function CompactPlanPreview({ plan }: CompactPlanPreviewProps) {
  const model = useMemo(() => createCompactPlanModel(plan), [plan]);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(A4_DOCUMENT_WIDTH);
  const [contentSize, setContentSize] = useState({
    width: A4_DOCUMENT_WIDTH,
    height: A4_DOCUMENT_HEIGHT,
    violatesContentLimits: false,
  });
  const layout = calculateCompactPlanLayoutMetrics(
    availableWidth,
    contentSize.width,
    contentSize.height,
    contentSize.violatesContentLimits,
  );

  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    const documentElement = documentRef.current;

    if (!workspace || !documentElement) {
      return;
    }

    const measure = (): void => {
      const width = Math.max(1, workspace.clientWidth - 48);

      setAvailableWidth(width);
      setContentSize({
        width: documentElement.scrollWidth,
        height: documentElement.scrollHeight,
        violatesContentLimits: Array.from(
          documentElement.querySelectorAll<HTMLElement>(
            '[data-compact-employee-name]',
          ),
        ).some((element) => {
          const lineHeight = Number.parseFloat(
            window.getComputedStyle(element).lineHeight,
          );

          return (
            Number.isFinite(lineHeight) &&
            element.scrollHeight > lineHeight * 2 + 1
          );
        }),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(workspace);
    observer.observe(documentElement);

    return () => observer.disconnect();
  }, [model]);

  return (
    <div className="space-y-3">
      {layout.doesOverflow ? (
        <Alert title="A4-Seite überschritten" variant="warning">
          Der Dienstplan passt mit den aktuellen Inhalten nicht lesbar auf eine
          A4-Seite.
        </Alert>
      ) : null}

      <div
        ref={workspaceRef}
        className="border-app-border min-h-96 overflow-auto rounded-lg border bg-slate-200 p-6"
      >
        <div
          className="relative mx-auto"
          style={{
            width: A4_DOCUMENT_WIDTH * layout.scale,
            height: layout.renderedHeight,
          }}
        >
          <div
            ref={documentRef}
            className="absolute top-0 left-0 shadow-lg ring-1 ring-slate-300"
            style={{
              width: A4_DOCUMENT_WIDTH,
              minHeight: A4_DOCUMENT_HEIGHT,
              transform: `scale(${layout.scale})`,
              transformOrigin: 'top left',
            }}
          >
            <CompactPlanDocument model={model} />
          </div>
        </div>
      </div>
    </div>
  );
}
