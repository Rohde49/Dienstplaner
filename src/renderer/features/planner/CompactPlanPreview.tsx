import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { MonthlyPlan } from '../../../shared/schemas';
import { Alert } from '../../components/ui';
import { CompactPlanDocument } from './CompactPlanDocument';
import { CompactPlanPrintDocument } from './CompactPlanPrintDocument';
import { createCompactPlanModel } from './compactPlanModel';
import {
  A4_DOCUMENT_HEIGHT,
  A4_DOCUMENT_WIDTH,
  calculateCompactPlanLayoutMetrics,
  getCompactPlanFitStatus,
  type CompactPlanFitStatus,
} from './compactPlanLayout';

type CompactPlanPreviewProps = {
  plan: MonthlyPlan;
  onFitStatusChange?: (status: CompactPlanFitStatus) => void;
};

/** Skaliert das feste A4-Dokument ausschließlich für die Bildschirmdarstellung. */
export function CompactPlanPreview({
  plan,
  onFitStatusChange,
}: CompactPlanPreviewProps) {
  const model = useMemo(() => createCompactPlanModel(plan), [plan]);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(A4_DOCUMENT_WIDTH);
  const [measurement, setMeasurement] = useState<{
    model: typeof model | null;
    width: number;
    height: number;
    violatesContentLimits: boolean;
  }>({
    model: null,
    width: A4_DOCUMENT_WIDTH,
    height: A4_DOCUMENT_HEIGHT,
    violatesContentLimits: false,
  });
  const hasCurrentMeasurement = measurement.model === model;
  const contentSize = hasCurrentMeasurement
    ? measurement
    : {
        width: A4_DOCUMENT_WIDTH,
        height: A4_DOCUMENT_HEIGHT,
        violatesContentLimits: false,
      };
  const layout = calculateCompactPlanLayoutMetrics(
    availableWidth,
    contentSize.width,
    contentSize.height,
    contentSize.violatesContentLimits,
  );
  const fitStatus = getCompactPlanFitStatus(
    hasCurrentMeasurement,
    layout.doesOverflow,
  );

  useLayoutEffect(() => {
    onFitStatusChange?.(fitStatus);
  }, [fitStatus, onFitStatusChange]);

  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    const documentElement = documentRef.current;

    if (!workspace || !documentElement) {
      return;
    }

    const measure = (): void => {
      const width = Math.max(1, workspace.clientWidth - 48);

      setAvailableWidth(width);
      setMeasurement({
        model,
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
    <>
      <CompactPlanPrintDocument model={model} />

      <div className="space-y-3">
        {fitStatus === 'overflow' ? (
          <Alert title="A4-Seite überschritten" variant="warning">
            Der Dienstplan passt mit den aktuellen Inhalten nicht lesbar auf
            eine A4-Seite.
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
    </>
  );
}
