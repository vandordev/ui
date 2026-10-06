"use client";

import { queryOptions } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

import {
  DataGrid,
  DataGridApplyFilters,
  DataGridFilter,
  DataGridPagination,
  DataGridResetFilters,
  DataGridSearch,
  DataGridTable,
  DataGridToolbar,
} from "@/registry/new-york/data-grid";
import { DateRangePicker } from "@/registry/new-york/date-range-picker";
import { Select } from "@/registry/new-york/select";
import { useDataGrid } from "@/registry/new-york/use-data-grid";

import { DataGridExampleProvider } from "./data-grid-demo";
import { usersGrid, userColumns, listDemoUsers } from "./data-grid-demo-data";

function Users() {
  const grid = useDataGrid({
    columns: userColumns,
    contract: usersGrid,
    filterMode: "apply",
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["filter-demo", input],
        queryFn: ({ signal }) => listDemoUsers(input, signal),
      }),
  });
  return (
    <DataGrid grid={grid}>
      <DataGridToolbar>
        <DataGridSearch
          grid={grid}
          field="search"
          aria-label="Search users"
          clearable
        />
        <DataGridFilter grid={grid} field="status">
          {({ value, onChange, error }) => (
            <Select
              aria-label="User status"
              aria-invalid={Boolean(error)}
              value={value}
              data={[
                { label: "All users", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              onValueChange={(value) => {
                if (value) {
                  onChange(value);
                }
              }}
            />
          )}
        </DataGridFilter>
        <DataGridFilter grid={grid} field="dates">
          {({ value, onChange }) => (
            <DateRangePicker
              label="Joined dates"
              clearable
              value={
                value
                  ? { from: parseISO(value.from), to: parseISO(value.to) }
                  : undefined
              }
              onValueChange={(range) =>
                onChange(
                  range?.from && range.to
                    ? {
                        from: format(range.from, "yyyy-MM-dd"),
                        to: format(range.to, "yyyy-MM-dd"),
                      }
                    : null
                )
              }
            />
          )}
        </DataGridFilter>
        <DataGridApplyFilters />
        <DataGridResetFilters />
      </DataGridToolbar>
      <p className="text-xs text-muted-foreground">
        Calendar Apply changes this draft. Apply filters sends the complete
        group. Dates are local calendar dates, not UTC timestamps.
      </p>
      <DataGridTable grid={grid} aria-label="Filtered users" />
      <DataGridPagination />
    </DataGrid>
  );
}
export function DataGridFiltersDemo() {
  return (
    <DataGridExampleProvider>
      <Users />
    </DataGridExampleProvider>
  );
}
