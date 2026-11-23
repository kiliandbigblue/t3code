import { describe, expect, it } from "vite-plus/test";

import { generatedVerdict } from "@t3tools/shared/changedFileKind";

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
      generated: undefined,
      shown: PATHS,
      hiddenCount: { tests: 0, generated: 0 },
      total: { tests: 2, generated: 2 },
    },
    {
      hidden: { tests: true, generated: false },
      kept: [],
      generated: undefined,
      shown: ["src/app.ts", "pnpm-lock.yaml", "api/v1/service_pb.ts"],
      hiddenCount: { tests: 2, generated: 0 },
      total: { tests: 2, generated: 2 },
    },
    {
      hidden: { tests: true, generated: true },
      kept: ["pnpm-lock.yaml", null],
      generated: undefined,
      shown: ["src/app.ts", "pnpm-lock.yaml"],
      hiddenCount: { tests: 2, generated: 1 },
      total: { tests: 2, generated: 2 },
    },
    {
      // The server's verdict replaces the naming guess, even for a test.
      hidden: { tests: true, generated: true },
      kept: [],
      generated: ["src/app.ts", "src/app.test.ts"],
      shown: ["pnpm-lock.yaml", "api/v1/service_pb.ts"],
      hiddenCount: { tests: 1, generated: 2 },
      total: { tests: 1, generated: 2 },
    },
  ])("hides $hidden keeping $kept", ({ hidden, kept, generated, shown, hiddenCount, total }) => {
    const filter = filterChangedFiles(PATHS, hidden, kept, generatedVerdict(generated));
    expect(PATHS.filter(filter.isShown)).toEqual(shown);
    expect(filter.hiddenCount).toEqual(hiddenCount);
    expect(filter.total).toEqual(total);
  });
});
