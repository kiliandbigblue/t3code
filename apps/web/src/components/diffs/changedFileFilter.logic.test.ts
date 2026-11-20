import { describe, expect, it } from "vite-plus/test";

import { filterChangedFiles } from "./changedFileFilter.logic";

const PATHS = [
  "src/app.ts",
  "src/app.test.ts",
  "__mocks__/api.ts",
  "pnpm-lock.yaml",
  "api/v1/service_pb.ts",
];

describe("filterChangedFiles", () => {
  it.each([
    {
      hidden: { tests: false, generated: false },
      kept: [],
      shown: PATHS,
      hiddenCount: { tests: 0, generated: 0 },
    },
    {
      hidden: { tests: true, generated: false },
      kept: [],
      shown: ["src/app.ts", "pnpm-lock.yaml", "api/v1/service_pb.ts"],
      hiddenCount: { tests: 2, generated: 0 },
    },
    {
      hidden: { tests: true, generated: true },
      kept: ["pnpm-lock.yaml", null],
      shown: ["src/app.ts", "pnpm-lock.yaml"],
      hiddenCount: { tests: 2, generated: 1 },
    },
  ])("hides $hidden keeping $kept", ({ hidden, kept, shown, hiddenCount }) => {
    const filter = filterChangedFiles(PATHS, hidden, kept);
    expect(PATHS.filter(filter.isShown)).toEqual(shown);
    expect(filter.hiddenCount).toEqual(hiddenCount);
    expect(filter.total).toEqual({ tests: 2, generated: 2 });
  });
});
