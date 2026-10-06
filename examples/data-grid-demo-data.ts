import { z } from "zod";

import { createDataGridColumnHelper } from "@/registry/new-york/data-grid-columns";
import { createDataGridContract } from "@/registry/new-york/data-grid-schema";
import type { DataGridInput } from "@/registry/new-york/data-grid-schema";

const row = z.object({
  active: z.boolean(),
  email: z.string(),
  id: z.string(),
  joined: z.iso.date(),
  name: z.string(),
  visits: z.number().int(),
});
const filters = z.object({
  dates: z
    .object({ from: z.iso.date(), to: z.iso.date() })
    .nullable()
    .default(null),
  search: z.string().default(""),
  status: z.enum(["all", "active", "inactive"]).default("all"),
});
const sortBy = z.enum(["name", "joined", "visits"]);
export const usersGrid = createDataGridContract({
  filters,
  pagination: "page",
  row,
  sortBy,
});
export const cursorUsersGrid = createDataGridContract({
  filters,
  pagination: "cursor",
  row,
  sortBy,
});
export const demoUsers = Array.from({ length: 78 }, (_, index) => ({
  active: index % 3 !== 0,
  email: `person${index + 1}@example.com`,
  id: `user-${String(index + 1).padStart(3, "0")}`,
  joined: `2026-${String((index % 9) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
  name:
    [
      "Ada Lovelace",
      "Grace Hopper",
      "Margaret Hamilton",
      "Katherine Johnson",
      "Mary Jackson",
      "Dorothy Vaughan",
    ][index % 6] + (index < 6 ? "" : ` ${Math.floor(index / 6) + 1}`),
  visits: (index * 17) % 120,
}));

/** In-memory backend simulation, not a production transport or database. */
function matching(input: DataGridInput<typeof usersGrid>) {
  const search = input.filters.search.trim().toLowerCase();
  return demoUsers
    .filter(
      (user) =>
        (!search ||
          `${user.name} ${user.email}`.toLowerCase().includes(search)) &&
        (input.filters.status === "all" ||
          user.active === (input.filters.status === "active")) &&
        (!input.filters.dates ||
          (user.joined >= input.filters.dates.from &&
            user.joined <= input.filters.dates.to))
    )
    .toSorted((a, b) => {
      for (const sort of input.sorting) {
        const left = a[sort.id],
          right = b[sort.id];
        const order =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left).localeCompare(String(right));
        if (order) {
          return sort.desc ? -order : order;
        }
      }
      return a.id.localeCompare(b.id);
    });
}
function wait(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request cancelled", "AbortError"));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Request cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, 120);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
export async function listDemoUsers(
  input: DataGridInput<typeof usersGrid>,
  signal?: AbortSignal
) {
  const request = usersGrid.input.parse(input);
  await wait(signal);
  const rows = matching(request);
  const start = request.pagination.pageIndex * request.pagination.pageSize;
  return usersGrid.output.parse({
    rowCount: rows.length,
    rows: rows.slice(start, start + request.pagination.pageSize),
  });
}
export async function listCursorDemoUsers(
  input: DataGridInput<typeof cursorUsersGrid>,
  signal?: AbortSignal
) {
  const request = cursorUsersGrid.input.parse(input);
  await wait(signal);
  const rows = matching({
    ...request,
    pagination: { pageIndex: 0, pageSize: request.pagination.pageSize },
  });
  // Only this simulated backend constructs/interprets its cursor. The grid does not.
  const start =
    request.pagination.cursor === null
      ? 0
      : rows.findIndex((row) => row.id === request.pagination.cursor);
  if (start < 0) {
    throw new Error("Unknown simulation cursor");
  }
  const end = start + request.pagination.pageSize;
  return cursorUsersGrid.output.parse({
    nextCursor: rows[end]?.id ?? null,
    rows: rows.slice(start, end),
  });
}
export const userColumn = createDataGridColumnHelper(usersGrid);
export const userColumns = [
  userColumn.accessor("name", {
    enableHiding: false,
    header: "Name",
    sortBy: "name",
  }),
  userColumn.accessor("joined", { header: "Joined", sortBy: "joined" }),
  userColumn.accessor("visits", { header: "Visits", sortBy: "visits" }),
];
