const assert = require("node:assert/strict");
const { test, before, after, afterEach } = require("node:test");
const { createJiti } = require("jiti");
const { z } = require("zod");
let dom,
  React,
  createRoot,
  queryApi,
  api,
  schemas,
  root,
  host,
  client,
  grid,
  options,
  requests;
before(async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
  ]) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === "window" ? dom : dom[name],
    });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  React = require("react");
  ({ createRoot } = require("react-dom/client"));
  // Jiti loads the hook through the CJS Query export. Provider must use the same
  // public export condition, not the separate ESM context instance.
  queryApi = require("@tanstack/react-query");
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  schemas = jiti("../registry/new-york/data-grid-schema.ts");
  // Import in the test rather than before() so missing production code is the red case.
  api = () => jiti("../registry/new-york/use-data-grid.ts");
});
afterEach(async () => {
  if (root) await React.act(async () => root.unmount());
  client?.clear();
  host?.remove();
  root = null;
});
after(async () => dom.happyDOM.abort());
async function settle() {
  await React.act(
    async () => new Promise((resolve) => setTimeout(resolve, 15))
  );
}
async function mount(overrides = {}) {
  const contract = schemas.createDataGridContract({
    pagination: "page",
    row: z.object({ id: z.string(), name: z.string() }),
    filters: z.object({
      search: z.string().default(""),
      active: z.boolean().default(true),
    }),
    sortBy: z.enum(["name"]),
  });
  client = new queryApi.QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  requests = [];
  options = {
    contract,
    columns: [],
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 4 }, filters: {} },
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["users", "tenant-a", input],
        queryFn: async () => {
          requests.push(structuredClone(input));
          return { rows: [{ id: "a", name: "Ada" }], rowCount: 200 };
        },
      }),
    ...overrides,
  };
  function Observe() {
    grid = api().useDataGrid(options);
    return null;
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const render = () =>
    root.render(
      React.createElement(
        queryApi.QueryClientProvider,
        { client },
        React.createElement(Observe)
      )
    );
  await React.act(async () => render());
  await settle();
  return { render };
}

test("filter change issues one request at the first page", async () => {
  await mount();
  await React.act(async () => grid.setFilter("search", "Ada"));
  await settle();
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[1], {
    pagination: { pageIndex: 0, pageSize: 25 },
    sorting: [],
    filters: { search: "Ada", active: true },
  });
  assert.equal(grid.request.pagination.pageIndex, 0);
});

test("debounced fields merge with newer changes and reset cancels pending commits", async () => {
  await mount();
  await React.act(async () =>
    grid.setFilter("search", "Ada", { debounce: 40 })
  );
  assert.equal(grid.filterDraft.search, "Ada");
  await React.act(async () => grid.setFilter("active", false));
  await React.act(
    async () => new Promise((resolve) => setTimeout(resolve, 65))
  );
  await settle();
  assert.deepEqual(grid.request.filters, { search: "Ada", active: false });
  await React.act(async () =>
    grid.setFilter("search", "Grace", { debounce: 40 })
  );
  await React.act(async () => grid.resetFilters());
  await React.act(
    async () => new Promise((resolve) => setTimeout(resolve, 65))
  );
  assert.deepEqual(grid.request.filters, { search: "", active: true });
  assert.equal(grid.filterDraft.search, "");
});

test("Apply uses the visible draft immediately and invalid drafts never query", async () => {
  await mount({ filterMode: "apply" });
  await React.act(async () =>
    grid.setFilter("search", "Ada", { debounce: 300 })
  );
  await React.act(async () => grid.setFilter("active", false));
  assert.equal(requests.length, 1);
  await React.act(async () => grid.applyFilters());
  await settle();
  assert.deepEqual(grid.request.filters, { search: "Ada", active: false });
  await React.act(async () => grid.setFilter("active", "invalid"));
  await React.act(async () => grid.applyFilters());
  assert.equal(requests.length, 2);
  assert.equal(typeof grid.filterErrors.active, "string");
  assert.equal(grid.filterDraft.active, "invalid");
});

test("controlled request proposes one atomic update and external restore rebases draft", async () => {
  const proposed = [];
  const state = {
    pagination: { pageIndex: 4, pageSize: 25 },
    sorting: [],
    filters: { search: "", active: true },
  };
  const fixture = await mount({
    state: { request: state },
    onStateChange: { request: (value) => proposed.push(value) },
  });
  await React.act(async () => grid.setFilter("search", "Ada", { debounce: 0 }));
  assert.equal(requests.length, 1);
  assert.equal(proposed.length, 1);
  assert.equal(proposed[0].pagination.pageIndex, 0);
  assert.equal(grid.request.filters.search, "");
  options = {
    ...options,
    state: {
      request: { ...proposed[0], filters: { search: "Grace", active: true } },
    },
  };
  await React.act(async () => fixture.render());
  await settle();
  assert.equal(grid.filterDraft.search, "Grace");
  assert.equal(grid.request.filters.search, "Grace");
});

test("native selected options preserve raw cache and disabled status", async () => {
  await mount({
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["selected", input],
        queryFn: async () => ({
          payload: {
            rows: [
              { id: "z", name: "Zoe" },
              { id: "a", name: "Ada" },
            ],
            rowCount: 200,
          },
          token: "raw",
        }),
        select: (raw) => raw.payload,
        staleTime: Infinity,
      }),
  });
  assert.deepEqual(
    grid.table.getRowModel().rows.map((row) => row.id),
    ["z", "a"]
  );
  assert.equal("token" in grid.query.data, false);
  assert.equal(client.getQueryData(["selected", grid.request]).token, "raw");
});

test("selection survives paging and sorting but effective filters clear it", async () => {
  await mount({ selectionMode: "allMatching" });
  await React.act(async () => grid.togglePage(true));
  assert.deepEqual(grid.selection, { mode: "explicit", ids: ["a"] });
  await React.act(async () => grid.setPageIndex(1));
  await settle();
  assert.deepEqual(grid.selection.ids, ["a"]);
  await React.act(async () => grid.setSorting([{ id: "name", desc: false }]));
  await settle();
  assert.deepEqual(grid.selection.ids, ["a"]);
  await React.act(async () => grid.selectAllMatching());
  assert.equal(grid.selection.mode, "allMatching");
  await React.act(async () => grid.setFilter("active", false));
  assert.deepEqual(grid.selection, { mode: "explicit", ids: [] });
});

test("disabled query is inactive rather than active loading", async () => {
  await mount({
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["disabled", input],
        queryFn: async () => ({ rows: [], rowCount: 0 }),
        enabled: false,
      }),
  });
  assert.equal(grid.presentation.status, "inactive");
  assert.equal(grid.canSelectRows, false);
});

test("cursor visits commit only on success and failed next remains retryable", async () => {
  const contract = schemas.createDataGridContract({
    pagination: "cursor",
    row: z.object({ id: z.string(), name: z.string() }),
    filters: z.object({ search: z.string().default("") }),
    sortBy: z.literal("name"),
  });
  let fail = true;
  await mount({
    contract,
    initialState: { filters: {} },
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["cursor", input],
        queryFn: async () => {
          if (input.pagination.cursor === "a" && fail)
            throw new Error("private service error");
          return {
            rows: [{ id: input.pagination.cursor ?? "first", name: "Ada" }],
            nextCursor: input.pagination.cursor === null ? "a" : null,
          };
        },
      }),
  });
  assert.deepEqual(grid.cursorHistory, { cursors: [null], index: 0 });
  await React.act(async () => grid.nextPage());
  await settle();
  assert.equal(grid.query.isError, true);
  assert.deepEqual(grid.cursorHistory, { cursors: [null], index: 0 });
  assert.equal(grid.canPreviousPage, true);
  fail = false;
  await React.act(async () => grid.query.refetch());
  await settle();
  assert.deepEqual(grid.cursorHistory, { cursors: [null, "a"], index: 1 });
  await React.act(async () => grid.previousPage());
  await settle();
  assert.equal(grid.request.pagination.cursor, null);
  assert.equal(grid.cursorHistory.index, 0);
  assert.equal(grid.canNextPage, true);
});

test("placeholder rows cannot select or navigate using another request metadata", async () => {
  let resolve;
  await mount({
    selectionMode: "allMatching",
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["placeholder", input],
        queryFn: () =>
          input.pagination.pageIndex === 4
            ? Promise.resolve({
                rows: [{ id: "a", name: "Ada" }],
                rowCount: 200,
              })
            : new Promise((done) => {
                resolve = done;
              }),
        placeholderData: queryApi.keepPreviousData,
      }),
  });
  await React.act(async () => grid.togglePage(true));
  await React.act(async () => grid.setPageIndex(1));
  assert.equal(grid.query.isPlaceholderData, true);
  assert.equal(grid.canSelectRows, false);
  assert.equal(grid.canNextPage, false);
  assert.equal(grid.canPreviousPage, false);
  await React.act(async () => grid.toggleRow("a", false));
  assert.deepEqual(grid.selection.ids, ["a"]);
  await React.act(async () =>
    resolve({ rows: [{ id: "b", name: "Bea" }], rowCount: 200 })
  );
  await settle();
  assert.equal(grid.canSelectRows, true);
  await React.act(async () => grid.clearSelection());
  assert.deepEqual(grid.selection.ids, []);
});

test("codec restores controlled raw bindings and does not decode on pagination", async () => {
  let decodes = 0;
  const contract = schemas.createDataGridContract({
    pagination: "page",
    row: z.object({ id: z.string(), name: z.string() }),
    filters: z.object({
      search: z.codec(z.string(), z.string(), {
        decode: (value) => {
          decodes += 1;
          return `:${value}`;
        },
        encode: (value) => value.slice(1),
      }),
    }),
    sortBy: z.literal("name"),
  });
  const changes = [];
  const fixture = await mount({
    contract,
    initialState: { filters: { search: "baseline" } },
    state: {
      request: {
        pagination: { pageIndex: 2, pageSize: 25 },
        filters: { search: ":Ada" },
        sorting: [],
      },
    },
    onStateChange: { request: (value) => changes.push(value) },
  });
  assert.equal(grid.getFilterBinding("search").value, "Ada");
  const before = decodes;
  await React.act(async () => grid.setPageIndex(3));
  assert.equal(decodes, before);
  assert.equal(changes[0].filters.search, ":Ada");
  options = {
    ...options,
    state: {
      request: { ...options.state.request, filters: { search: ":Grace" } },
    },
  };
  await React.act(async () => fixture.render());
  assert.equal(grid.getFilterBinding("search").value, "Grace");
  assert.equal(decodes, before);
});

test("out of range current success corrects once without placeholder correction", async () => {
  await mount({
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["correction", input],
        queryFn: async () => {
          requests.push(structuredClone(input));
          return { rows: [], rowCount: 30 };
        },
      }),
  });
  await settle();
  assert.deepEqual(
    requests.map((input) => input.pagination.pageIndex),
    [4, 1]
  );
  assert.equal(grid.request.pagination.pageIndex, 1);
  await settle();
  assert.equal(requests.length, 2);
});

test("background error preserves same-input data without exposing a second cache", async () => {
  let fail = false;
  await mount({
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["background", input],
        queryFn: async () => {
          if (fail) throw new Error("private backend failure");
          return { rows: [{ id: "a", name: "Ada" }], rowCount: 200 };
        },
      }),
  });
  fail = true;
  await React.act(async () => grid.query.refetch());
  await settle();
  assert.equal(grid.presentation.status, "backgroundError");
  assert.equal(grid.table.getRowModel().rows[0].original.name, "Ada");
});

test("synchronous edits merge against latest uncontrolled request and selection", async () => {
  await mount({
    selectionMode: "explicit",
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["synchronous", input],
        queryFn: async () => ({
          rows: [
            { id: "a", name: "Ada" },
            { id: "b", name: "Bea" },
          ],
          rowCount: 200,
        }),
      }),
  });
  await React.act(async () => {
    grid.setFilter("search", "Ada");
    grid.setFilter("active", false);
  });
  await settle();
  assert.deepEqual(grid.request.filters, { search: "Ada", active: false });
  await React.act(async () => {
    grid.toggleRow("a", true);
    grid.toggleRow("b", true);
  });
  assert.deepEqual(grid.selection.ids, ["a", "b"]);
});

test("rejected controlled proposals never contaminate later applied filter requests", async () => {
  const proposals = [];
  await mount({
    state: {
      request: {
        pagination: { pageIndex: 4, pageSize: 25 },
        sorting: [],
        filters: { search: "", active: true },
      },
    },
    onStateChange: { request: (value) => proposals.push(value) },
  });
  await React.act(async () => grid.setFilter("search", "rejected"));
  await React.act(async () => grid.setFilter("active", false));
  assert.equal(grid.request.filters.search, "");
  assert.deepEqual(proposals[1].filters, { search: "", active: false });
});

test("paused network request has explicit waiting state and resumes natively", async () => {
  queryApi.onlineManager.setOnline(false);
  try {
    await mount();
    assert.equal(grid.presentation.status, "paused");
    assert.equal(requests.length, 0);
    await React.act(async () => queryApi.onlineManager.setOnline(true));
    await settle();
    assert.equal(grid.query.isSuccess, true);
  } finally {
    queryApi.onlineManager.setOnline(true);
  }
});

test("unmount cancels pending debounce and fresh scope has baseline draft and selection", async () => {
  const proposals = [];
  await mount({
    selectionMode: "explicit",
    onStateChange: { request: (value) => proposals.push(value) },
  });
  await React.act(async () => grid.togglePage(true));
  await React.act(async () =>
    grid.setFilter("search", "later", { debounce: 50 })
  );
  await React.act(async () => root.unmount());
  root = null;
  client.clear();
  host.remove();
  await new Promise((resolve) => setTimeout(resolve, 70));
  assert.equal(proposals.length, 0);
  await mount({ selectionMode: "explicit" });
  assert.deepEqual(grid.selection, { mode: "explicit", ids: [] });
  assert.equal(grid.filterDraft.search, "");
});

test("new request failure does not keep unrelated rows as current data", async () => {
  await mount({
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["key-error", input],
        queryFn: async () => {
          if (input.filters.search) throw new Error("private failure");
          return { rows: [{ id: "a", name: "Ada" }], rowCount: 200 };
        },
      }),
  });
  await React.act(async () => grid.setFilter("search", "missing"));
  await settle();
  assert.equal(grid.presentation.status, "error");
  assert.equal(grid.table.getRowModel().rows.length, 0);
});

test("controlled column preferences and selection emit without internal competition", async () => {
  const changes = { visibility: [], order: [], selection: [] };
  await mount({
    selectionMode: "explicit",
    state: {
      columnVisibility: { name: true },
      columnOrder: [],
      selection: { mode: "explicit", ids: [] },
    },
    onStateChange: {
      columnVisibility: (value) => changes.visibility.push(value),
      columnOrder: (value) => changes.order.push(value),
      selection: (value) => changes.selection.push(value),
    },
  });
  await React.act(async () => {
    grid.setColumnVisibility({ name: false });
    grid.setColumnOrder(["obsolete"]);
    grid.togglePage(true);
  });
  assert.deepEqual(grid.columnVisibility, {});
  assert.deepEqual(grid.selection.ids, []);
  assert.deepEqual(changes.visibility, [{}]);
  assert.deepEqual(changes.order, [[]]);
  assert.deepEqual(changes.selection[0].ids, ["a"]);
});

test("rejected controlled filters preserve applied selection until parent acceptance", async () => {
  const state = {
    pagination: { pageIndex: 0, pageSize: 25 },
    sorting: [],
    filters: { search: "", active: true },
  };
  const proposals = [];
  const fixture = await mount({
    selectionMode: "explicit",
    state: { request: state },
    onStateChange: { request: (next) => proposals.push(next) },
  });
  await React.act(async () => grid.togglePage(true));
  await React.act(async () => grid.setFilter("search", "Ada"));
  assert.deepEqual(grid.selection.ids, ["a"]);
  options = { ...options, state: { request: proposals[0] } };
  await React.act(async () => fixture.render());
  assert.deepEqual(grid.selection.ids, []);
});

test("request cancellation and late completion cannot replace current rows", async () => {
  let resolveOld;
  let aborted = false;
  await mount({
    initialState: { filters: { search: "old" } },
    queryOptions: (input) =>
      queryApi.queryOptions({
        queryKey: ["race", input],
        queryFn: ({ signal }) => {
          if (input.filters.search === "old") {
            signal.addEventListener(
              "abort",
              () => {
                aborted = true;
              },
              { once: true }
            );
            return new Promise((resolve) => {
              resolveOld = resolve;
            });
          }
          return Promise.resolve({
            rows: [{ id: "new", name: "Current" }],
            rowCount: 1,
          });
        },
      }),
  });
  await React.act(async () => grid.setFilter("search", "new"));
  await settle();
  assert.equal(aborted, true);
  await React.act(async () =>
    resolveOld({ rows: [{ id: "old", name: "Stale" }], rowCount: 1 })
  );
  await settle();
  assert.equal(grid.table.getRowModel().rows[0].id, "new");
});
