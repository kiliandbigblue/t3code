import type { HideableChangedFileGroup } from "@t3tools/shared/changedFileKind";
import { useGT } from "gt-react";
import { FileCogIcon, FlaskConicalOffIcon } from "lucide-react";

import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle-group";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { type ChangedFileFilter, HIDEABLE_CHANGED_FILE_GROUPS } from "./changedFileFilter.logic";

type SetGroupHidden = (group: HideableChangedFileGroup, hidden: boolean) => void;

const GROUP_ICONS = { tests: FlaskConicalOffIcon, generated: FileCogIcon };

export function HideChangedFilesToggles({
  filter,
  onHiddenChange,
}: {
  filter: ChangedFileFilter;
  onHiddenChange: SetGroupHidden;
}) {
  const gt = useGT();
  return HIDEABLE_CHANGED_FILE_GROUPS.map((group) => {
    if (filter.total[group] === 0) return null;
    const Icon = GROUP_ICONS[group];
    const count = filter.hiddenCount[group];
    const hideLabel = group === "tests" ? gt("Hide test files") : gt("Hide generated files");
    const showLabel =
      group === "tests"
        ? gt(
            "{count, plural, one {Show {count} hidden test file} other {Show {count} hidden test files}}",
            { count },
          )
        : gt(
            "{count, plural, one {Show {count} hidden generated file} other {Show {count} hidden generated files}}",
            { count },
          );
    return (
      <Tooltip key={group}>
        <TooltipTrigger
          render={
            <Toggle
              aria-label={hideLabel}
              variant="ghost"
              size="sm"
              pressed={filter.hidden[group]}
              onPressedChange={(pressed) => onHiddenChange(group, Boolean(pressed))}
            />
          }
        >
          <Icon className="size-3.5" />
        </TooltipTrigger>
        <TooltipPopup side="top">{filter.hidden[group] ? showLabel : hideLabel}</TooltipPopup>
      </Tooltip>
    );
  });
}

export function HiddenChangedFilesButtons({
  filter,
  onHiddenChange,
}: {
  filter: ChangedFileFilter;
  onHiddenChange: SetGroupHidden;
}) {
  const gt = useGT();
  return HIDEABLE_CHANGED_FILE_GROUPS.map((group) => {
    const count = filter.hiddenCount[group];
    if (count === 0) return null;
    return (
      <Button
        key={group}
        type="button"
        size="xs"
        variant="link"
        onClick={() => onHiddenChange(group, false)}
      >
        {group === "tests"
          ? gt(
              "{count, plural, one {{count} test file hidden} other {{count} test files hidden}}",
              { count },
            )
          : gt(
              "{count, plural, one {{count} generated file hidden} other {{count} generated files hidden}}",
              { count },
            )}
      </Button>
    );
  });
}
