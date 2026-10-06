import type { DataGridSelection } from "./data-grid-schema";

export function isDataGridRowSelected<F>(
  selection: DataGridSelection<F>,
  id: string
) {
  return selection.mode === "explicit"
    ? selection.ids.includes(id)
    : !selection.excludedIds.includes(id);
}

export function toggleDataGridRow<F>(
  selection: DataGridSelection<F>,
  id: string,
  checked = !isDataGridRowSelected(selection, id)
) {
  return toggleDataGridPage(selection, [id], checked);
}

export function toggleDataGridPage<F>(
  selection: DataGridSelection<F>,
  ids: readonly string[],
  checked: boolean
): DataGridSelection<F> {
  const explicit = selection.mode === "explicit";
  const next = new Set(explicit ? selection.ids : selection.excludedIds);
  for (const id of ids) {
    if (checked === explicit) {
      next.add(id);
    } else {
      next.delete(id);
    }
  }
  return selection.mode === "explicit"
    ? { ids: [...next], mode: "explicit" }
    : { ...selection, excludedIds: [...next] };
}

export function getDataGridPageSelection<F>(
  selection: DataGridSelection<F>,
  ids: readonly string[]
) {
  const unique = [...new Set(ids)];
  const selected = unique.filter((id) =>
    isDataGridRowSelected(selection, id)
  ).length;
  const total = unique.length;
  return {
    checked: total > 0 && selected === total,
    indeterminate: selected > 0 && selected < total,
    selected,
    total,
  };
}

export function createDataGridAllMatchingSelection<F>(
  filters: F
): DataGridSelection<F> {
  return {
    excludedIds: [],
    filters: structuredClone(filters),
    mode: "allMatching",
  };
}

export function canToggleDataGridSelection({
  enabled,
  placeholder,
  current,
}: {
  enabled: boolean;
  placeholder: boolean;
  current: boolean;
}) {
  return enabled && current && !placeholder;
}
