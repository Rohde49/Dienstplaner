import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { MonthlyPlan } from '../../../shared/schemas';
import { Alert } from '../../components/ui';
import {
  A4_DOCUMENT_HEIGHT,
  A4_DOCUMENT_WIDTH,
  CompactPlanDocument,
} from './CompactPlanDocument';
import { createCompactPlanModel } from './compactPlanModel';

type CompactPlanPreviewProps = {
  plan: MonthlyPlan;
};

/** Skaliert das feste A4-Dokument ausschließlich für die Bildschirmdarstellung. */
export function CompactPlanPreview({ plan }: CompactPlanPreviewProps) {
  const model = useMemo(() => createCompactPlanModel(plan), [plan]);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(A4_DOCUMENT_WIDTH);
  const [documentHeight, setDocumentHeight] = useState(A4_DOCUMENT_HEIGHT);
  const [doesOverflow, setDoesOverflow] = useState(false);
  const scale = Math.min(1, availableWidth / A4_DOCUMENT_WIDTH);

  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    const documentElement = documentRef.current;

    if (!workspace || !documentElement) {
      return;
    }

    const measure = (): void => {
      const width = Math.max(1, workspace.clientWidth - 48);
      const contentHeight = Math.max(
        A4_DOCUMENT_HEIGHT,
        documentElement.scrollHeight,
      );

      setAvailableWidth(width);
      setDocumentHeight(contentHeight);
      setDoesOverflow(
        documentElement.scrollHeight > A4_DOCUMENT_HEIGHT + 1 ||
          documentElement.scrollWidth > A4_DOCUMENT_WIDTH + 1,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(workspace);
    observer.observe(documentElement);

    return () => observer.disconnect();
  }, [model]);

  return (
    <div className="space-y-3">
      {doesOverflow ? (
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
            width: A4_DOCUMENT_WIDTH * scale,
            height: documentHeight * scale,
          }}
        >
          <div
            ref={documentRef}
            className="absolute top-0 left-0 shadow-lg ring-1 ring-slate-300"
            style={{
              width: A4_DOCUMENT_WIDTH,
              minHeight: A4_DOCUMENT_HEIGHT,
              transform: `scale(${scale})`,
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
