"use client";

import { queryOptions } from "@tanstack/react-query";

import {
  DataGrid,
  DataGridCell,
  DataGridColumnVisibility,
  DataGridPagination,
  DataGridRow,
  DataGridTable,
  DataGridToolbar,
  DataGridViewport,
} from "@/registry/new-york/data-grid";
import { useDataGrid } from "@/registry/new-york/use-data-grid";

import { DataGridExampleProvider } from "./data-grid-demo";
import { usersGrid, userColumn, listDemoUsers } from "./data-grid-demo-data";

const columns = [
  userColumn.accessor("name", { header: "Name", sortBy: "name" }),
  userColumn.accessor((row) => row.visits * 2, {
    cell: ({ value }) => value.toFixed(0),
    header: "Score",
    id: "score",
  }),
  userColumn.display({
    cell: ({ row }) => (
      <a href={`mailto:${row.email}`} className="underline underline-offset-4">
        Email {row.name}
      </a>
    ),
    enableHiding: false,
    header: "Actions",
    id: "actions",
  }),
];
function Users() {
  const grid = useDataGrid({
    columns,
    contract: usersGrid,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["rendering-demo", input],
        queryFn: ({ signal }) => listDemoUsers(input, signal),
      }),
  });
  return (
    <DataGrid grid={grid} variant="striped" density="compact">
      <DataGridToolbar>
        <DataGridColumnVisibility />
      </DataGridToolbar>
      <DataGridViewport className="max-h-80">
        <DataGridTable
          grid={grid}
          stickyHeader
          aria-label="Custom rendered users"
          renderRow={(context) => (
            <DataGridRow {...context.props} data-user={context.row.id} />
          )}
          renderCell={(context) => (
            <DataGridCell
              {...context.props}
              className={
                context.native.column.id === "score"
                  ? "tabular-nums"
                  : undefined
              }
            />
          )}
        />
      </DataGridViewport>
      <DataGridPagination />
    </DataGrid>
  );
}
export function DataGridRenderingDemo() {
  return (
    <DataGridExampleProvider>
      <Users />
    </DataGridExampleProvider>
  );
}
