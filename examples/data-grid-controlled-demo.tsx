"use client";

import { queryOptions } from "@tanstack/react-query";
import { useState } from "react";

import {
  DataGrid,
  DataGridColumnVisibility,
  DataGridPagination,
  DataGridSearch,
  DataGridTable,
  DataGridToolbar,
} from "@/registry/new-york/data-grid";
import { useDataGrid } from "@/registry/new-york/use-data-grid";

import { DataGridExampleProvider } from "./data-grid-demo";
import { usersGrid, userColumns, listDemoUsers } from "./data-grid-demo-data";

function Users() {
  const [request, setRequest] = useState(() =>
    usersGrid.input.parse({ filters: {} })
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [columnOrder, setColumnOrder] = useState(["name", "visits", "joined"]);
  const grid = useDataGrid({
    columns: userColumns,
    contract: usersGrid,
    getRowId: (row) => row.id,
    onStateChange: {
      columnOrder: setColumnOrder,
      columnVisibility: setColumnVisibility,
      request: setRequest,
    },
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["controlled-demo", input],
        queryFn: ({ signal }) => listDemoUsers(input, signal),
      }),
    state: { columnOrder, columnVisibility, request },
  });
  return (
    <DataGrid grid={grid}>
      <DataGridToolbar>
        <DataGridSearch
          grid={grid}
          field="search"
          aria-label="Search controlled users"
        />
        <DataGridColumnVisibility />
      </DataGridToolbar>
      <DataGridTable grid={grid} aria-label="Controlled users" />
      <DataGridPagination />
      <pre
        className="max-h-36 overflow-auto text-xs"
        aria-label="Applied request"
      >
        {JSON.stringify(request, null, 2)}
      </pre>
    </DataGrid>
  );
}
export function DataGridControlledDemo() {
  return (
    <DataGridExampleProvider>
      <Users />
    </DataGridExampleProvider>
  );
}
