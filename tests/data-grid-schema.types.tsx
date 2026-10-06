import { z } from "zod";

import {
  createDataGridContract,
  createDataGridSelectionSchema,
  type DataGridInput,
  type DataGridRawInput,
  type DataGridOutput,
  type DataGridFilters,
} from "../registry/new-york/data-grid-schema";

const page = createDataGridContract({
  pagination: "page",
  row: z.object({ id: z.string(), count: z.string().transform(Number) }),
  filters: z.object({
    search: z.string().default(""),
    active: z.boolean().default(true),
  }),
  sortBy: z.enum(["backend_name", "count"]),
});
const raw: DataGridRawInput<typeof page> = { filters: {} };
const normalized: DataGridInput<typeof page> = page.input.parse(raw);
normalized.pagination.pageIndex.toFixed();
normalized.filters.active.valueOf();
// @ts-expect-error Page pagination has no cursor.
normalized.pagination.cursor;
const output: DataGridOutput<typeof page> = {
  rows: [{ id: "a", count: 3 }],
  rowCount: 1,
};
output.rows[0].count.toFixed();
// @ts-expect-error Row output has been transformed.
output.rows[0].count.toUpperCase();
const filters: DataGridFilters<typeof page> = { search: "", active: true };
// @ts-expect-error Filter values remain schema-derived.
filters.active = "true";
// @ts-expect-error Backend sorting keys are allowlisted.
normalized.sorting.push({ id: "name", desc: false });
const cursor = createDataGridContract({
  pagination: "cursor",
  row: page.row,
  filters: page.filters,
  sortBy: page.sortBy,
});
const cursorInput = cursor.input.parse({ filters: {} });
cursorInput.pagination.cursor?.toUpperCase();
// @ts-expect-error Cursor pagination has no arbitrary page index.
cursorInput.pagination.pageIndex;
const cursorOutput: DataGridOutput<typeof cursor> = {
  rows: [],
  nextCursor: null,
};
// @ts-expect-error Cursor responses do not have totals.
cursorOutput.rowCount;
const selection = createDataGridSelectionSchema({
  filters: page.filters,
  id: z.string(),
});
const descriptor: z.output<typeof selection> = {
  mode: "allMatching",
  filters: { search: "", active: true },
  excludedIds: [],
};
descriptor.filters.active.valueOf();
page.input.extend({ tenant: z.string() }).parse({ tenant: "a", filters: {} });
