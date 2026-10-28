"use client";

import { functionalUpdate, useTable } from "@tanstack/react-table";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

export interface DataGridControllerOptions<C extends DataGridContract> {
  contract: C;
  columns: readonly DataGridColumnDefinition<NoInfer<C>>[];
  getRowId: (row: DataGridRowData<NoInfer<C>>) => string;
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

/** Internal presentation boundary, not an imitation of a native Query result. */
export interface DataGridAdapter<C extends DataGridContract, Q> {
  query: Q;
  data: DataGridOutput<C> | undefined;
  placeholder: boolean;
  success: boolean;
  failed: boolean;
  fetching: boolean;
  paused: boolean;
  revision: unknown;
}

const getPresentationStatus = <C extends DataGridContract, Q>(
  adapter: DataGridAdapter<C, Q>,
  rowCount: number
) => {
  if (adapter.placeholder) {
    return "placeholder";
  }
  if (adapter.paused) {
    return "paused";
  }
  if (adapter.data !== undefined) {
    if (adapter.failed) {
      return "backgroundError";
    }
    if (adapter.fetching) {
      return "refreshing";
    }
    return rowCount ? "ready" : "empty";
  }
  if (adapter.failed) {
    return "error";
  }
  return adapter.fetching ? "loading" : "inactive";
};

const getPaginationState = <C extends DataGridContract>(
  request: DataGridInput<C>,
  cursorHistory: ReturnType<typeof createDataGridCursorHistory>,
  data: DataGridOutput<C> | undefined,
  placeholder: boolean
) => {
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
    data !== undefined &&
    !placeholder &&
    ("pageIndex" in request.pagination
      ? pageCount !== undefined && request.pagination.pageIndex + 1 < pageCount
      : "nextCursor" in data && data.nextCursor !== null);
  return { canNextPage, canPreviousPage, pageCount, previousCursor };
};

export const useDataGridController = <C extends DataGridContract, Q>(
  options: DataGridControllerOptions<C>,
  useAdapter: (request: DataGridInput<C>) => DataGridAdapter<C, Q>
) => {
  type Request = DataGridInput<C>;
  type RawFilters = DataGridFilterInput<C>;
  type Filters = DataGridFilters<C>;
  type Selection = DataGridSelection<Filters>;
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

  const cancelTimers = useCallback(() => {
    for (const timer of timers.current.values()) {
      clearTimeout(timer);
    }
    timers.current.clear();
  }, []);
  useEffect(() => () => cancelTimers(), [cancelTimers]);

  const changeSelection = useCallback((next: Selection) => {
    if (latest.current.options.state?.selection === undefined) {
      latest.current.selection = next;
      setInternalSelection(next);
    }
    latest.current.options.onStateChange?.selection?.(next);
  }, []);
  const clearSelection = useCallback(() => {
    changeSelection({ ids: [], mode: "explicit" });
  }, [changeSelection]);
  const propose = useCallback(
    (next: Request, filtersChanged = false, resetHistory = false) => {
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
    },
    [clearSelection]
  );
  const transition = useCallback(
    (action: DataGridRequestAction<C>) => {
      const next = transitionDataGridRequest(
        contract,
        latest.current.request,
        action
      );
      if (next.changed) {
        propose(next.request, next.filtersChanged, next.resetCursorHistory);
      }
      return next;
    },
    [contract, propose]
  );
  const writeDraft = useCallback((raw: RawFilters) => {
    draftRef.current = raw;
    setFilterDraft(raw);
  }, []);
  const commitFilters = (raw: RawFilters) => {
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
  };
  const setFilter = <K extends keyof RawFilters & string>(
    field: K,
    value: RawFilters[K],
    config: { debounce?: number } = {}
  ) => {
    clearTimeout(timers.current.get(field));
    timers.current.delete(field);
    writeDraft({ ...draftRef.current, [field]: value });
    setFilterErrors((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([key]) => key !== field)
      )
    );
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
  };
  const setFilters = (raw: RawFilters) => {
    cancelTimers();
    writeDraft(raw);
    if (latest.current.filterMode === "immediate") {
      commitFilters(raw);
    }
  };
  const applyFilters = () => {
    cancelTimers();
    return commitFilters(draftRef.current);
  };
  const resetFilters = () => {
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
  };
  const resetFilter = <K extends keyof RawFilters & string>(field: K) => {
    setFilter(field, baseline.filters[field] as RawFilters[K]);
  };
  const getFilterBinding = <K extends keyof RawFilters & string>(field: K) => ({
    error: filterErrors[field],
    onChange: (value: RawFilters[K]) => setFilter(field, value),
    reset: () => resetFilter(field),
    value: filterDraft[field] as RawFilters[K],
  });

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
  }, [
    filterKey,
    contract,
    request.filters,
    cancelTimers,
    writeDraft,
    clearSelection,
  ]);

  useEffect(() => {
    if (
      previousCursorScope.current !== cursorScopeKey &&
      contract.mode === "cursor"
    ) {
      setCursorHistory(createDataGridCursorHistory(null));
    }
    previousCursorScope.current = cursorScopeKey;
  }, [cursorScopeKey, contract.mode]);

  // Each public adapter supplies one stable hook path. There is no conditional
  // useQuery branch and every request/selection/table transition stays here.
  const adapter = useAdapter(request);
  const { data } = adapter;
  const rows = (data?.rows ?? []) as DataGridRowData<C>[];
  const rowIds = rows.map(options.getRowId);
  if (new Set(rowIds).size !== rowIds.length) {
    throw new Error("DataGrid row IDs must be unique and stable");
  }
  const { placeholder } = adapter;
  const currentData = data !== undefined && !placeholder;
  const canSelectRows = canToggleDataGridSelection({
    current: currentData,
    enabled: selectionMode !== "none",
    placeholder,
  });
  const [correction, setCorrection] = useState<string | null>(null);
  useEffect(() => {
    if (!adapter.success || placeholder || !data) {
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
    adapter.success,
    placeholder,
    adapter.revision,
    data,
    contract.mode,
    request.pagination,
    correction,
    transition,
  ]);

  const setColumnVisibility = (next: ColumnVisibilityState) => {
    const normalized = normalizeDataGridColumnVisibility(next, columns);
    if (latest.current.options.state?.columnVisibility === undefined) {
      setInternalVisibility(normalized);
    }
    latest.current.options.onStateChange?.columnVisibility?.(normalized);
  };
  const setColumnOrder = (next: string[]) => {
    const normalized = normalizeDataGridColumnOrder(next, columns);
    if (latest.current.options.state?.columnOrder === undefined) {
      setInternalOrder(normalized);
    }
    latest.current.options.onStateChange?.columnOrder?.(normalized);
  };
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
      if (contract.mode !== "page") {
        return;
      }
      const previous = table.state.pagination;
      const next = functionalUpdate(updater, previous);
      transition(
        next.pageSize === previous.pageSize
          ? { type: "pageIndex", value: next.pageIndex }
          : { type: "pageSize", value: next.pageSize }
      );
    },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, table.state.sorting);
      const seen = new Set<string>();
      const backend = next.flatMap((sort) => {
        const id = columns.find((column) => column.id === sort.id)?.meta
          .dataGrid.sortBy;
        if (!id || seen.has(id)) {
          return [];
        }
        seen.add(id);
        return [{ desc: sort.desc, id }];
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
        desc: sort.desc,
        id:
          columns.find((column) => column.meta.dataGrid.sortBy === sort.id)
            ?.id ?? sort.id,
      })),
    },
  });

  const { previousCursor, pageCount, canPreviousPage, canNextPage } =
    getPaginationState(request, cursorHistory, data, placeholder);
  const nextPage = () => {
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
  };
  const previousPage = () => {
    if (!canPreviousPage) {
      return;
    }
    if ("pageIndex" in request.pagination) {
      transition({
        type: "pageIndex",
        value: request.pagination.pageIndex - 1,
      });
    } else {
      // Availability guarantees an existing entry (including the first null cursor).
      transition({
        type: "cursor",
        value: previousCursor.cursor as string | null,
      });
    }
  };
  const status = getPresentationStatus(adapter, rows.length);
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
    query: adapter.query,
    request,
    resetFilter,
    resetFilters,
    selectAllMatching: () => {
      if (canSelectRows && selectionMode === "allMatching") {
        changeSelection(
          createDataGridAllMatchingSelection(request.filters as Filters)
        );
      }
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
      if (canSelectRows) {
        changeSelection(
          toggleDataGridPage(latest.current.selection, rowIds, checked)
        );
      }
    },
    toggleRow: (id: string, checked?: boolean) => {
      if (canSelectRows && rowIds.includes(id)) {
        changeSelection(
          toggleDataGridRow(latest.current.selection, id, checked)
        );
      }
    },
  };
  const pageActions = {
    setPageIndex: (value: number) => transition({ type: "pageIndex", value }),
  };
  return Object.assign(
    common,
    contract.mode === "page" ? pageActions : {}
  ) as typeof common &
    (C["mode"] extends "page" ? typeof pageActions : Record<never, never>);
};
