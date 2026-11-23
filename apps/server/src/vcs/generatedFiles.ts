import { isGeneratedPath } from "@t3tools/shared/changedFileKind";

/** How far from the top of a file a generator's marker counts. */
const GENERATED_HEADER_LINES = 10;

/**
 * For `git grep -i -E`: an `@generated` token, or a line saying both "generated" and "do not edit"
 * (Go's `Code generated … DO NOT EDIT.`, protoc's banners). Prose such as "ids are auto-generated"
 * is not a banner, and a false match would hide hand-written code from review.
 */
export const GENERATED_HEADER_PATTERN =
  "@generated([^[:alnum:]_]|$)|generated.*do not edit|do not edit.*generated";

/** Reads `git check-attr -z linguist-generated`; a path is absent when the repository is silent. */
export function parseLinguistGenerated(stdout: string): ReadonlyMap<string, boolean> {
  const fields = stdout.split("\0");
  const verdicts = new Map<string, boolean>();
  for (let index = 0; index + 2 < fields.length; index += 3) {
    const value = fields[index + 2];
    if (value === "set" || value === "true") verdicts.set(fields[index]!, true);
    else if (value === "unset" || value === "false") verdicts.set(fields[index]!, false);
  }
  return verdicts;
}

/** Reads `git grep -z -n -o`, keeping paths whose marker sits within the header lines. */
export function parseGeneratedHeaderMatches(
  stdout: string,
  revision: string | null,
): ReadonlySet<string> {
  const prefix = revision === null ? "" : `${revision}:`;
  const paths = new Set<string>();
  for (const record of stdout.split("\n")) {
    const [path, line] = record.split("\0");
    if (path === undefined || line === undefined || Number(line) > GENERATED_HEADER_LINES) continue;
    paths.add(path.startsWith(prefix) ? path.slice(prefix.length) : path);
  }
  return paths;
}

/** Like GitHub's Linguist: `linguist-generated` decides, then a header marker or the file name. */
export function selectGeneratedPaths(
  paths: ReadonlyArray<string>,
  attributes: ReadonlyMap<string, boolean>,
  headers: ReadonlySet<string>,
): ReadonlyArray<string> {
  return paths.filter(
    (path) => attributes.get(path) ?? (headers.has(path) || isGeneratedPath(path)),
  );
}
