import { z } from "zod";

import type { DataGridSurface } from "../registry/new-york/data-grid-context";
import type { DataGridController } from "../registry/new-york/data-grid-index";
import { createDataGridContract } from "../registry/new-york/data-grid-schema";
import { useDataGridSource } from "../registry/new-york/use-data-grid-source";

const contract = createDataGridContract({
  filters: z.object({ search: z.string().default("") }),
  pagination: "page",
  row: z.object({ id: z.string(), name: z.string() }),
  sortBy: z.enum(["name"]),
});
// The explicit family entry retains the pre-existing Query controller type.
export const queryControllerType = (
  grid: DataGridController<typeof contract>
) => grid.query.isFetching;
export const SourceTypes = () => {
  const grid = useDataGridSource({
    columns: [],
    contract,
    getRowId: (row) => row.id,
    source: {
      data: { rowCount: 1, rows: [{ id: "a", name: "Ada" }] },
      refetch: () => Promise.resolve(),
    },
  });
  const surface: DataGridSurface<typeof contract> = grid;
  grid.setFilter("search", "Ada");
  grid.setPageIndex(0);
  // @ts-expect-error Schema-derived filter is a string.
  grid.setFilter("search", 3);
  // @ts-expect-error Source is not a native Query result.
  const invalidNativeField = grid.query.isFetching;
  void invalidNativeField;
  useDataGridSource({
    columns: [],
    contract,
    getRowId: (row) => row.id,
    source: {
      // @ts-expect-error Source row must match the contract.
      data: { rowCount: 1, rows: [{ id: "a", name: 3 }] },
      refetch: () => Promise.resolve(),
    },
  });
  useDataGridSource({
    columns: [],
    contract,
    // @ts-expect-error getRowId must consume the contract row.
    getRowId: (row: { other: string }) => row.other,
    source: { data: undefined, refetch: () => Promise.resolve() },
  });
  return surface.table.getRowModel().rows[0]?.original.name;
};
