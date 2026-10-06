import { z } from "zod";

import type {
  DataGridContract,
  DataGridFilterInput,
  DataGridFilters,
  DataGridInput,
} from "./data-grid-schema";

/** Stable comparison for JSON wire values; rejects accidental Date/class values. */
export function serializeDataGridValue(value: unknown): string {
  function normalize(item: unknown): unknown {
    if (
      item === null ||
      typeof item === "string" ||
      typeof item === "boolean"
    ) {
      return item;
    }
    if (typeof item === "number" && Number.isFinite(item)) {
      return item;
    }
    if (Array.isArray(item)) {
      return item.map(normalize);
    }
    if (
      typeof item === "object" &&
      Object.getPrototypeOf(item) === Object.prototype
    ) {
      const record = item as Record<string, unknown>;
      return Object.fromEntries(
        Object.keys(record)
          .toSorted()
          .filter((key) => record[key] !== undefined)
          .map((key) => [key, normalize(record[key])])
      );
    }
    throw new Error("DataGrid values must be JSON serializable");
  }
  return JSON.stringify(normalize(value));
}

export function equalDataGridValues(a: unknown, b: unknown) {
  return serializeDataGridValue(a) === serializeDataGridValue(b);
}

/** Restore raw controls from normalized state without re-running transforms. */
export function restoreDataGridFilterDraft<C extends DataGridContract>(
  contract: C,
  filters: DataGridFilters<C>
): DataGridFilterInput<C> {
  try {
    return z.encode(contract.filters, filters) as DataGridFilterInput<C>;
  } catch (error) {
    throw new Error(
      "DataGrid cannot restore this filter draft. Use a reversible Zod codec for filters with transforms that need external restoration.",
      { cause: error }
    );
  }
}

export type DataGridRequestAction<C extends DataGridContract> =
  | { type: "filters"; value: DataGridFilterInput<C> }
  | { type: "sorting"; value: DataGridInput<C>["sorting"] }
  | { type: "pageSize"; value: number }
  | { type: "pageIndex"; value: number }
  | { type: "cursor"; value: string | null };

export function transitionDataGridRequest<C extends DataGridContract>(
  contract: C,
  current: DataGridInput<C>,
  action: DataGridRequestAction<C>
) {
  let { filters } = current;
  let { sorting } = current;
  let { pagination } = current;
  let reset = false;
  let filtersChanged = false;
  if (action.type === "filters") {
    filters = contract.filters.parse(action.value);
    filtersChanged = !equalDataGridValues(current.filters, filters);
    reset = filtersChanged;
  } else if (action.type === "sorting") {
    sorting = contract.sorting.parse(action.value);
    reset = !equalDataGridValues(current.sorting, sorting);
  } else if (action.type === "pageSize") {
    pagination = contract.pagination.parse({
      ...current.pagination,
      pageSize: action.value,
    });
    reset = pagination.pageSize !== current.pagination.pageSize;
  } else if (action.type === "pageIndex") {
    if (contract.mode !== "page") {
      throw new Error("Page index is only available in page mode");
    }
    pagination = contract.pagination.parse({
      ...current.pagination,
      pageIndex: action.value,
    });
  } else {
    if (contract.mode !== "cursor") {
      throw new Error("Cursor navigation is only available in cursor mode");
    }
    pagination = contract.pagination.parse({
      ...current.pagination,
      cursor: action.value,
    });
  }
  if (reset) {
    pagination = contract.pagination.parse(
      contract.mode === "page"
        ? { pageIndex: 0, pageSize: pagination.pageSize }
        : { cursor: null, pageSize: pagination.pageSize }
    );
  }
  const request = { filters, pagination, sorting } as DataGridInput<C>;
  return {
    changed: !equalDataGridValues(current, request),
    filtersChanged,
    request,
    resetCursorHistory: reset && contract.mode === "cursor",
  };
}

export type DataGridFilterValidation<C extends DataGridContract> =
  | {
      success: true;
      filters: DataGridFilters<C>;
      fieldErrors: Record<string, string>;
      formErrors: string[];
    }
  | {
      success: false;
      fieldErrors: Record<string, string>;
      formErrors: string[];
    };

export function validateDataGridFilters<C extends DataGridContract>(
  contract: C,
  draft: unknown
): DataGridFilterValidation<C> {
  const result = contract.filters.safeParse(draft);
  if (result.success) {
    serializeDataGridValue(result.data);
    return {
      fieldErrors: {},
      filters: result.data as DataGridFilters<C>,
      formErrors: [],
      success: true,
    };
  }
  const fieldErrors: Record<string, string> = {};
  const formErrors: string[] = [];
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string") {
      fieldErrors[field] ??= issue.message;
    } else {
      formErrors.push(issue.message);
    }
  }
  return { fieldErrors, formErrors, success: false };
}

export interface DataGridCursorHistory {
  cursors: (string | null)[];
  index: number;
}

export function createDataGridCursorHistory(
  cursor: string | null
): DataGridCursorHistory {
  return { cursors: [cursor], index: 0 };
}

/** Called only for successful, current-input (never placeholder) responses. */
export function commitDataGridCursor(
  history: DataGridCursorHistory,
  cursor: string | null
): DataGridCursorHistory {
  if (history.cursors[history.index] === cursor) {
    return history;
  }
  const previous =
    history.index > 0
      ? history.cursors.lastIndexOf(cursor, history.index - 1)
      : -1;
  if (previous >= 0) {
    return { cursors: history.cursors, index: previous };
  }
  const forward = history.cursors[history.index + 1];
  if (forward === cursor) {
    return { cursors: history.cursors, index: history.index + 1 };
  }
  const cursors = [...history.cursors.slice(0, history.index + 1), cursor];
  return { cursors, index: cursors.length - 1 };
}

export function getDataGridPreviousCursor(history: DataGridCursorHistory) {
  return {
    available: history.index > 0,
    cursor: history.index > 0 ? history.cursors[history.index - 1] : null,
  };
}

export function getDataGridPageCorrection(
  pagination: { pageIndex: number; pageSize: number },
  rowCount: number
) {
  const last = Math.max(0, Math.ceil(rowCount / pagination.pageSize) - 1);
  return pagination.pageIndex > last ? last : null;
}
