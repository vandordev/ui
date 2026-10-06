"use client";

import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  DataGrid,
  DataGridTable,
  DataGridSearch,
  DataGridToolbar,
  DataGridPagination,
} from "@/registry/new-york/data-grid";
import { useDataGrid } from "@/registry/new-york/use-data-grid";

import { usersGrid, userColumns, listDemoUsers } from "./data-grid-demo-data";

export function DataGridExampleProvider({ children }: { children: ReactNode }) {
  // This short-lived example scope is cleared on unmount, so it needs no GC timer.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { gcTime: Infinity, retry: false } },
      })
  );
  useEffect(() => () => client.clear(), [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
function Users() {
  const grid = useDataGrid({
    columns: userColumns,
    contract: usersGrid,
    getRowId: (user) => user.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["demo-users", input],
        queryFn: ({ signal }) => listDemoUsers(input, signal),
      }),
  });
  return (
    <DataGrid grid={grid} density="compact" className="max-w-full">
      <DataGridToolbar>
        <DataGridSearch
          grid={grid}
          field="search"
          clearable
          aria-label="Search demo users"
          placeholder="Search users"
        />
      </DataGridToolbar>
      <DataGridTable grid={grid} aria-label="Demo users" />
      <DataGridPagination />
    </DataGrid>
  );
}
export function DataGridDemo() {
  return (
    <DataGridExampleProvider>
      <Users />
    </DataGridExampleProvider>
  );
}
