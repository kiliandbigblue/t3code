import type { HideableChangedFileGroup } from "@t3tools/shared/changedFileKind";
import * as Schema from "effect/Schema";

import { useLocalStorage } from "~/hooks/useLocalStorage";
import type { HiddenChangedFileGroups } from "./changedFileFilter.logic";

export function useHiddenChangedFileGroups() {
  const [tests, setTests] = useLocalStorage("t3code.diffHideTestFiles", false, Schema.Boolean);
  const [generated, setGenerated] = useLocalStorage(
    "t3code.diffHideGeneratedFiles",
    false,
    Schema.Boolean,
  );
  const hidden: HiddenChangedFileGroups = { tests, generated };
  const setHidden = (group: HideableChangedFileGroup, value: boolean) =>
    (group === "tests" ? setTests : setGenerated)(value);
  return [hidden, setHidden] as const;
}
