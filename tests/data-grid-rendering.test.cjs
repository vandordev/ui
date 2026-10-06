const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");

test("native table composition renders cells and three-state sorting with real selection", async () => {
  const { Window } = await import("happy-dom");
  const dom = new Window({ url: "http://localhost" });
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "SVGElement",
    "Element",
    "Node",
    "NodeFilter",
    "MouseEvent",
    "PointerEvent",
    "KeyboardEvent",
    "MutationObserver",
    "ResizeObserver",
    "Event",
    "EventTarget",
    "CustomEvent",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
  ]) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === "window" ? dom : dom[name],
    });
  }
  delete dom.Element.prototype.animate;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const {
    QueryClient,
    QueryClientProvider,
    queryOptions,
  } = require("@tanstack/react-query");
  const { z } = require("zod");
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const schemas = jiti("../registry/new-york/data-grid-schema.ts");
  const columnsApi = jiti("../registry/new-york/data-grid-columns.tsx");
  const hook = jiti("../registry/new-york/use-data-grid.ts");
  const ui = jiti("../registry/new-york/data-grid.tsx");
  const contract = schemas.createDataGridContract({
    pagination: "page",
    row: z.object({ id: z.string(), name: z.string(), visits: z.number() }),
    filters: z.object({ search: z.string().default("") }),
    sortBy: z.literal("backend_name"),
  });
  const helper = columnsApi.createDataGridColumnHelper(contract);
  const columns = [
    helper.accessor("name", { header: "Name", sortBy: "backend_name" }),
    helper.accessor((row) => row.visits * 2, { id: "score", header: "Score" }),
  ];
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const ref = React.createRef();
  let grid;
  function Demo() {
    grid = hook.useDataGrid({
      contract,
      columns,
      selectionMode: "allMatching",
      getRowId: (row) => row.id,
      queryOptions: (input) =>
        queryOptions({
          queryKey: ["render", input],
          queryFn: async () => ({
            rows: [{ id: "a", name: "Ada", visits: 3 }],
            rowCount: 1,
          }),
        }),
    });
    return React.createElement(
      ui.DataGrid,
      { grid, variant: "striped", density: "compact" },
      React.createElement(
        ui.DataGridViewport,
        { className: "max-h-96" },
        React.createElement(ui.DataGridTable, {
          grid,
          ref,
          "aria-label": "Users",
          stickyHeader: true,
        })
      ),
      React.createElement(ui.DataGridPagination)
    );
  }
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await React.act(async () =>
      root.render(
        React.createElement(
          QueryClientProvider,
          { client },
          React.createElement(Demo)
        )
      )
    );
    await React.act(
      async () => new Promise((resolve) => setTimeout(resolve, 25))
    );
    assert.ok(
      ref.current === host.querySelector("table"),
      "Native table ref forwarded"
    );
    assert.equal(host.querySelectorAll("[data-grid-scroll]").length, 1);
    assert.equal(host.querySelector("tbody").textContent, "Ada6");
    const header = host.querySelector("th button[aria-label]");
    await React.act(async () => header.click());
    assert.deepEqual(grid.request.sorting, [
      { id: "backend_name", desc: false },
    ]);
    assert.equal(
      host.querySelector("th[aria-sort]").getAttribute("aria-sort"),
      "ascending"
    );
    await React.act(async () => header.click());
    assert.equal(grid.request.sorting[0].desc, true);
    await React.act(async () => header.click());
    assert.deepEqual(grid.request.sorting, []);
    await React.act(
      async () => new Promise((resolve) => setTimeout(resolve, 25))
    );
    const select = host.querySelector('[aria-label="Select this page"]');
    await React.act(async () => select.click());
    assert.deepEqual(grid.selection.ids, ["a"]);
    assert.equal(
      host.querySelector("tbody tr").getAttribute("data-selected"),
      "true"
    );
  } finally {
    await React.act(async () => root.unmount());
    client.clear();
    host.remove();
    await dom.happyDOM.abort();
  }
});

test("restored preferences protect locked columns and preserve refs, overrides and events", async () => {
  const { createFixture } = require("./data-grid-ui-fixture.cjs");
  const f = await createFixture();
  const ref = f.React.createRef();
  let clicks = 0;
  try {
    const h = f.React.createElement;
    await f.mount({
      options: {
        state: {
          columnVisibility: { id: false, obsolete: false },
          columnOrder: ["obsolete", "id"],
        },
      },
      table: {
        ref,
        onClick: () => {
          clicks += 1;
        },
        renderRow: (context) =>
          h(f.ui.DataGridRow, {
            ...context.props,
            "data-user": context.row.id,
          }),
        renderCell: (context) =>
          h(f.ui.DataGridCell, {
            ...context.props,
            "data-column": context.native.column.id,
          }),
      },
    });
    assert.deepEqual(
      f.grid.table.getVisibleLeafColumns().map((column) => column.id),
      ["id", "name"]
    );
    assert.ok(
      ref.current === f.host.querySelector("table"),
      "Table ref survives rendering overrides"
    );
    assert.equal(
      f.host.querySelector("tbody tr").getAttribute("data-user"),
      "a"
    );
    assert.equal(
      f.host.querySelector("tbody td").getAttribute("data-column"),
      "id"
    );
    await f.click(f.host.querySelector("tbody td"));
    assert.equal(clicks, 1);
    assert.equal(f.host.querySelectorAll("[data-grid-scroll]").length, 1);
  } finally {
    await f.dispose();
  }
});

test("shift sorting preserves priority and backend response order", async () => {
  const { createFixture } = require("./data-grid-ui-fixture.cjs");
  const f = await createFixture();
  try {
    await f.mount();
    const headers = f.host.querySelectorAll("th button");
    await f.click(headers[0]);
    await f.React.act(async () =>
      headers[1].dispatchEvent(
        new f.dom.MouseEvent("click", { bubbles: true, shiftKey: true })
      )
    );
    await f.settle();
    assert.deepEqual(f.grid.request.sorting, [
      { id: "name", desc: false },
      { id: "id", desc: false },
    ]);
    assert.deepEqual(
      [...f.host.querySelectorAll("tbody tr")].map((row) => row.textContent),
      ["Adaa", "Beab"]
    );
    assert.equal(
      [...headers].every((button) => button.getAttribute("type") === "button"),
      true
    );
  } finally {
    await f.dispose();
  }
});
