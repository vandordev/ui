import { z } from "zod";

import { createDataGridContract } from "../registry/new-york/data-grid-schema";
import {
  createDataGridAllMatchingSelection,
  toggleDataGridRow,
} from "../registry/new-york/data-grid-selection";
import {
  transitionDataGridRequest,
  validateDataGridFilters,
} from "../registry/new-york/data-grid-state";

const contract = createDataGridContract({
  pagination: "page",
  row: z.object({ id: z.string() }),
  filters: z.object({ active: z.boolean().default(true) }),
  sortBy: z.literal("name"),
});
const request = contract.input.parse({ filters: {} });
const next = transitionDataGridRequest(contract, request, {
  type: "filters",
  value: { active: false },
});
next.request.pagination.pageIndex.toFixed();
transitionDataGridRequest(contract, request, {
  type: "filters",
  // @ts-expect-error Filter state is schema-derived.
  value: { active: "false" },
});
const valid = validateDataGridFilters(contract, { active: false });
if (valid.success) valid.filters.active.valueOf();
const selection = createDataGridAllMatchingSelection(next.request.filters);
const toggled = toggleDataGridRow(selection, "a");
if (toggled.mode === "allMatching") toggled.filters.active.valueOf();
