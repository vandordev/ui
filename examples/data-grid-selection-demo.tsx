"use client";

import { queryOptions } from "@tanstack/react-query";

import {
  DataGrid,
  DataGridPagination,
  DataGridSearch,
  DataGridSelectionBar,
  DataGridTable,
  DataGridToolbar,
} from "@/registry/new-york/data-grid";
import { useDataGrid } from "@/registry/new-york/use-data-grid";

import { DataGridExampleProvider } from "./data-grid-demo";
import { usersGrid, userColumns, listDemoUsers } from "./data-grid-demo-data";

function Users() {
  const grid = useDataGrid({
    columns: userColumns,
    contract: usersGrid,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["selection-demo", input],
        queryFn: ({ signal }) => listDemoUsers(input, signal),
      }),
    selectionMode: "allMatching",
  });
  return (
    <DataGrid grid={grid}>
      <DataGridToolbar>
        <DataGridSearch
          grid={grid}
          field="search"
          aria-label="Search selected users"
        />
      </DataGridToolbar>
      <DataGridSelectionBar />
      <DataGridTable grid={grid} aria-label="Selectable users" />
      <DataGridPagination />
      <pre
        className="max-h-40 overflow-auto text-xs"
        aria-label="Selection descriptor"
      >
        {JSON.stringify(grid.selection, null, 2)}
      </pre>
      <p className="text-xs text-muted-foreground">
        All matching means matching at execution time. The backend still
        validates authorization and exclusions.
      </p>
    </DataGrid>
  );
}
export function DataGridSelectionDemo() {
  return (
    <DataGridExampleProvider>
      <Users />
    </DataGridExampleProvider>
  );
}
