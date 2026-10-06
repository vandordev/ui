import {
  columnOrderingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";
import type {
  CellContext,
  ColumnDef,
  HeaderContext,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

import type {
  DataGridContract,
  DataGridRowData,
  DataGridSortKey,
} from "./data-grid-schema";

export const dataGridFeatures = tableFeatures({
  columnOrderingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
});
export type DataGridFeatures = typeof dataGridFeatures;
export interface DataGridColumnMeta<S extends string = string> {
  label: string;
  sortBy?: S;
}
export type DataGridColumnDefinition<C extends DataGridContract> = ColumnDef<
  DataGridFeatures,
  DataGridRowData<C>,
  unknown
> & {
  id: string;
  meta: { dataGrid: DataGridColumnMeta<DataGridSortKey<C>> };
};
export interface DataGridCellContext<C extends DataGridContract, V> {
  value: V;
  row: DataGridRowData<C>;
  native: CellContext<DataGridFeatures, DataGridRowData<C>, V>;
}
interface ColumnOptions<C extends DataGridContract, V> {
  id?: string;
  header:
    | ReactNode
    | ((
        context: HeaderContext<DataGridFeatures, DataGridRowData<C>, unknown>
      ) => ReactNode);
  label?: string;
  sortBy?: DataGridSortKey<C>;
  enableHiding?: boolean;
  cell?: (context: DataGridCellContext<C, V>) => ReactNode;
}

export function createDataGridColumnHelper<C extends DataGridContract>(
  _contract: C
) {
  type R = DataGridRowData<C>;
  const native = createColumnHelper<DataGridFeatures, R>();

  function metadata<V>(options: ColumnOptions<C, V>) {
    const label =
      options.label ??
      (typeof options.header === "string" ? options.header : undefined);
    if (!label) {
      throw new Error("Non-text column headers require a text label");
    }
    return { dataGrid: { label, sortBy: options.sortBy } };
  }

  function accessor<K extends keyof R & string>(
    key: K,
    options: ColumnOptions<C, R[K]>
  ): DataGridColumnDefinition<C>;
  function accessor<V>(
    compute: (row: R) => V,
    options: ColumnOptions<C, V> & { id: string }
  ): DataGridColumnDefinition<C>;
  function accessor<V>(
    key: string | ((row: R) => V),
    options: ColumnOptions<C, V>
  ): DataGridColumnDefinition<C> {
    const id = options.id ?? (typeof key === "string" ? key : undefined);
    if (!id) {
      throw new Error("Computed columns require a stable ID");
    }
    const compute = typeof key === "function" ? key : (row: R) => row[key] as V;
    const definition = native.accessor(compute, {
      cell: (context) =>
        options.cell
          ? options.cell({
              value: context.getValue(),
              row: context.row.original,
              native: context,
            })
          : plainValue(context.getValue()),
      enableHiding: options.enableHiding,
      enableSorting: options.sortBy !== undefined,
      header: (context) =>
        typeof options.header === "function"
          ? options.header(
              context as HeaderContext<DataGridFeatures, R, unknown>
            )
          : options.header,
      id,
      meta: metadata(options),
      sortDescFirst: false,
    });
    // The value-specific renderer is closed over here; heterogeneous definitions
    // expose an unknown native value without requiring consumer any/casts.
    return definition as DataGridColumnDefinition<C>;
  }

  function display(
    options: Omit<ColumnOptions<C, never>, "cell" | "id"> & {
      id: string;
      cell?: (context: {
        row: R;
        native: CellContext<DataGridFeatures, R, unknown>;
      }) => ReactNode;
    }
  ): DataGridColumnDefinition<C> {
    if (!options.id) {
      throw new Error("Display columns require a stable ID");
    }
    return native.display({
      cell: (context) =>
        options.cell?.({ row: context.row.original, native: context }) ?? null,
      enableHiding: options.enableHiding,
      enableSorting: options.sortBy !== undefined,
      header: (context) =>
        typeof options.header === "function"
          ? options.header(context)
          : options.header,
      id: options.id,
      meta: metadata(options),
      sortDescFirst: false,
    }) as DataGridColumnDefinition<C>;
  }
  return { accessor, display };
}

function plainValue(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return "—";
  }
  return typeof value === "string" || typeof value === "number" ? value : "—";
}

export function normalizeDataGridColumns<C extends DataGridContract>(
  columns: readonly DataGridColumnDefinition<C>[]
) {
  const ids = new Set<string>();
  for (const column of columns) {
    if (ids.has(column.id)) {
      throw new Error(`Duplicate column ID: ${column.id}`);
    }
    ids.add(column.id);
  }
  return columns;
}

export function normalizeDataGridColumnOrder(
  saved: readonly string[],
  columns: readonly { id: string }[]
) {
  const known = new Set(columns.map((column) => column.id));
  return [
    ...new Set([
      ...saved.filter((id) => known.has(id)),
      ...columns.map((column) => column.id),
    ]),
  ];
}

export function normalizeDataGridColumnVisibility(
  saved: Record<string, boolean>,
  columns: readonly { id: string; enableHiding?: boolean }[]
) {
  return Object.fromEntries(
    columns.flatMap((column) =>
      column.enableHiding === false
        ? [[column.id, true]]
        : column.id in saved
          ? [[column.id, saved[column.id]]]
          : []
    )
  );
}
