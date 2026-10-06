import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";

export const dataGridProps = {
  columns: {
    defaultValue: "Required",
    description:
      "useDataGrid: typed helper definitions, independent column ID/accessor/backend sort key.",
    type: "readonly DataGridColumnDefinition[]",
  },
  debounce: {
    defaultValue: "300",
    description:
      "DataGridSearch: immediate-mode delay in milliseconds; clear applies immediately. Apply mode ignores delay.",
    type: "number",
  },
  density: {
    control: {
      initialValue: "comfortable" as "comfortable" | "compact",
      kind: "select",
      label: "Density",
      options: ["comfortable", "compact"],
    },
    defaultValue: '"comfortable"',
    description: "DataGrid: cell padding.",
    type: '"comfortable" | "compact"',
  },
  field: {
    defaultValue: "Required",
    description:
      "DataGridSearch / DataGridFilter: explicitly supply grid for field/value inference. Search accepts string-compatible fields only.",
    type: "Inferred raw filter key",
  },
  filterMode: {
    control: {
      initialValue: "immediate" as "immediate" | "apply",
      kind: "select",
      label: "Filter mode",
      options: ["immediate", "apply"],
    },
    defaultValue: '"immediate"',
    description: "useDataGrid: validate immediately or commit the whole draft.",
    type: '"immediate" | "apply"',
  },
  getRowId: {
    defaultValue: "Required",
    description: "useDataGrid: stable unique domain IDs, never page indexes.",
    type: "(row) => string",
  },
  grid: {
    defaultValue: "Required",
    description:
      "DataGrid and typed Table/Search/Filter overrides: controller from useDataGrid.",
    type: "Inferred controller",
  },
  initialState: {
    defaultValue: "Schema defaults",
    description:
      "useDataGrid: captured once as the uncontrolled initialization/reset baseline.",
    type: "Partial<DataGridRawInput>",
  },
  labels: {
    defaultValue: "English defaults",
    description:
      "DataGrid: visible and accessible labels; count/sort messages are formatter functions.",
    type: "Partial<DataGridLabels>",
  },
  onStateChange: {
    defaultValue: "Not set",
    description:
      "useDataGrid: emits the proposed value; controlled changes apply only after the parent supplies it.",
    type: "Per-slice callbacks",
  },
  pageSizes: {
    defaultValue: "[25, 50, 100]",
    description:
      "DataGridPagination: sizes must fit contract limits. Cursor mode does not show total/first/last controls.",
    type: "readonly number[]",
  },
  pagination: {
    control: {
      initialValue: "page" as "page" | "cursor",
      kind: "select",
      label: "Pagination mode",
      options: ["page", "cursor"],
    },
    defaultValue: "Required contract choice",
    description: "Contract: numbered pages or visited cursor navigation.",
    type: '"page" | "cursor"',
  },
  queryOptions: {
    defaultValue: "Required",
    description:
      "useDataGrid: input is normalized; native selected output matches the contract. Query owns all remote data.",
    type: "Native query-options factory",
  },
  renderCell: {
    defaultValue: "DataGridCell",
    description:
      "DataGridTable: domain row, native cell, unknown heterogeneous value and spreadable td props. Typed values belong in column cell callbacks.",
    type: "(context) => ReactNode",
  },
  renderColumn: {
    defaultValue: "DataGridColumn",
    description:
      "DataGridTable: native header, grid and spreadable th props including sorting controls.",
    type: "(context) => ReactNode",
  },
  renderEmpty: {
    defaultValue: "Empty composition",
    description:
      "DataGridTable: feedback content inside a valid spanning cell.",
    type: "({ grid, filtered, reset }) => ReactNode",
  },
  renderError: {
    defaultValue: "ErrorState composition",
    description:
      "DataGridTable: raw errors reach custom handlers only, never default feedback text.",
    type: "({ grid, error, retry, background }) => ReactNode",
  },
  renderRow: {
    defaultValue: "DataGridRow",
    description:
      "DataGridTable: inferred domain row, native row, grid and spreadable default tr props.",
    type: "(context) => ReactNode",
  },
  scenario: {
    control: {
      initialValue: "ready" as
        | "ready"
        | "loading"
        | "empty"
        | "error"
        | "inactive",
      kind: "select",
      label: "Async scenario",
      options: ["ready", "loading", "empty", "error", "inactive"],
    },
    defaultValue: '"ready"',
    description: "Demo-only async simulation, not a DataGrid prop.",
    type: '"ready" | "loading" | "empty" | "error" | "inactive"',
  },
  selectionMode: {
    control: {
      initialValue: "none" as "none" | "explicit" | "allMatching",
      kind: "select",
      label: "Selection mode",
      options: ["none", "explicit", "allMatching"],
    },
    defaultValue: '"none"',
    description: "useDataGrid: remote ID selection policy.",
    type: '"none" | "explicit" | "allMatching"',
  },
  state: {
    defaultValue: "Uncontrolled",
    description:
      "useDataGrid: supplied slices are authoritative. Request contains filters/sorting/pagination atomically.",
    type: "{ request?, columnVisibility?, columnOrder?, selection? }",
  },
  stickyHeader: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Sticky header",
    },
    defaultValue: "false",
    description: "DataGridTable: sticky header within the sole viewport.",
    type: "boolean",
  },
  variant: {
    control: {
      initialValue: "default" as "default" | "striped" | "bordered" | "plain",
      kind: "select",
      label: "Variant",
      options: ["default", "striped", "bordered", "plain"],
    },
    defaultValue: '"default"',
    description: "DataGrid: visual treatment only.",
    type: '"default" | "striped" | "bordered" | "plain"',
  },
} satisfies Record<string, PropDefinition>;

export const getDataGridDefaults = () => getPlaygroundDefaults(dataGridProps);
export type DataGridPlaygroundValues = ReturnType<typeof getDataGridDefaults>;

export function getDataGridCode(values: DataGridPlaygroundValues) {
  const { pagination, scenario } = values;
  return `"use client";

import { QueryClient, QueryClientProvider, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { createDataGridContract } from "@/components/ui/data-grid-schema";
import { createDataGridColumnHelper } from "@/components/ui/data-grid-columns";
import { useDataGrid } from "@/components/ui/use-data-grid";
import { DataGrid, DataGridToolbar, DataGridSearch, DataGridApplyFilters, DataGridResetFilters, DataGridColumnVisibility, DataGridSelectionBar, DataGridViewport, DataGridTable, DataGridPagination } from "@/components/ui/data-grid";

const contract = createDataGridContract({
  pagination: ${JSON.stringify(pagination)},
  row: z.object({ id: z.string(), name: z.string() }),
  filters: z.object({ search: z.string().default("") }),
  sortBy: z.literal("name"),
});
const column = createDataGridColumnHelper(contract);
const columns = [column.accessor("name", { header: "Name", sortBy: "name" })];
const records = Array.from({ length: 78 }, (_, index) => ({ id: String(index), name: "User " + (index + 1) }));

function Users() {
  const grid = useDataGrid({
    contract, columns, getRowId: row => row.id,
    filterMode: ${JSON.stringify(values.filterMode)}, selectionMode: ${JSON.stringify(values.selectionMode)},
    queryOptions: input => queryOptions({
      queryKey: ["users-demo", ${JSON.stringify(scenario)}, input],
      retry: false, enabled: ${scenario !== "inactive"},
      queryFn: async ({ signal }) => {
        // In-memory backend simulation. Replace with an authorized transport.
        await new Promise<void>((resolve, reject) => {
          if (signal.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
          const abort = () => { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
          const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ${scenario === "loading" ? 10_000 : 120});
          signal.addEventListener("abort", abort, { once: true });
        });
        ${
          scenario === "error"
            ? 'throw new Error("Simulated failure");'
            : `const rows = ${scenario === "empty" ? "records.slice(0, 0)" : "records.filter(row => row.name.toLowerCase().includes(input.filters.search.toLowerCase()))"};
        rows.sort((a, b) => {
          const direction = input.sorting[0]?.desc ? -1 : 1;
          return input.sorting.length ? direction * a.name.localeCompare(b.name) || Number(a.id) - Number(b.id) : Number(a.id) - Number(b.id);
        });
        ${pagination === "page" ? "const start = input.pagination.pageIndex * input.pagination.pageSize;" : 'const start = input.pagination.cursor === null ? 0 : rows.findIndex(row => row.id === input.pagination.cursor);\n        if (start < 0) throw new Error("Invalid demo cursor");'}
        const end = start + input.pagination.pageSize;
        return contract.output.parse({ rows: rows.slice(start, end), ${pagination === "page" ? "rowCount: rows.length" : "nextCursor: rows[end]?.id ?? null"} });`
        }
      },
    }),
  });
  return <DataGrid grid={grid} variant=${JSON.stringify(values.variant)} density=${JSON.stringify(values.density)}>
    <DataGridToolbar>
      <DataGridSearch grid={grid} field="search" clearable aria-label="Search users" placeholder="Search users" />
      ${values.filterMode === "apply" ? "<DataGridApplyFilters />" : ""}<DataGridResetFilters /><DataGridColumnVisibility />
    </DataGridToolbar>
    <DataGridSelectionBar />
    <DataGridViewport className="max-h-80">
      <DataGridTable grid={grid} aria-label="Users" stickyHeader={${values.stickyHeader}} />
    </DataGridViewport>
    <DataGridPagination />
  </DataGrid>;
}
export default function UsersDemo() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } }));
  useEffect(() => () => client.clear(), [client]);
  return <QueryClientProvider client={client}><Users /></QueryClientProvider>;
}
`;
}
