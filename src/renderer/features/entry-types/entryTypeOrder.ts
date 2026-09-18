import type { EntryType } from '../../../shared/schemas';

export type EntryTypeDropPosition = 'before' | 'after';

/** Ordnet eine Eintragsart relativ zu einer Zielzeile ein. */
export function moveEntryType(
  entryTypes: EntryType[],
  sourceId: string,
  targetId: string,
  position: EntryTypeDropPosition,
): EntryType[] {
  const sourceIndex = entryTypes.findIndex(
    (entryType) => entryType.id === sourceId,
  );
  const targetIndex = entryTypes.findIndex(
    (entryType) => entryType.id === targetId,
  );

  if (sourceIndex === -1 || targetIndex === -1 || sourceId === targetId) {
    return entryTypes;
  }

  const nextEntryTypes = [...entryTypes];
  const [movedEntryType] = nextEntryTypes.splice(sourceIndex, 1);
  let insertionIndex = targetIndex + (position === 'after' ? 1 : 0);

  if (sourceIndex < insertionIndex) {
    insertionIndex -= 1;
  }

  nextEntryTypes.splice(insertionIndex, 0, movedEntryType);
  return nextEntryTypes;
}

/** Verschiebt eine Eintragsart für die Tastaturbedienung um eine Position. */
export function swapEntryType(
  entryTypes: EntryType[],
  entryTypeId: string,
  direction: -1 | 1,
): EntryType[] {
  const sourceIndex = entryTypes.findIndex(
    (entryType) => entryType.id === entryTypeId,
  );
  const targetIndex = sourceIndex + direction;

  if (
    sourceIndex === -1 ||
    targetIndex < 0 ||
    targetIndex >= entryTypes.length
  ) {
    return entryTypes;
  }

  const nextEntryTypes = [...entryTypes];
  [nextEntryTypes[sourceIndex], nextEntryTypes[targetIndex]] = [
    nextEntryTypes[targetIndex],
    nextEntryTypes[sourceIndex],
  ];
  return nextEntryTypes;
}
