import { useTable } from "@tanstack/react-table";
import { z } from "zod";

import {
  createDataGridColumnHelper,
  dataGridFeatures,
} from "../registry/new-york/data-grid-columns";
import { createDataGridContract } from "../registry/new-york/data-grid-schema";

const contract = createDataGridContract({
  pagination: "page",
  row: z.object({ id: z.string(), name: z.string(), visits: z.number() }),
  filters: z.object({}),
  sortBy: z.enum(["backend_name", "score"]),
});
const column = createDataGridColumnHelper(contract);
const columns = [
  column.accessor("name", {
    header: "Name",
    sortBy: "backend_name",
    cell: ({ value, row }) => value.toUpperCase() + row.id,
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
// @ts-expect-error Backend sorting keys are distinct from accessor keys.
column.accessor("name", { header: "Name", sortBy: "name" });
// @ts-expect-error Unknown accessor key.
column.accessor("password", { header: "Password" });
// @ts-expect-error Computed accessor needs a stable ID.
column.accessor((row) => row.visits, { header: "Visits" });
column.accessor("name", {
  header: "Name",
  // @ts-expect-error String values are not numbers.
  cell: ({ value }) => value.toFixed(),
});
function Consumer() {
  return useTable({
    features: dataGridFeatures,
    columns,
    data: [{ id: "a", name: "Ada", visits: 3 }],
    manualSorting: true,
    manualPagination: true,
  }).getRowModel().rows[0]?.original.name;
}
