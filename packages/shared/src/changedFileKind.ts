import type { PullRequestChangeBreakdown } from "@t3tools/contracts";

export type ChangedFileKind = keyof NonNullable<PullRequestChangeBreakdown>;

export function summarizeChangedFiles(
  files: ReadonlyArray<{ path: string; additions: number; deletions: number }>,
  isGenerated: (path: string) => boolean = isGeneratedPath,
): NonNullable<PullRequestChangeBreakdown> {
  const empty = () => ({ additions: 0, deletions: 0 });
  const breakdown = {
    code: empty(),
    tests: empty(),
    mocks: empty(),
    generated: empty(),
    docs: empty(),
  };
  for (const file of files) {
    const bucket = breakdown[classifyChangedFile(file.path, isGenerated)];
    bucket.additions += file.additions;
    bucket.deletions += file.deletions;
  }
  return breakdown;
}

const GENERATED_FILES = new Set([
  "bun.lock",
  "bun.lockb",
  "cargo.lock",
  "composer.lock",
  "deno.lock",
  "flake.lock",
  "gemfile.lock",
  "go.sum",
  "gradle.lockfile",
  "mix.lock",
  "npm-shrinkwrap.json",
  "package-lock.json",
  "packages.lock.json",
  "pipfile.lock",
  "pnpm-lock.yaml",
  "podfile.lock",
  "poetry.lock",
  "pubspec.lock",
  "uv.lock",
  "yarn.lock",
]);
// Protobuf plugins stack suffixes (`.pb.validate.go`, `_grpc.pb.go`) and emit `_pb.ts` for JS/TS.
const GENERATED_NAME =
  /(\.generated\.|\.gen\.|\.g\.dart$|\.pb(\.\w+)*\.go$|_pb2(_grpc)?\.pyi?$|\.pb\.(cc|h)$|_(grpc_)?pb\.(d\.)?[cm]?[jt]s$|\.min\.(js|css)$|\.(js|css)\.map$)/;
const GENERATED_DIRS = new Set(["__generated__", "_generated", "generated"]);

const MOCK_NAME =
  /(\.snap$|\.(mocks?|fixtures?|stubs?|fakes?)\.[^.]+$|^(mocks?|fixtures?|stubs?|fakes?)([-_.A-Z]|$))/;
const MOCK_DIRS = new Set([
  "__fixtures__",
  "__mocks__",
  "__snapshots__",
  "fakes",
  "fixture",
  "fixtures",
  "mock",
  "mocks",
  "stubs",
  "testdata",
]);

const TEST_NAME =
  /(\.(test|spec|e2e|eval|stories)\.[^.]+$|_(test|spec)\.[^.]+$|^test_.+\.py$|^conftest\.py$|^(vitest|jest)\.setup\.[^.]+$)/i;
// Case-sensitive: `FooTest.java` is a test class, `Latest.java` is not.
const CLASS_TEST_NAME = /(Tests?|Spec)\.(java|kt|kts|scala|groovy|cs|php|swift|m)$/;
const TEST_DIRS = new Set([
  "__tests__",
  "__test__",
  "cypress",
  "e2e",
  "evals",
  "spec",
  "specs",
  "test",
  "tests",
]);

const DOCS_NAME = /\.(md|mdx|markdown|rst|adoc|txt)$/i;
// Plain-text files that tools read as config or input, not prose.
const NOT_DOCS_NAME = /^(requirements.*|constraints.*|CMakeLists|robots|llms)\.txt$/i;

export type HideableChangedFileGroup = "tests" | "generated";

/** Test support (mocks, fixtures) is hidden with the tests it serves. */
export function hideableChangedFileGroup(
  path: string,
  isGenerated: (path: string) => boolean = isGeneratedPath,
): HideableChangedFileGroup | null {
  const kind = classifyChangedFile(path, isGenerated);
  if (kind === "tests" || kind === "mocks") return "tests";
  return kind === "generated" ? "generated" : null;
}

export function isTestChangedFile(path: string): boolean {
  return hideableChangedFileGroup(path) === "tests";
}

function pathParts(path: string) {
  const segments = path.replaceAll("\\", "/").split("/");
  const name = segments.pop() ?? "";
  const dirs = segments.map((segment) => segment.toLowerCase());
  return { name, inDir: (set: ReadonlySet<string>) => dirs.some((dir) => set.has(dir)) };
}

/** The naming-convention guess, used when nothing better (attributes, file header) is known. */
export function isGeneratedPath(path: string): boolean {
  const { name, inDir } = pathParts(path);
  return (
    GENERATED_FILES.has(name.toLowerCase()) || GENERATED_NAME.test(name) || inDir(GENERATED_DIRS)
  );
}

/** The server's `generatedPaths` lists as a verdict, or the naming guess when any list is unknown. */
export function generatedVerdict(
  ...pathLists: ReadonlyArray<ReadonlyArray<string> | undefined>
): (path: string) => boolean {
  if (pathLists.some((paths) => paths === undefined)) return isGeneratedPath;
  const generated = new Set(pathLists.flatMap((paths) => paths ?? []));
  return (path) => generated.has(path);
}

/**
 * Sorts a changed file using common naming conventions, unless the caller already knows which
 * files are generated. Lockfiles and build output count as generated, and test support (mocks,
 * fixtures, snapshots) is kept apart from the tests themselves, and prose (Markdown, plain text)
 * is its own kind, so a reviewer can see how much of a change is logic.
 */
export function classifyChangedFile(
  path: string,
  isGenerated: (path: string) => boolean = isGeneratedPath,
): ChangedFileKind {
  if (isGenerated(path)) return "generated";
  const { name, inDir } = pathParts(path);
  if (MOCK_NAME.test(name) || inDir(MOCK_DIRS)) return "mocks";
  if (TEST_NAME.test(name) || CLASS_TEST_NAME.test(name) || inDir(TEST_DIRS)) return "tests";
  if (DOCS_NAME.test(name) && !NOT_DOCS_NAME.test(name)) return "docs";
  return "code";
}
