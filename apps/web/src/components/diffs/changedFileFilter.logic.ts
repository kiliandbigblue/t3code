import {
  hideableChangedFileGroup,
  type HideableChangedFileGroup,
} from "@t3tools/shared/changedFileKind";

export const HIDEABLE_CHANGED_FILE_GROUPS = [
  "tests",
  "generated",
] as const satisfies ReadonlyArray<HideableChangedFileGroup>;

export type HiddenChangedFileGroups = Readonly<Record<HideableChangedFileGroup, boolean>>;

export type ChangedFileFilter = ReturnType<typeof filterChangedFiles>;

/** A kept path (one the user asked for) stays shown, so a jump to a hidden file still lands. */
export function filterChangedFiles(
  paths: ReadonlyArray<string>,
  hidden: HiddenChangedFileGroups,
  keptPaths: ReadonlyArray<string | null | undefined>,
  isGenerated: (path: string) => boolean,
) {
  const total = { tests: 0, generated: 0 };
  const hiddenCount = { tests: 0, generated: 0 };
  const hiddenPaths = new Set<string>();
  for (const path of paths) {
    const group = hideableChangedFileGroup(path, isGenerated);
    if (group === null) continue;
    total[group] += 1;
    if (!hidden[group] || keptPaths.includes(path)) continue;
    hiddenCount[group] += 1;
    hiddenPaths.add(path);
  }
  return {
    hidden,
    total,
    hiddenCount,
    isShown: (path: string) => !hiddenPaths.has(path),
  };
}
