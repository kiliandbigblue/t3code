import { describe, expect, it } from "vite-plus/test";

import { diffStatBlocks, formatCompactDiffCount } from "./DiffStatLabel";

describe("formatCompactDiffCount", () => {
  it("promotes counts when rounding reaches the next suffix", () => {
    expect(formatCompactDiffCount(999_499)).toBe("999k");
    expect(formatCompactDiffCount(999_500)).toBe("1m");
    expect(formatCompactDiffCount(999_499_999)).toBe("999m");
    expect(formatCompactDiffCount(999_500_000)).toBe("1b");
  });
});

describe("diffStatBlocks", () => {
  it("colors one square per changed line up to five, green for the share added", () => {
    const short = (additions: number, deletions: number) =>
      diffStatBlocks(additions, deletions)
        .map((block) => block[0])
        .join("");
    expect(short(0, 0)).toBe("nnnnn");
    expect(short(1, 1)).toBe("adnnn");
    expect(short(3, 0)).toBe("aaann");
    expect(short(29, 21)).toBe("aaadd");
    expect(short(1, 99)).toBe("ddddd");
    expect(short(38, 0)).toBe("aaaaa");
  });
});
