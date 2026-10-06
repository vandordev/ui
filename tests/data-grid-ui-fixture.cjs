const { createJiti } = require("jiti");

exports.createFixture = async function createFixture() {
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
  const query = require("@tanstack/react-query");
  const { z } = require("zod");
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const schemas = jiti("../registry/new-york/data-grid-schema.ts");
  const columnApi = jiti("../registry/new-york/data-grid-columns.tsx");
  const hook = jiti("../registry/new-york/use-data-grid.ts");
  const ui = jiti("../registry/new-york/data-grid.tsx");
  const Checkbox = jiti("../registry/new-york/checkbox.tsx").Checkbox;
  const client = new query.QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const result = {
    dom,
    React,
    query,
    z,
    schemas,
    columnApi,
    ui,
    Checkbox,
    client,
    host,
    grid: null,
    requests: [],
  };
  const contract = schemas.createDataGridContract({
    pagination: "page",
    row: z.object({ id: z.string(), name: z.string() }),
    filters: z.object({
      search: z.string().default(""),
      active: z.boolean().default(true),
    }),
    sortBy: z.enum(["name", "id"]),
  });
  const helper = columnApi.createDataGridColumnHelper(contract);
  const columns = [
    helper.accessor("name", { header: "Name", sortBy: "name" }),
    helper.accessor("id", {
      header: "Identifier",
      sortBy: "id",
      enableHiding: false,
    }),
  ];
  result.mount = async (config = {}) => {
    function Demo() {
      const grid = hook.useDataGrid({
        contract,
        columns,
        getRowId: (row) => row.id,
        queryOptions: (input) =>
          query.queryOptions({
            queryKey: ["ui", input],
            queryFn: async () => {
              result.requests.push(structuredClone(input));
              return {
                rows: [
                  { id: "a", name: "Ada" },
                  { id: "b", name: "Bea" },
                ],
                rowCount: 60,
              };
            },
          }),
        ...config.options,
      });
      result.grid = grid;
      return React.createElement(
        ui.DataGrid,
        { grid, ...config.root },
        config.children
          ? config.children(grid, result)
          : React.createElement(ui.DataGridTable, {
              grid,
              "aria-label": "Users",
              ...config.table,
            })
      );
    }
    await React.act(async () =>
      root.render(
        React.createElement(
          query.QueryClientProvider,
          { client },
          React.createElement(Demo)
        )
      )
    );
    await result.settle();
  };
  result.settle = async () =>
    React.act(async () => new Promise((resolve) => setTimeout(resolve, 25)));
  result.click = async (element) => {
    if (!element) throw new Error("Expected control is missing");
    await React.act(async () => element.click());
    await result.settle();
  };
  result.button = (text) =>
    [...host.querySelectorAll("button")].find(
      (button) =>
        button.textContent.trim() === text ||
        button.getAttribute("aria-label") === text
    );
  result.dispose = async () => {
    await React.act(async () => root.unmount());
    client.clear();
    host.remove();
    await dom.happyDOM.abort();
  };
  return result;
};
