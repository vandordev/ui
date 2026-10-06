import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import {
  DataGrid,
  DataGridTable,
  DataGridRow,
  DataGridFilter,
  DataGridSearch,
} from "../registry/new-york/data-grid";
import { createDataGridColumnHelper } from "../registry/new-york/data-grid-columns";
import { createDataGridContract } from "../registry/new-york/data-grid-schema";
import { useDataGrid } from "../registry/new-york/use-data-grid";

const contract = createDataGridContract({
  pagination: "page",
  row: z.object({ id: z.string(), name: z.string(), visits: z.number() }),
  filters: z.object({
    search: z.string().default(""),
    active: z.boolean().default(true),
  }),
  sortBy: z.enum(["backend_name", "visits"]),
});
const column = createDataGridColumnHelper(contract);
const columns = [
  column.accessor("name", {
    header: "Name",
    sortBy: "backend_name",
    cell: ({ value }) => value.toUpperCase(),
  }),
  column.accessor((row) => row.visits * 2, {
    id: "score",
    header: "Score",
    cell: ({ value }) => value.toFixed(),
  }),
  column.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => row.id,
  }),
];

function Consumer() {
  const grid = useDataGrid({
    contract,
    columns,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["users", "tenant-a", input],
        queryFn: async () => ({
          payload: { rows: [{ id: "a", name: "Ada", visits: 2 }], rowCount: 1 },
          token: "raw",
        }),
        select: (raw) => raw.payload,
      }),
  });
  grid.query.data?.rows[0].name.toUpperCase();
  grid.table.getRowModel().rows[0].original.visits.toFixed();
  grid.setFilter("active", false);
  grid.setFilter("search", "Ada", { debounce: 300 });
  grid.setPageIndex(2);
  grid.getFilterBinding("active").onChange(true);
  // @ts-expect-error Select hides the transport envelope.
  grid.query.data?.token;
  // @ts-expect-error Unknown filter fields.
  grid.setFilter("password", "");
  // @ts-expect-error Wrong filter value type.
  grid.setFilter("active", "false");
  // @ts-expect-error Sort allowlist is independent of row fields.
  grid.setSorting([{ id: "name", desc: false }]);
  return (
    <DataGrid grid={grid}>
      <DataGridSearch grid={grid} field="search" />
      <DataGridFilter grid={grid} field="active">
        {({ value, onChange }) => (
          <input
            type="checkbox"
            checked={value}
            onChange={(event) => onChange(event.currentTarget.checked)}
          />
        )}
      </DataGridFilter>
      <DataGridTable
        grid={grid}
        aria-label="Users"
        renderRow={(context) => (
          <DataGridRow {...context.props} data-user={context.row.id} />
        )}
      />
      {/* @ts-expect-error Search cannot bind to boolean fields. */}
      <DataGridSearch grid={grid} field="active" />
      {/* @ts-expect-error Filter cannot bind to unknown fields. */}
      <DataGridFilter grid={grid} field="password">
        {() => null}
      </DataGridFilter>
    </DataGrid>
  );
}

function InvalidOutput() {
  // @ts-expect-error Native query output must match rowCount contract.
  useDataGrid({
    contract,
    columns,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: [input],
        queryFn: async () => ({ rows: [], total: 2 }),
      }),
  });
  // @ts-expect-error Selected output cannot have invalid row values.
  useDataGrid({
    contract,
    columns,
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: [input],
        queryFn: async () => ({
          payload: { rows: [{ id: "a", name: 42, visits: 2 }], rowCount: 1 },
        }),
        select: (raw) => raw.payload,
      }),
  });
}

const cursor = createDataGridContract({
  pagination: "cursor",
  row: contract.row,
  filters: contract.filters,
  sortBy: contract.sortBy,
});
const cursorColumn = createDataGridColumnHelper(cursor);
function CursorConsumer() {
  const grid = useDataGrid({
    contract: cursor,
    columns: [cursorColumn.accessor("name", { header: "Name" })],
    getRowId: (row) => row.id,
    queryOptions: (input) =>
      queryOptions({
        queryKey: ["cursor", input],
        queryFn: async () => ({ rows: [], nextCursor: null }),
      }),
  });
  grid.nextPage();
  // @ts-expect-error Cursor grids cannot jump to numbered pages.
  grid.setPageIndex(2);
  // @ts-expect-error Cursor responses do not invent totals.
  grid.query.data?.rowCount;
  return null;
}
