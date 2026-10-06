"use client";

import { queryOptions } from "@tanstack/react-query";

import {
  DataGrid,
  DataGridPagination,
  DataGridSearch,
  DataGridTable,
  DataGridToolbar,
} from "@/registry/new-york/data-grid";
import { createDataGridColumnHelper } from "@/registry/new-york/data-grid-columns";
import { useDataGrid } from "@/registry/new-york/use-data-grid";

import { DataGridExampleProvider } from "./data-grid-demo";
import { cursorUsersGrid, listCursorDemoUsers } from "./data-grid-demo-data";

const column = createDataGridColumnHelper(cursorUsersGrid);
const columns = [
  column.accessor("name", { header: "Name", sortBy: "name" }),
  column.accessor("email", { header: "Email" }),
];
function Users() {
  const grid = useDataGrid({
    columns,
    contract: cursorUsersGrid,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["cursor-demo", input],
        queryFn: ({ signal }) => listCursorDemoUsers(input, signal),
      }),
  });
  return (
    <DataGrid grid={grid}>
      <DataGridToolbar>
        <DataGridSearch
          grid={grid}
          field="search"
          aria-label="Search cursor results"
        />
      </DataGridToolbar>
      <DataGridTable grid={grid} aria-label="Cursor users" />
      <DataGridPagination />
    </DataGrid>
  );
}
export function DataGridCursorDemo() {
  return (
    <DataGridExampleProvider>
      <Users />
    </DataGridExampleProvider>
  );
}
