import { z } from "zod";

export interface DataGridPaginationOptions {
  pageSize?: number;
  maxPageSize?: number;
}

function pageSizeSchema({
  pageSize = 25,
  maxPageSize = 100,
}: DataGridPaginationOptions = {}) {
  const limit = z
    .number()
    .int()
    .positive()
    .max(Number.MAX_SAFE_INTEGER)
    .parse(maxPageSize);
  const schema = z.number().int().positive().max(limit);
  return schema.default(schema.parse(pageSize));
}

export function createDataGridPagePaginationSchema(
  options?: DataGridPaginationOptions
) {
  return z.object({
    pageIndex: z
      .number()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER)
      .default(0),
    pageSize: pageSizeSchema(options),
  });
}

export function createDataGridCursorPaginationSchema(
  options?: DataGridPaginationOptions
) {
  return z.object({
    cursor: z.string().nullable().default(null),
    pageSize: pageSizeSchema(options),
  });
}

export function createDataGridSortingSchema<S extends z.ZodType<string>>(
  sortBy: S
) {
  return z
    .array(z.object({ desc: z.boolean(), id: sortBy }))
    .superRefine((sorting, context) => {
      const seen = new Set<string>();
      sorting.forEach((value, index) => {
        const sort = value as { id: string; desc: boolean };
        if (seen.has(sort.id)) {
          context.addIssue({
            code: "custom",
            message: "Duplicate sorting key",
            path: [index, "id"],
          });
        }
        seen.add(sort.id);
      });
    })
    .default([]);
}

export function createDataGridPageOutputSchema<R extends z.ZodType>(row: R) {
  return z.object({
    rowCount: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    rows: z.array(row),
  });
}

export function createDataGridCursorOutputSchema<R extends z.ZodType>(row: R) {
  return z.object({ nextCursor: z.string().nullable(), rows: z.array(row) });
}

type PagePagination = ReturnType<typeof createDataGridPagePaginationSchema>;
type CursorPagination = ReturnType<typeof createDataGridCursorPaginationSchema>;
type PaginationSchema<M extends "page" | "cursor"> = M extends "page"
  ? PagePagination
  : CursorPagination;
type OutputSchema<
  M extends "page" | "cursor",
  R extends z.ZodType,
> = M extends "page"
  ? ReturnType<typeof createDataGridPageOutputSchema<R>>
  : ReturnType<typeof createDataGridCursorOutputSchema<R>>;

export function createDataGridContract<
  M extends "page" | "cursor",
  R extends z.ZodType<Record<string, unknown>>,
  F extends z.ZodType<
    Record<string, unknown>,
    Record<string, unknown> | undefined
  >,
  S extends z.ZodType<string>,
>({
  pagination: mode,
  row,
  filters,
  sortBy,
  ...options
}: DataGridPaginationOptions & {
  pagination: M;
  row: R;
  filters: F;
  sortBy: S;
}) {
  // The discriminant determines the public schemas, preserving page/cursor inference.
  const page = createDataGridPagePaginationSchema(options);
  const cursor = createDataGridCursorPaginationSchema(options);
  const pagination = (mode === "page" ? page : cursor) as PaginationSchema<M>;
  const sorting = createDataGridSortingSchema(sortBy);
  const requestPagination = (
    mode === "page" ? page.prefault({}) : cursor.prefault({})
  ) as M extends "page"
    ? z.ZodPrefault<PagePagination>
    : z.ZodPrefault<CursorPagination>;
  const input = z.object({ filters, pagination: requestPagination, sorting });
  const output = (
    mode === "page"
      ? createDataGridPageOutputSchema(row)
      : createDataGridCursorOutputSchema(row)
  ) as OutputSchema<M, R>;
  return { filters, input, mode, output, pagination, row, sortBy, sorting };
}

export type DataGridContract = ReturnType<typeof createDataGridContract>;
export type DataGridInput<C extends DataGridContract> = z.output<C["input"]>;
export type DataGridRawInput<C extends DataGridContract> = z.input<C["input"]>;
export type DataGridOutput<C extends DataGridContract> = z.output<C["output"]>;
export type DataGridRowData<C extends DataGridContract> = z.output<C["row"]>;
export type DataGridFilters<C extends DataGridContract> = z.output<
  C["filters"]
>;
export type DataGridFilterInput<C extends DataGridContract> = NonNullable<
  z.input<C["filters"]>
>;
export type DataGridSortKey<C extends DataGridContract> = z.output<C["sortBy"]>;

export function createDataGridSelectionSchema<
  F extends z.ZodType,
  I extends z.ZodType<string>,
>({ filters, id }: { filters: F; id: I }) {
  const ids = z.array(id).transform((values) => [...new Set(values)]);
  return z.discriminatedUnion("mode", [
    z.object({ ids, mode: z.literal("explicit") }),
    z.object({ excludedIds: ids, filters, mode: z.literal("allMatching") }),
  ]);
}

export type DataGridSelection<F = Record<string, unknown>> =
  | { mode: "explicit"; ids: string[] }
  | { mode: "allMatching"; filters: F; excludedIds: string[] };
