"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { functionalUpdate, useTable } from "@tanstack/react-table";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  dataGridFeatures,
  normalizeDataGridColumnOrder,
  normalizeDataGridColumnVisibility,
  normalizeDataGridColumns,
} from "./data-grid-columns";
import type { DataGridColumnDefinition } from "./data-grid-columns";
import type {
  DataGridContract,
  DataGridFilterInput,
  DataGridFilters,
  DataGridInput,
  DataGridOutput,
  DataGridRawInput,
  DataGridRowData,
  DataGridSelection,
} from "./data-grid-schema";
import {
  canToggleDataGridSelection,
  createDataGridAllMatchingSelection,
  getDataGridPageSelection,
  isDataGridRowSelected,
  toggleDataGridPage,
  toggleDataGridRow,
} from "./data-grid-selection";
import {
  commitDataGridCursor,
  createDataGridCursorHistory,
  equalDataGridValues,
  getDataGridPageCorrection,
  getDataGridPreviousCursor,
  restoreDataGridFilterDraft,
  serializeDataGridValue,
  transitionDataGridRequest,
  validateDataGridFilters,
} from "./data-grid-state";
import type { DataGridRequestAction } from "./data-grid-state";

type QueryFactory<C extends DataGridContract> = (input: DataGridInput<C>) => {
  queryKey: QueryKey;
};
type Selected<O> = O extends { select?: (raw: never) => infer S }
  ? S
  : O extends { queryFn?: (context: never) => infer R }
    ? Awaited<R>
    : never;
type QueryParts<O> =
  O extends UseQueryOptions<infer R, infer E, infer S, infer K>
    ? { raw: R; error: E; selected: S; key: K }
    : never;
interface Options<C extends DataGridContract, F extends QueryFactory<C>> {
  contract: C;
  columns: readonly DataGridColumnDefinition<NoInfer<C>>[];
  getRowId: (row: DataGridRowData<NoInfer<C>>) => string;
  queryOptions: F;
  initialState?: Partial<DataGridRawInput<C>>;
  filterMode?: "immediate" | "apply";
  selectionMode?: "none" | "explicit" | "allMatching";
  state?: {
    request?: DataGridInput<C>;
    columnVisibility?: ColumnVisibilityState;
    columnOrder?: string[];
    selection?: DataGridSelection<DataGridFilters<C>>;
  };
  onStateChange?: {
    request?: (request: DataGridInput<C>) => void;
    columnVisibility?: (visibility: ColumnVisibilityState) => void;
    columnOrder?: (order: string[]) => void;
    selection?: (selection: DataGridSelection<DataGridFilters<C>>) => void;
  };
}

export function useDataGrid<
  C extends DataGridContract,
  F extends QueryFactory<C>,
>(
  options: Options<C, F>,
  ..._proof: Selected<ReturnType<F>> extends DataGridOutput<C>
    ? []
    : [invalidQueryOutput: never]
) {
  type Request = DataGridInput<C>;
  type RawFilters = DataGridFilterInput<C>;
  type Filters = DataGridFilters<C>;
  type Selection = DataGridSelection<Filters>;
  type Native = QueryParts<ReturnType<F>>;
  const {
    contract,
    filterMode = "immediate",
    selectionMode = "none",
  } = options;
  const columns = useMemo(
    () => normalizeDataGridColumns(options.columns),
    [options.columns]
  );
  const [baseline] = useState(() => {
    const raw = {
      ...options.initialState,
      filters: options.initialState?.filters ?? {},
    };
    const parsed = contract.input.parse(raw) as Request;
    let filters: RawFilters;
    try {
      filters = restoreDataGridFilterDraft(contract, parsed.filters as Filters);
    } catch {
      filters = structuredClone(raw.filters) as RawFilters;
    }
    return { filters, request: parsed };
  });
  const [internalRequest, setInternalRequest] = useState(baseline.request);
  const request = options.state?.request ?? internalRequest;
  const requestKey = serializeDataGridValue(request);
  const filterKey = serializeDataGridValue(request.filters);
  const [filterDraft, setFilterDraft] = useState<RawFilters>(() =>
    options.state?.request
      ? restoreDataGridFilterDraft(contract, request.filters as Filters)
      : baseline.filters
  );
  const [filterErrors, setFilterErrors] = useState<Record<string, string>>({});
  const [filterFormErrors, setFilterFormErrors] = useState<string[]>([]);
  const [internalSelection, setInternalSelection] = useState<Selection>({
    ids: [],
    mode: "explicit",
  });
  const selection = options.state?.selection ?? internalSelection;
  const [internalVisibility, setInternalVisibility] =
    useState<ColumnVisibilityState>({});
  const [internalOrder, setInternalOrder] = useState<string[]>([]);
  const columnVisibility = normalizeDataGridColumnVisibility(
    options.state?.columnVisibility ?? internalVisibility,
    columns
  );
  const columnOrder = normalizeDataGridColumnOrder(
    options.state?.columnOrder ?? internalOrder,
    columns
  );
  const [cursorHistory, setCursorHistory] = useState(() =>
    createDataGridCursorHistory(
      "cursor" in request.pagination ? request.pagination.cursor : null
    )
  );
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const draftRef = useRef(filterDraft);
  const rawApplied = useRef(filterDraft);
  const knownDraft = useRef({ key: filterKey, raw: filterDraft });
  const previousFilters = useRef(filterKey);
  const cursorScopeKey = serializeDataGridValue({
    filters: request.filters,
    pageSize: request.pagination.pageSize,
    sorting: request.sorting,
  });
  const previousCursorScope = useRef(cursorScopeKey);
  const latest = useRef({ filterMode, options, request, selection });
  latest.current = { filterMode, options, request, selection };
  draftRef.current = filterDraft;

  function cancelTimers() {
    for (const timer of timers.current.values()) {
      clearTimeout(timer);
    }
    timers.current.clear();
  }
  useEffect(() => () => cancelTimers(), []);

  function changeSelection(next: Selection) {
    if (latest.current.options.state?.selection === undefined) {
      latest.current.selection = next;
      setInternalSelection(next);
    }
    latest.current.options.onStateChange?.selection?.(next);
  }
  function clearSelection() {
    changeSelection({ ids: [], mode: "explicit" });
  }
  function propose(
    next: Request,
    filtersChanged = false,
    resetHistory = false
  ) {
    if (latest.current.options.state?.request === undefined) {
      if (filtersChanged) {
        clearSelection();
      }
      if (resetHistory) {
        setCursorHistory(createDataGridCursorHistory(null));
      }
      latest.current.request = next;
      setInternalRequest(next);
    }
    latest.current.options.onStateChange?.request?.(next);
  }
  function transition(action: DataGridRequestAction<C>) {
    const next = transitionDataGridRequest(
      contract,
      latest.current.request,
      action
    );
    if (next.changed) {
      propose(next.request, next.filtersChanged, next.resetCursorHistory);
    }
    return next;
  }
  function writeDraft(raw: RawFilters) {
    draftRef.current = raw;
    setFilterDraft(raw);
  }
  function commitFilters(raw: RawFilters) {
    const valid = validateDataGridFilters(contract, raw);
    setFilterErrors(valid.fieldErrors);
    setFilterFormErrors(valid.formErrors);
    if (!valid.success) {
      return false;
    }
    // Validation parsed the raw draft once. Never pass it through input.parse again.
    const current = latest.current.request;
    const changed = !equalDataGridValues(current.filters, valid.filters);
    if (latest.current.options.state?.request === undefined || !changed) {
      rawApplied.current = structuredClone(raw);
    }
    knownDraft.current = {
      key: serializeDataGridValue(valid.filters),
      raw: structuredClone(raw),
    };
    if (changed) {
      const pagination = contract.pagination.parse(
        contract.mode === "page"
          ? { pageIndex: 0, pageSize: current.pagination.pageSize }
          : { cursor: null, pageSize: current.pagination.pageSize }
      );
      propose(
        { ...current, filters: valid.filters, pagination } as Request,
        true,
        contract.mode === "cursor"
      );
    }
    return true;
  }
  function setFilter<K extends keyof RawFilters & string>(
    field: K,
    value: RawFilters[K],
    config: { debounce?: number } = {}
  ) {
    clearTimeout(timers.current.get(field));
    timers.current.delete(field);
    writeDraft({ ...draftRef.current, [field]: value });
    setFilterErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
    if (latest.current.filterMode === "apply") {
      return;
    }
    const commit = () => {
      timers.current.delete(field);
      commitFilters({ ...rawApplied.current, [field]: value });
    };
    if (config.debounce && config.debounce > 0) {
      timers.current.set(field, setTimeout(commit, config.debounce));
    } else {
      commit();
    }
  }
  function setFilters(raw: RawFilters) {
    cancelTimers();
    writeDraft(raw);
    if (latest.current.filterMode === "immediate") {
      commitFilters(raw);
    }
  }
  function applyFilters() {
    cancelTimers();
    return commitFilters(draftRef.current);
  }
  function resetFilters() {
    cancelTimers();
    const raw = structuredClone(baseline.filters);
    writeDraft(raw);
    setFilterErrors({});
    setFilterFormErrors([]);
    const current = latest.current.request;
    const changed = !equalDataGridValues(
      current.filters,
      baseline.request.filters
    );
    if (latest.current.options.state?.request === undefined || !changed) {
      rawApplied.current = raw;
    }
    knownDraft.current = {
      key: serializeDataGridValue(baseline.request.filters),
      raw,
    };
    const pagination = contract.pagination.parse(
      contract.mode === "page"
        ? { pageIndex: 0, pageSize: current.pagination.pageSize }
        : { cursor: null, pageSize: current.pagination.pageSize }
    );
    const next = {
      ...current,
      filters: baseline.request.filters,
      pagination,
    } as Request;
    if (!equalDataGridValues(current, next)) {
      propose(next, changed, contract.mode === "cursor");
    }
  }
  function resetFilter<K extends keyof RawFilters & string>(field: K) {
    setFilter(field, baseline.filters[field] as RawFilters[K]);
  }
  function getFilterBinding<K extends keyof RawFilters & string>(field: K) {
    return {
      error: filterErrors[field],
      onChange: (value: RawFilters[K]) => setFilter(field, value),
      reset: () => resetFilter(field),
      value: filterDraft[field] as RawFilters[K],
    };
  }

  useEffect(() => {
    if (previousFilters.current === filterKey) {
      return;
    }
    const raw =
      knownDraft.current.key === filterKey
        ? knownDraft.current.raw
        : restoreDataGridFilterDraft(contract, request.filters as Filters);
    // An accepted own transition keeps pending edits to other fields. External
    // restoration cancels all pending edits and rebases the complete raw draft.
    if (knownDraft.current.key !== filterKey) {
      cancelTimers();
      writeDraft(raw);
      setFilterErrors({});
      setFilterFormErrors([]);
    }
    if (latest.current.options.state?.request !== undefined) {
      clearSelection();
      setCursorHistory(createDataGridCursorHistory(null));
    }
    rawApplied.current = raw;
    knownDraft.current = { key: filterKey, raw };
    previousFilters.current = filterKey;
  }, [filterKey]);

  useEffect(() => {
    if (
      previousCursorScope.current !== cursorScopeKey &&
      contract.mode === "cursor"
    ) {
      setCursorHistory(createDataGridCursorHistory(null));
    }
    previousCursorScope.current = cursorScopeKey;
  }, [cursorScopeKey]);

  const nativeOptions = options.queryOptions(request) as UseQueryOptions<
    Native["raw"],
    Native["error"],
    Selected<ReturnType<F>>,
    Native["key"]
  >;
  const query = useQuery(nativeOptions);
  const data = query.data as DataGridOutput<C> | undefined;
  const rows = (data?.rows ?? []) as DataGridRowData<C>[];
  const rowIds = rows.map(options.getRowId);
  if (new Set(rowIds).size !== rowIds.length) {
    throw new Error("DataGrid row IDs must be unique and stable");
  }
  const placeholder = query.isPlaceholderData;
  const currentData = data !== undefined && !placeholder;
  const canSelectRows = canToggleDataGridSelection({
    current: currentData,
    enabled: selectionMode !== "none",
    placeholder,
  });
  const [correction, setCorrection] = useState<string | null>(null);
  useEffect(() => {
    if (!query.isSuccess || query.isPlaceholderData || !data) {
      return;
    }
    if (contract.mode === "cursor" && "cursor" in request.pagination) {
      const { cursor } = request.pagination;
      setCursorHistory((previous) => commitDataGridCursor(previous, cursor));
    } else if ("pageIndex" in request.pagination && "rowCount" in data) {
      const last = getDataGridPageCorrection(request.pagination, data.rowCount);
      if (last !== null && correction !== requestKey) {
        setCorrection(requestKey);
        transition({ type: "pageIndex", value: last });
      }
    }
  }, [
    requestKey,
    query.isSuccess,
    query.isPlaceholderData,
    query.dataUpdatedAt,
  ]);

  function setColumnVisibility(next: ColumnVisibilityState) {
    const normalized = normalizeDataGridColumnVisibility(next, columns);
    if (latest.current.options.state?.columnVisibility === undefined) {
      setInternalVisibility(normalized);
    }
    latest.current.options.onStateChange?.columnVisibility?.(normalized);
  }
  function setColumnOrder(next: string[]) {
    const normalized = normalizeDataGridColumnOrder(next, columns);
    if (latest.current.options.state?.columnOrder === undefined) {
      setInternalOrder(normalized);
    }
    latest.current.options.onStateChange?.columnOrder?.(normalized);
  }
  const table = useTable({
    autoResetPageIndex: false,
    columns,
    data: rows,
    features: dataGridFeatures,
    getRowId: options.getRowId,
    manualPagination: true,
    manualSorting: true,
    onColumnOrderChange: (updater) =>
      setColumnOrder(functionalUpdate(updater, columnOrder)),
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility(functionalUpdate(updater, columnVisibility)),
    onPaginationChange: (updater) => {
      if (contract.mode !== "page") return;
      const previous = table.state.pagination;
      const next = functionalUpdate(updater, previous);
      transition(
        next.pageSize !== previous.pageSize
          ? { type: "pageSize", value: next.pageSize }
          : { type: "pageIndex", value: next.pageIndex }
      );
    },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, table.state.sorting);
      const seen = new Set<string>();
      const backend = next.flatMap((sort) => {
        const id = columns.find((column) => column.id === sort.id)?.meta
          .dataGrid.sortBy;
        if (!id || seen.has(id)) return [];
        seen.add(id);
        return [{ id, desc: sort.desc }];
      });
      transition({ type: "sorting", value: backend as Request["sorting"] });
    },
    rowCount: data && "rowCount" in data ? data.rowCount : undefined,
    sortDescFirst: false,
    state: {
      columnOrder,
      columnVisibility,
      pagination:
        "pageIndex" in request.pagination
          ? request.pagination
          : {
              pageIndex: cursorHistory.index,
              pageSize: request.pagination.pageSize,
            },
      sorting: request.sorting.map((sort) => ({
        id:
          columns.find((column) => column.meta.dataGrid.sortBy === sort.id)
            ?.id ?? sort.id,
        desc: sort.desc,
      })),
    },
  });

  const previousCursor =
    "cursor" in request.pagination &&
    request.pagination.cursor !== cursorHistory.cursors[cursorHistory.index]
      ? { available: true, cursor: cursorHistory.cursors[cursorHistory.index] }
      : getDataGridPreviousCursor(cursorHistory);
  const pageCount =
    data && "rowCount" in data
      ? Math.max(1, Math.ceil(data.rowCount / request.pagination.pageSize))
      : undefined;
  const canPreviousPage =
    !placeholder &&
    ("pageIndex" in request.pagination
      ? request.pagination.pageIndex > 0
      : previousCursor.available);
  const canNextPage =
    currentData &&
    ("pageIndex" in request.pagination
      ? pageCount !== undefined && request.pagination.pageIndex + 1 < pageCount
      : data !== undefined && "nextCursor" in data && data.nextCursor !== null);
  function nextPage() {
    if (!canNextPage) {
      return;
    }
    if ("pageIndex" in request.pagination) {
      transition({
        type: "pageIndex",
        value: request.pagination.pageIndex + 1,
      });
    } else if (data && "nextCursor" in data) {
      transition({ type: "cursor", value: data.nextCursor });
    }
  }
  function previousPage() {
    if (!canPreviousPage) {
      return;
    }
    if ("pageIndex" in request.pagination) {
      transition({
        type: "pageIndex",
        value: request.pagination.pageIndex - 1,
      });
    } else {
      transition({ type: "cursor", value: previousCursor.cursor });
    }
  }
  const status = placeholder
    ? "placeholder"
    : query.fetchStatus === "paused"
      ? "paused"
      : currentData
        ? query.isError
          ? "backgroundError"
          : query.isFetching
            ? "refreshing"
            : rows.length
              ? "ready"
              : "empty"
        : query.isError
          ? "error"
          : query.fetchStatus === "fetching"
            ? "loading"
            : "inactive";
  const common = {
    applyFilters,
    canNextPage,
    canPreviousPage,
    canSelectRows,
    clearSelection,
    columnOrder,
    columnVisibility,
    columns,
    contract,
    cursorHistory,
    filterDirty: !equalDataGridValues(filterDraft, rawApplied.current),
    filterDraft,
    filterErrors,
    filterFormErrors,
    filterMode,
    filtered: !equalDataGridValues(request.filters, baseline.request.filters),
    getFilterBinding,
    isRowSelected: (id: string) => isDataGridRowSelected(selection, id),
    nextPage,
    pageCount,
    pageSelection: getDataGridPageSelection(selection, rowIds),
    presentation: {
      currentData,
      hasRows: rows.length > 0,
      placeholder,
      status,
    },
    previousPage,
    query: query as UseQueryResult<Selected<ReturnType<F>>, Native["error"]>,
    request,
    resetFilter,
    resetFilters,
    selectAllMatching: () => {
      if (canSelectRows && selectionMode === "allMatching")
        changeSelection(
          createDataGridAllMatchingSelection(request.filters as Filters)
        );
    },
    selection,
    selectionMode,
    setColumnOrder,
    setColumnVisibility,
    setFilter,
    setFilters,
    setPageSize: (value: number) => transition({ type: "pageSize", value }),
    setSorting: (value: Request["sorting"]) =>
      transition({ type: "sorting", value }),
    table,
    togglePage: (checked: boolean) => {
      if (canSelectRows)
        changeSelection(
          toggleDataGridPage(latest.current.selection, rowIds, checked)
        );
    },
    toggleRow: (id: string, checked?: boolean) => {
      if (canSelectRows && rowIds.includes(id))
        changeSelection(
          toggleDataGridRow(latest.current.selection, id, checked)
        );
    },
  };
  const pageActions = {
    setPageIndex: (value: number) => transition({ type: "pageIndex", value }),
  };
  return Object.assign(
    common,
    contract.mode === "page" ? pageActions : {}
  ) as typeof common & (C["mode"] extends "page" ? typeof pageActions : {});
}

export type DataGridController<C extends DataGridContract> = ReturnType<
  typeof useDataGrid<
    C,
    (
      input: DataGridInput<C>
    ) => UseQueryOptions<
      DataGridOutput<C>,
      unknown,
      DataGridOutput<C>,
      QueryKey
    >
  >
>;
