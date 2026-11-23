import type { FileDiffMetadata } from "@pierre/diffs";
import type { PullRequestDiffResult, PullRequestDiffSide } from "@t3tools/contracts";

/** Only rendered hunks can anchor comments; list others off-diff. */
export function isLineInFileDiff(
  file: FileDiffMetadata,
  side: PullRequestDiffSide,
  line: number,
): boolean {
  return file.hunks.some((hunk) =>
    side === "left"
      ? line >= hunk.deletionStart && line < hunk.deletionStart + hunk.deletionCount
      : line >= hunk.additionStart && line < hunk.additionStart + hunk.additionCount,
  );
}

export function getFileViewedRange<T extends { readonly fileKey: string }>(
  files: ReadonlyArray<T>,
  fileKey: string,
  anchorFileKey: string | null,
): ReadonlyArray<T> {
  const index = files.findIndex((file) => file.fileKey === fileKey);
  if (index === -1) return [];
  const anchorIndex = files.findIndex((file) => file.fileKey === anchorFileKey);
  if (anchorIndex === -1) return files.slice(index, index + 1);
  return files.slice(Math.min(index, anchorIndex), Math.max(index, anchorIndex) + 1);
}

/** Whether a refetched diff page carries nothing the held page does not already show. */
export function isSameDiffPage(held: PullRequestDiffResult, next: PullRequestDiffResult): boolean {
  const heldOmitted = held.omittedFileStats ?? [];
  const nextOmitted = next.omittedFileStats ?? [];
  return (
    held.patch === next.patch &&
    held.truncated === next.truncated &&
    held.nextCursor === next.nextCursor &&
    held.withheldFilesReadable === next.withheldFilesReadable &&
    held.generatedPaths?.join("\0") === next.generatedPaths?.join("\0") &&
    heldOmitted.length === nextOmitted.length &&
    heldOmitted.every((file, index) => {
      const refreshed = nextOmitted[index];
      return (
        refreshed !== undefined &&
        refreshed.path === file.path &&
        refreshed.additions === file.additions &&
        refreshed.deletions === file.deletions
      );
    })
  );
}
