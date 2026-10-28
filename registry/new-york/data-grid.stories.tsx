"use client";

import type { Meta, StoryObj } from "@storybook/react";
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";

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
} from "./data-grid";
import { createDataGridColumnHelper } from "./data-grid-columns";
import { createDataGridContract } from "./data-grid-schema";
import { useDataGrid } from "./use-data-grid";
import { useDataGridSource } from "./use-data-grid-source";

const contract = createDataGridContract({
  filters: z.object({ search: z.string().default("") }),
  pagination: "page",
  row: z.object({ id: z.string(), name: z.string() }),
  sortBy: z.literal("name"),
});
const column = createDataGridColumnHelper(contract);
const columns = [column.accessor("name", { header: "Name", sortBy: "name" })];
const records = Array.from({ length: 60 }, (_, index) => ({
  id: String(index),
  name: `Example user ${index + 1}`,
}));
const cursorContract = createDataGridContract({
  filters: contract.filters,
  pagination: "cursor",
  row: contract.row,
  sortBy: contract.sortBy,
});
const cursorColumn = createDataGridColumnHelper(cursorContract);
const cursorColumns = [
  cursorColumn.accessor("name", { header: "Name", sortBy: "name" }),
];
interface Args {
  variant: "default" | "striped" | "bordered" | "plain";
  density: "comfortable" | "compact";
  filterMode: "immediate" | "apply";
  selectionMode: "none" | "explicit" | "allMatching";
  stickyHeader: boolean;
  showPageNumbers: boolean;
  scenario: "ready" | "empty" | "error" | "inactive" | "loading";
  pagination: "page" | "cursor";
  controlled: boolean;
}
const waitForStoryRequest = async (
  signal: AbortSignal,
  milliseconds: number
) => {
  if (signal.aborted) {
    throw new DOMException("Cancelled", "AbortError");
  }
  // eslint-disable-next-line promise/avoid-new -- Adapt the browser timer API; no portable cancellable promise timer exists.
  await new Promise<void>((resolve, reject) => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const abort = () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
      reject(new DOMException("Cancelled", "AbortError"));
    };
    timers.push(
      setTimeout(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      }, milliseconds)
    );
    signal.addEventListener("abort", abort, { once: true });
  });
};

const StoryGrid = (args: Args) => {
  const [request, setRequest] = useState(() =>
    contract.input.parse({ filters: {} })
  );
  const grid = useDataGrid({
    columns,
    contract,
    filterMode: args.filterMode,
    getRowId: (row) => row.id,
    onStateChange: args.controlled ? { request: setRequest } : undefined,
    queryOptions: (input) =>
      queryOptions({
        enabled: args.scenario !== "inactive",
        queryFn: async ({ signal }) => {
          await waitForStoryRequest(
            signal,
            args.scenario === "loading" ? 10_000 : 80
          );
          if (args.scenario === "error") {
            throw new globalThis.Error("Private simulation error");
          }
          const rows =
            args.scenario === "empty"
              ? []
              : records.filter((row) =>
                  row.name
                    .toLowerCase()
                    .includes(input.filters.search.toLowerCase())
                );
          if (input.sorting.length) {
            rows.sort(
              (a, b) =>
                (input.sorting[0].desc ? -1 : 1) *
                  a.name.localeCompare(b.name) || Number(a.id) - Number(b.id)
            );
          }
          const start = input.pagination.pageIndex * input.pagination.pageSize;
          return contract.output.parse({
            rowCount: rows.length,
            rows: rows.slice(start, start + input.pagination.pageSize),
          });
        },
        queryKey: ["story-users", args.scenario, input],
        retry: false,
      }),
    selectionMode: args.selectionMode,
    state: args.controlled ? { request } : undefined,
  });
  return (
    <DataGrid grid={grid} variant={args.variant} density={args.density}>
      <DataGridToolbar>
        <DataGridSearch
          grid={grid}
          field="search"
          clearable
          aria-label="Search users"
        />
        {args.filterMode === "apply" && <DataGridApplyFilters />}
        <DataGridResetFilters />
        <DataGridColumnVisibility />
      </DataGridToolbar>
      <DataGridSelectionBar />
      <DataGridViewport className="max-h-80">
        <DataGridTable
          grid={grid}
          aria-label="Story users"
          stickyHeader={args.stickyHeader}
        />
      </DataGridViewport>
      <DataGridPagination showPageNumbers={args.showPageNumbers} />
    </DataGrid>
  );
};
const CursorGrid = (args: Args) => {
  const grid = useDataGrid({
    columns: cursorColumns,
    contract: cursorContract,
    filterMode: args.filterMode,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryFn: () => {
          const rows = records.filter((row) =>
            row.name.toLowerCase().includes(input.filters.search.toLowerCase())
          );
          if (input.sorting.length) {
            rows.sort(
              (a, b) =>
                (input.sorting[0].desc ? -1 : 1) *
                  a.name.localeCompare(b.name) || Number(a.id) - Number(b.id)
            );
          }
          const start =
            input.pagination.cursor === null
              ? 0
              : rows.findIndex((row) => row.id === input.pagination.cursor);
          if (start < 0) {
            throw new globalThis.Error("Invalid simulated cursor");
          }
          const end = start + input.pagination.pageSize;
          return Promise.resolve(
            cursorContract.output.parse({
              nextCursor: rows[end]?.id ?? null,
              rows: rows.slice(start, end),
            })
          );
        },
        queryKey: ["story-cursor", input],
        retry: false,
      }),
    selectionMode: args.selectionMode,
  });
  return (
    <DataGrid grid={grid} variant={args.variant} density={args.density}>
      <DataGridToolbar>
        <DataGridSearch
          grid={grid}
          field="search"
          aria-label="Search cursor users"
        />
        {args.filterMode === "apply" && <DataGridApplyFilters />}
        <DataGridResetFilters />
      </DataGridToolbar>
      <DataGridSelectionBar />
      <DataGridViewport className="max-h-80">
        <DataGridTable
          grid={grid}
          aria-label="Cursor story users"
          stickyHeader={args.stickyHeader}
        />
      </DataGridViewport>
      <DataGridPagination showPageNumbers={args.showPageNumbers} />
    </DataGrid>
  );
};
const Example = (args: Args) => {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } })
  );
  useEffect(() => () => client.clear(), [client]);
  return (
    <QueryClientProvider client={client}>
      {args.pagination === "cursor" ? (
        <CursorGrid {...args} />
      ) : (
        <StoryGrid {...args} />
      )}
    </QueryClientProvider>
  );
};
const meta = {
  argTypes: {
    controlled: { control: false },
    density: { control: "select", options: ["comfortable", "compact"] },
    filterMode: { control: "select", options: ["immediate", "apply"] },
    pagination: { control: false },
    scenario: {
      control: "select",
      options: ["ready", "empty", "error", "inactive", "loading"],
    },
    selectionMode: {
      control: "select",
      options: ["none", "explicit", "allMatching"],
    },
    showPageNumbers: { control: "boolean" },
    stickyHeader: { control: "boolean" },
    variant: {
      control: "select",
      options: ["default", "striped", "bordered", "plain"],
    },
  },
  args: {
    controlled: false,
    density: "comfortable",
    filterMode: "immediate",
    pagination: "page",
    scenario: "ready",
    selectionMode: "none",
    showPageNumbers: true,
    stickyHeader: false,
    variant: "default",
  },
  component: Example,
  title: "Vandor UI/DataGrid",
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const CompactStriped: Story = {
  args: { density: "compact", variant: "striped" },
};
export const Bordered: Story = { args: { variant: "bordered" } };
export const Plain: Story = { args: { variant: "plain" } };
export const ApplyFilters: Story = { args: { filterMode: "apply" } };
export const AllMatching: Story = { args: { selectionMode: "allMatching" } };
export const StickyHeader: Story = { args: { stickyHeader: true } };
export const IconPagination: Story = { args: { showPageNumbers: false } };
export const Empty: Story = { args: { scenario: "empty" } };
export const Error: Story = { args: { scenario: "error" } };
export const Inactive: Story = { args: { scenario: "inactive" } };
export const Loading: Story = { args: { scenario: "loading" } };
export const Cursor: Story = {
  argTypes: {
    controlled: { control: false },
    scenario: { control: false },
    showPageNumbers: { control: false },
  },
  args: { pagination: "cursor" },
};
export const Controlled: Story = { args: { controlled: true } };

const SourceGrid = (args: Args) => {
  const [recoveredScenario, setRecoveredScenario] = useState<string>();
  const scenario =
    recoveredScenario === args.scenario ? "ready" : args.scenario;
  const [request, setRequest] = useState(() =>
    contract.input.parse({ filters: {} })
  );
  const matching = records.filter((row) =>
    row.name.toLowerCase().includes(request.filters.search.toLowerCase())
  );
  if (request.sorting.length) {
    matching.sort(
      (a, b) =>
        (request.sorting[0].desc ? -1 : 1) * a.name.localeCompare(b.name)
    );
  }
  const start = request.pagination.pageIndex * request.pagination.pageSize;
  const grid = useDataGridSource({
    columns,
    contract,
    filterMode: args.filterMode,
    getRowId: (row) => row.id,
    onStateChange: { request: setRequest },
    selectionMode: args.selectionMode,
    source: {
      data:
        scenario === "loading" ||
        scenario === "error" ||
        scenario === "inactive"
          ? undefined
          : {
              rowCount: scenario === "empty" ? 0 : matching.length,
              rows:
                scenario === "empty"
                  ? []
                  : matching.slice(start, start + request.pagination.pageSize),
            },
      error:
        scenario === "error"
          ? new globalThis.Error("Local source error")
          : undefined,
      loading: scenario === "loading",
      refetch: () => setRecoveredScenario(args.scenario),
    },
    state: { request },
  });
  return (
    <DataGrid grid={grid} density={args.density} variant={args.variant}>
      <DataGridToolbar>
        <DataGridSearch
          grid={grid}
          field="search"
          clearable
          aria-label="Search source users"
        />
        {args.filterMode === "apply" && <DataGridApplyFilters />}
        <DataGridResetFilters />
      </DataGridToolbar>
      <DataGridSelectionBar />
      <DataGridTable
        grid={grid}
        aria-label="Source users"
        stickyHeader={args.stickyHeader}
      />
      <DataGridPagination
        pageSizes={[25]}
        showPageNumbers={args.showPageNumbers}
      />
    </DataGrid>
  );
};
export const ConsumerSource: Story = {
  argTypes: {
    controlled: { control: false },
    pagination: { control: false },
    scenario: {
      control: "select",
      options: ["ready", "empty", "error", "loading"],
    },
  },
  render: (args) => <SourceGrid {...args} />,
};
