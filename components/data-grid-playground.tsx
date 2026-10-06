"use client";

import { queryOptions } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ComponentPlayground } from "@/components/component-playground";
import { DataGridExampleProvider } from "@/examples/data-grid-demo";
import {
  cursorUsersGrid,
  listCursorDemoUsers,
  listDemoUsers,
  usersGrid,
} from "@/examples/data-grid-demo-data";
import {
  dataGridProps,
  getDataGridCode,
  getDataGridDefaults,
} from "@/lib/data-grid-playground";
import type { DataGridPlaygroundValues } from "@/lib/data-grid-playground";
import {
  DataGrid,
  DataGridApplyFilters,
  DataGridColumnVisibility,
  DataGridPagination,
  DataGridResetFilters,
  DataGridSearch,
  DataGridSelectionBar,
  DataGridTable,
  DataGridToolbar,
  DataGridViewport,
} from "@/registry/new-york/data-grid";
import { createDataGridColumnHelper } from "@/registry/new-york/data-grid-columns";
import { useDataGrid } from "@/registry/new-york/use-data-grid";

const pageColumn = createDataGridColumnHelper(usersGrid);
const pageColumns = [
  pageColumn.accessor("name", { header: "Name", sortBy: "name" }),
];
const cursorColumn = createDataGridColumnHelper(cursorUsersGrid);
const cursorColumns = [
  cursorColumn.accessor("name", { header: "Name", sortBy: "name" }),
];

async function scenario<T>(
  config: DataGridPlaygroundValues,
  signal: AbortSignal,
  load: () => Promise<T>,
  empty: NoInfer<T>
) {
  if (config.scenario === "loading") {
    await new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException("Cancelled", "AbortError"));
        return;
      }
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException("Cancelled", "AbortError"));
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      }, 10000);
      signal.addEventListener("abort", abort, { once: true });
    });
  }
  if (config.scenario === "error") {
    throw new Error("Simulated failure");
  }
  return config.scenario === "empty" ? empty : load();
}
function PagePreview({ config }: { config: DataGridPlaygroundValues }) {
  const grid = useDataGrid({
    columns: pageColumns,
    contract: usersGrid,
    filterMode: config.filterMode,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["playground-page", config.scenario, input],
        retry: false,
        enabled: config.scenario !== "inactive",
        queryFn: ({ signal }) =>
          scenario(config, signal, () => listDemoUsers(input, signal), {
            rows: [],
            rowCount: 0,
          }),
      }),
    selectionMode: config.selectionMode,
  });
  return (
    <PreviewSurface
      grid={grid}
      config={config}
      search={
        <DataGridSearch
          grid={grid}
          field="search"
          clearable
          aria-label="Search users"
          placeholder="Search users"
        />
      }
    />
  );
}
function CursorPreview({ config }: { config: DataGridPlaygroundValues }) {
  const grid = useDataGrid({
    columns: cursorColumns,
    contract: cursorUsersGrid,
    filterMode: config.filterMode,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["playground-cursor", config.scenario, input],
        retry: false,
        enabled: config.scenario !== "inactive",
        queryFn: ({ signal }) =>
          scenario(config, signal, () => listCursorDemoUsers(input, signal), {
            rows: [],
            nextCursor: null,
          }),
      }),
    selectionMode: config.selectionMode,
  });
  return (
    <PreviewSurface
      grid={grid}
      config={config}
      search={
        <DataGridSearch
          grid={grid}
          field="search"
          clearable
          aria-label="Search users"
          placeholder="Search users"
        />
      }
    />
  );
}
function PreviewSurface<C extends typeof usersGrid | typeof cursorUsersGrid>({
  grid,
  config,
  search,
}: {
  grid: import("@/registry/new-york/data-grid-context").DataGridSurface<C>;
  config: DataGridPlaygroundValues;
  search: ReactNode;
}) {
  return (
    <DataGrid grid={grid} variant={config.variant} density={config.density}>
      <DataGridToolbar>
        {search}
        {config.filterMode === "apply" && <DataGridApplyFilters />}
        <DataGridResetFilters />
        <DataGridColumnVisibility />
      </DataGridToolbar>
      <DataGridSelectionBar />
      <DataGridViewport className="max-h-80">
        <DataGridTable
          grid={grid}
          aria-label="Users"
          stickyHeader={config.stickyHeader}
        />
      </DataGridViewport>
      <DataGridPagination showPageNumbers={config.showPageNumbers} />
    </DataGrid>
  );
}
export function DataGridPlaygroundPreview({
  config,
}: {
  config: DataGridPlaygroundValues;
}) {
  return (
    <DataGridExampleProvider key={`${config.pagination}:${config.scenario}`}>
      {config.pagination === "page" ? (
        <PagePreview config={config} />
      ) : (
        <CursorPreview config={config} />
      )}
    </DataGridExampleProvider>
  );
}
export function DataGridPlayground() {
  return (
    <ComponentPlayground
      title="DataGrid"
      definitions={dataGridProps}
      initialValues={getDataGridDefaults()}
      getCode={getDataGridCode}
      hint="In-memory async simulation, not a backend. Loading resolves after 10 seconds. Reset remounts configuration and all transient grid state. Generated code reproduces configuration, not current selection or filters."
      renderPreview={(config) => <DataGridPlaygroundPreview config={config} />}
    />
  );
}
