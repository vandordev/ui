"use client";

import { useState } from "react";
import { z } from "zod";

import { Button } from "@/registry/new-york/button";
import {
  DataGrid,
  DataGridPagination,
  DataGridSearch,
  DataGridSelectionBar,
  DataGridTable,
  DataGridToolbar,
} from "@/registry/new-york/data-grid";
import { createDataGridColumnHelper } from "@/registry/new-york/data-grid-columns";
import { createDataGridContract } from "@/registry/new-york/data-grid-schema";
import { useDataGridSource } from "@/registry/new-york/use-data-grid-source";

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
  name: `Person ${String(index + 1).padStart(2, "0")}`,
}));

/** Local deterministic source, not a transport/cache or stale-response example. */
export const DataGridSourceDemo = () => {
  const [phase, setPhase] = useState<
    "loading" | "ready" | "refreshing" | "error" | "backgroundError"
  >("loading");
  const [request, setRequest] = useState(() =>
    contract.input.parse({ filters: {} })
  );
  const matching = records.filter((row) =>
    row.name.toLowerCase().includes(request.filters.search.toLowerCase())
  );
  const [sort] = request.sorting;
  if (sort) {
    matching.sort(
      (a, b) => (sort.desc ? -1 : 1) * a.name.localeCompare(b.name)
    );
  }
  const start = request.pagination.pageIndex * request.pagination.pageSize;
  const hasData = phase !== "loading" && phase !== "error";
  const pending = phase === "loading" || phase === "refreshing";
  const grid = useDataGridSource({
    columns,
    contract,
    getRowId: (row) => row.id,
    onStateChange: { request: setRequest },
    selectionMode: "allMatching",
    source: {
      data: hasData
        ? {
            rowCount: matching.length,
            rows: matching.slice(start, start + request.pagination.pageSize),
          }
        : undefined,
      error:
        phase === "error" || phase === "backgroundError"
          ? new Error("Simulated source failure")
          : undefined,
      loading: phase === "loading",
      refetch: () => setPhase(hasData ? "refreshing" : "loading"),
      refreshing: phase === "refreshing",
    },
    state: { request },
  });
  return (
    <div className="grid w-full gap-3">
      <p className="text-sm text-muted-foreground">
        Local source only: complete or fail each request manually. Refresh keeps
        existing rows. Your application owns transport, cache and response
        ordering.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!pending} onClick={() => setPhase("ready")}>
          Complete request
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => grid.query.refetch()}
        >
          Refresh source
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => setPhase(hasData ? "backgroundError" : "error")}
        >
          Fail request
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            grid.resetFilters();
            grid.clearSelection();
            setRequest(contract.input.parse({ filters: {} }));
            setPhase("loading");
          }}
        >
          Restart demo
        </Button>
      </div>
      <output className="text-xs text-muted-foreground" aria-live="polite">
        Source state: {phase}
      </output>
      <DataGrid grid={grid} density="compact">
        <DataGridToolbar>
          <DataGridSearch
            grid={grid}
            field="search"
            clearable
            aria-label="Search source people"
          />
        </DataGridToolbar>
        <DataGridSelectionBar />
        <DataGridTable grid={grid} aria-label="Source-owned people" />
        <DataGridPagination pageSizes={[25]} />
      </DataGrid>
    </div>
  );
};
