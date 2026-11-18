import { useGT } from "gt-react";
import { memo } from "react";
import { cn } from "~/lib/utils";

export function hasNonZeroStat(stat: { additions: number; deletions: number }): boolean {
  return stat.additions > 0 || stat.deletions > 0;
}

export function formatCompactDiffCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 999_500) {
    const k = value / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}k`;
  }
  if (value < 999_500_000) {
    const m = value / 1_000_000;
    return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.round(m)}m`;
  }
  const b = value / 1_000_000_000;
  return `${b < 10 ? b.toFixed(1).replace(/\.0$/, "") : Math.round(b)}b`;
}

export const DiffStatLabel = memo(function DiffStatLabel(props: {
  additions: number;
  deletions: number;
  className?: string;
  layout?: "aligned" | "inline";
}) {
  const { additions, deletions, className, layout = "aligned" } = props;
  const gt = useGT();
  return (
    <span
      role="group"
      aria-label={gt("{additions} additions, {deletions} deletions", { additions, deletions })}
      className={cn(
        layout === "inline"
          ? "inline-flex items-center gap-1 tabular-nums align-middle"
          : "inline-grid grid-cols-[4ch_4ch] gap-2 text-right tabular-nums align-middle",
        className,
      )}
    >
      <span aria-hidden="true" className="font-mono text-diff-addition-foreground">
        +{formatCompactDiffCount(additions)}
      </span>
      <span aria-hidden="true" className="font-mono text-diff-deletion-foreground">
        -{formatCompactDiffCount(deletions)}
      </span>
    </span>
  );
});

export type DiffStatBlock = "addition" | "deletion" | "neutral";

/** GitHub's five squares: one per changed line up to five, green for the share added. */
export function diffStatBlocks(additions: number, deletions: number): DiffStatBlock[] {
  const total = additions + deletions;
  const colored = Math.min(5, total);
  const added = total === 0 ? 0 : Math.round((additions / total) * colored);
  return Array.from({ length: 5 }, (_, index) =>
    index < added ? "addition" : index < colored ? "deletion" : "neutral",
  );
}

const BLOCK_CLASS: Record<DiffStatBlock, string> = {
  addition: "bg-[var(--diff-stat-addition)]",
  deletion: "bg-[var(--diff-stat-deletion)]",
  neutral: "bg-[var(--diff-border)]",
};

export const DiffStatBlocks = memo(function DiffStatBlocks(props: {
  additions: number;
  deletions: number;
}) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 gap-px">
      {diffStatBlocks(props.additions, props.deletions).map((block, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- the five squares are positional
        <span key={index} className={cn("size-2 rounded-xs", BLOCK_CLASS[block])} />
      ))}
    </span>
  );
});
