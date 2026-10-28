const assert = require("node:assert/strict");
const { test } = require("node:test");
const { setTimeout: delay } = require("node:timers/promises");
const { z } = require("zod");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

test("DataGrid source runs without QueryClientProvider and shares request selection and refresh state", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { createDataGridContract } = f.jiti(
      "../registry/new-york/data-grid-schema.ts"
    );
    const { useDataGridSource } = f.jiti(
      "../registry/new-york/use-data-grid-source.ts"
    );
    const contract = createDataGridContract({
      filters: z.object({ search: z.string().default("") }),
      pagination: "page",
      row: z.object({ id: z.string(), name: z.string() }),
      sortBy: z.enum(["name"]),
    });
    let grid;
    let retries = 0;
    let source = {
      data: undefined,
      loading: true,
      refetch: () => {
        retries += 1;
      },
    };
    const requests = [];
    const Observe = () => {
      grid = useDataGridSource({
        columns: [],
        contract,
        getRowId: (row) => row.id,
        onStateChange: { request: (request) => requests.push(request) },
        selectionMode: "allMatching",
        source,
      });
      return null;
    };
    const render = () => f.render(f.React.createElement(Observe));
    await render();
    assert.equal(grid.presentation.status, "loading");
    source = {
      ...source,
      data: { rowCount: 60, rows: [{ id: "a", name: "Ada" }] },
      loading: false,
    };
    await render();
    assert.equal(grid.presentation.status, "ready");
    assert.equal(grid.table.getRowModel().rows[0].original.name, "Ada");
    await f.React.act(() => grid.toggleRow("a", true));
    assert.deepEqual(grid.selection.ids, ["a"]);
    await f.React.act(() => grid.nextPage());
    assert.equal(grid.request.pagination.pageIndex, 1);
    source = { ...source, refreshing: true };
    await render();
    assert.equal(grid.presentation.status, "refreshing");
    assert.equal(grid.query.data.rows.length, 1);
    await f.React.act(() => grid.setFilter("search", "Ada"));
    assert.equal(grid.request.pagination.pageIndex, 0);
    assert.deepEqual(grid.selection.ids, []);
    assert.equal(requests.at(-1).filters.search, "Ada");
    source = {
      ...source,
      error: new Error("Expected source error"),
      refreshing: false,
    };
    await render();
    assert.equal(grid.presentation.status, "backgroundError");
    grid.query.refetch();
    assert.equal(retries, 1);
    source = { ...source, data: { rowCount: 0, rows: [] }, error: undefined };
    await render();
    assert.equal(grid.presentation.status, "empty");
  } finally {
    await f.cleanup();
  }
});

test("DataGrid source cursor history commits current success and controlled requests remain consumer-owned", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { createDataGridContract } = f.jiti(
      "../registry/new-york/data-grid-schema.ts"
    );
    const { useDataGridSource } = f.jiti(
      "../registry/new-york/use-data-grid-source.ts"
    );
    const contract = createDataGridContract({
      filters: z.object({ search: z.string().default("") }),
      pagination: "cursor",
      row: z.object({ id: z.string() }),
      sortBy: z.enum(["id"]),
    });
    let grid;
    let request = contract.input.parse({ filters: {} });
    const proposed = [];
    let source = {
      data: { nextCursor: "next", rows: [{ id: "a" }] },
      refetch: () => Promise.resolve(),
    };
    const Observe = () => {
      grid = useDataGridSource({
        columns: [],
        contract,
        getRowId: (row) => row.id,
        onStateChange: { request: (next) => proposed.push(next) },
        source,
        state: { request },
      });
      return null;
    };
    const render = () => f.render(f.React.createElement(Observe));
    await render();
    await f.React.act(() => grid.nextPage());
    assert.equal(
      grid.request.pagination.cursor,
      null,
      "Proposal does not replace controlled state"
    );
    request = proposed.at(-1);
    source = { ...source, data: undefined, loading: true };
    await render();
    assert.equal(
      grid.cursorHistory.index,
      0,
      "Pending cursor is not committed"
    );
    source = {
      ...source,
      data: undefined,
      error: new Error("Retry"),
      loading: false,
    };
    await render();
    assert.equal(grid.presentation.status, "error");
    assert.equal(grid.cursorHistory.index, 0);
    source = {
      ...source,
      data: { nextCursor: null, rows: [{ id: "b" }] },
      error: undefined,
    };
    await render();
    assert.equal(grid.cursorHistory.index, 1);
    await f.React.act(() => grid.previousPage());
    assert.equal(proposed.at(-1).pagination.cursor, null);
    request = contract.input.parse({ filters: { search: "restored" } });
    await render();
    assert.equal(grid.filterDraft.search, "restored");
    assert.equal(grid.cursorHistory.index, 0);
  } finally {
    await f.cleanup();
  }
});

test("DataGrid source composes real renderer, search, selection and pagination without a provider", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { createDataGridContract } = f.jiti(
      "../registry/new-york/data-grid-schema.ts"
    );
    const { createDataGridColumnHelper } = f.jiti(
      "../registry/new-york/data-grid-columns.tsx"
    );
    const { useDataGridSource } = f.jiti(
      "../registry/new-york/use-data-grid-source.ts"
    );
    const ui = f.jiti("../registry/new-york/data-grid.tsx");
    const contract = createDataGridContract({
      filters: z.object({ search: z.string().default("") }),
      pagination: "page",
      row: z.object({ id: z.string(), name: z.string() }),
      sortBy: z.literal("name"),
    });
    const column = createDataGridColumnHelper(contract);
    const columns = [
      column.accessor("name", { header: "Name", sortBy: "name" }),
    ];
    const rows = Array.from({ length: 30 }, (_, index) => ({
      id: String(index),
      name: `Person ${index + 1}`,
    }));
    let grid;
    const Observe = () => {
      const [request, setRequest] = f.React.useState(() =>
        contract.input.parse({ filters: {} })
      );
      const matching = rows.filter((row) =>
        row.name.includes(request.filters.search)
      );
      const start = request.pagination.pageIndex * request.pagination.pageSize;
      grid = useDataGridSource({
        columns,
        contract,
        getRowId: (row) => row.id,
        onStateChange: { request: setRequest },
        selectionMode: "allMatching",
        source: {
          data: {
            rowCount: matching.length,
            rows: matching.slice(start, start + request.pagination.pageSize),
          },
          refetch: () => Promise.resolve(),
        },
        state: { request },
      });
      const h = f.React.createElement;
      return h(
        ui.DataGrid,
        { grid },
        h(ui.DataGridSearch, {
          "aria-label": "Search people",
          field: "search",
          grid,
        }),
        h(ui.DataGridSelectionBar),
        h(ui.DataGridTable, { "aria-label": "People", grid }),
        h(ui.DataGridPagination, { pageSizes: [25] })
      );
    };
    await f.render(f.React.createElement(Observe));
    assert.ok(document.querySelector('table[aria-label="People"]') !== null);
    assert.ok(document.body.textContent.includes("Person 1"));
    await f.React.act(() =>
      document.querySelector('[aria-label="Select row 0"]').click()
    );
    assert.deepEqual(grid.selection.ids, ["0"]);
    await f.React.act(() =>
      document.querySelector('[aria-label="Next page"]').click()
    );
    assert.equal(grid.request.pagination.pageIndex, 1);
    assert.ok(document.body.textContent.includes("Person 26"));
    const input = document.querySelector('input[aria-label="Search people"]');
    await f.React.act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      ).set.call(input, "Person 30");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    // Search intentionally debounces; wait only for the configured control delay.
    await f.React.act(() => delay(350));
    assert.equal(grid.request.filters.search, "Person 30");
    assert.equal(grid.request.pagination.pageIndex, 0);
    assert.deepEqual(grid.selection.ids, []);
    assert.equal(document.querySelectorAll("tbody tr").length, 1);
  } finally {
    await f.cleanup();
  }
});

test("DataGrid source shares apply validation debounce reset sorting and same-identity refresh correction", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { createDataGridContract } = f.jiti(
      "../registry/new-york/data-grid-schema.ts"
    );
    const { useDataGridSource } = f.jiti(
      "../registry/new-york/use-data-grid-source.ts"
    );
    const contract = createDataGridContract({
      filters: z.object({
        active: z.boolean().default(true),
        search: z.string().default(""),
      }),
      pagination: "page",
      row: z.object({ id: z.string() }),
      sortBy: z.literal("id"),
    });
    let grid;
    let source = {
      data: { rowCount: 200, rows: [{ id: "a" }] },
      refetch: () => Promise.resolve(),
    };
    let filterMode = "apply";
    const Observe = () => {
      grid = useDataGridSource({
        columns: [],
        contract,
        filterMode,
        getRowId: (row) => row.id,
        initialState: { filters: {}, pagination: { pageIndex: 4 } },
        selectionMode: "allMatching",
        source,
      });
      return null;
    };
    const render = () => f.render(f.React.createElement(Observe));
    await render();
    await f.React.act(() => grid.setFilter("active", "invalid"));
    await f.React.act(() => {
      grid.applyFilters();
    });
    assert.equal(grid.request.filters.active, true);
    assert.equal(typeof grid.filterErrors.active, "string");
    await f.React.act(() => grid.setFilter("active", false));
    await f.React.act(() => grid.setFilter("search", "Ada", { debounce: 40 }));
    await f.React.act(() => {
      grid.applyFilters();
    });
    assert.deepEqual(grid.request.filters, { active: false, search: "Ada" });
    assert.equal(grid.request.pagination.pageIndex, 0);
    await f.React.act(() => grid.selectAllMatching());
    assert.equal(grid.selection.mode, "allMatching");
    await f.React.act(() => {
      grid.setSorting([{ desc: true, id: "id" }]);
    });
    assert.equal(grid.selection.mode, "allMatching");
    assert.deepEqual(grid.request.sorting, [{ desc: true, id: "id" }]);
    await f.React.act(() => {
      grid.setPageSize(10);
    });
    assert.equal(grid.request.pagination.pageSize, 10);
    source = { ...source, data: { rowCount: 200, rows: [{ id: "b" }] } };
    await render();
    assert.equal(
      grid.selection.mode,
      "allMatching",
      "Immutable page update retains descriptor"
    );
    await f.React.act(() => {
      grid.setPageIndex(4);
    });
    const sameData = source.data;
    // Consumer completes a refresh in place; the activity edge must reconcile it.
    source = { ...source, refreshing: true };
    await render();
    sameData.rowCount = 2;
    source = { ...source, refreshing: false };
    await render();
    assert.ok(source.data === sameData);
    assert.equal(grid.request.pagination.pageIndex, 0);
    filterMode = "immediate";
    await render();
    await f.React.act(() =>
      grid.setFilter("search", "Grace", { debounce: 40 })
    );
    await f.React.act(() => grid.resetFilters());
    await f.React.act(() => delay(65));
    assert.deepEqual(grid.request.filters, { active: true, search: "" });
    assert.equal(grid.filterDraft.search, "");
    assert.deepEqual(grid.selection.ids, []);
  } finally {
    await f.cleanup();
  }
});

test("DataGrid source real feedback retains rows on refresh and retry recovers an initial error", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { createDataGridContract } = f.jiti(
      "../registry/new-york/data-grid-schema.ts"
    );
    const { createDataGridColumnHelper } = f.jiti(
      "../registry/new-york/data-grid-columns.tsx"
    );
    const { useDataGridSource } = f.jiti(
      "../registry/new-york/use-data-grid-source.ts"
    );
    const { DataGrid, DataGridTable } = f.jiti(
      "../registry/new-york/data-grid.tsx"
    );
    const contract = createDataGridContract({
      filters: z.object({}),
      pagination: "page",
      row: z.object({ id: z.string() }),
      sortBy: z.literal("id"),
    });
    const column = createDataGridColumnHelper(contract);
    const columns = [column.accessor("id", { header: "ID" })];
    let retries = 0;
    let grid;
    let fail = true;
    let refresh = false;
    const Observe = () => {
      const [data, setData] = f.React.useState();
      grid = useDataGridSource({
        columns,
        contract,
        getRowId: (row) => row.id,
        source: {
          data,
          error: fail ? new Error("Expected local failure") : undefined,
          refetch: () => {
            retries += 1;
            fail = false;
            setData({ rowCount: 1, rows: [{ id: "Recovered" }] });
          },
          refreshing: refresh,
        },
      });
      return f.React.createElement(
        DataGrid,
        { grid },
        f.React.createElement(DataGridTable, { grid })
      );
    };
    const render = () => f.render(f.React.createElement(Observe));
    await render();
    assert.equal(grid.presentation.status, "error");
    const retry = [...document.querySelectorAll("button")].find((button) =>
      /retry|try again/i.test(button.textContent)
    );
    assert.ok(retry !== undefined, "Error renders a real retry action");
    await f.React.act(() => retry.click());
    assert.equal(retries, 1);
    assert.ok(
      document.querySelector("tbody").textContent.includes("Recovered")
    );
    refresh = true;
    await render();
    assert.equal(grid.presentation.status, "refreshing");
    assert.ok(
      document.querySelector("tbody").textContent.includes("Recovered")
    );
    fail = true;
    refresh = false;
    await render();
    assert.equal(grid.presentation.status, "backgroundError");
    assert.ok(
      document.querySelector("tbody").textContent.includes("Recovered")
    );
  } finally {
    await f.cleanup();
  }
});
