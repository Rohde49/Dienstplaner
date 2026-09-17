import { createPortal } from 'react-dom';

import { CompactPlanDocument } from './CompactPlanDocument';
import type { CompactPlanModel } from './compactPlanModel';

type CompactPlanPrintDocumentProps = {
  model: CompactPlanModel;
};

/** Hält dasselbe A4-Dokument isoliert für Electrons Druckausgabe bereit. */
export function CompactPlanPrintDocument({
  model,
}: CompactPlanPrintDocumentProps) {
  return createPortal(
    <div className="pdf-export-root" aria-hidden="true">
      <CompactPlanDocument model={model} />
    </div>,
    document.body,
  );
}
