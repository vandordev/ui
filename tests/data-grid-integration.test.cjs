const assert = require("node:assert/strict");
const { test } = require("node:test");

test("native Table v9 renders selected remote rows in backend order", async () => {
  const { Window } = await import("happy-dom");
  const dom = new Window({ url: "http://localhost" });
  const names = [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
  ];
  const saved = new Map(
    names.map((name) => [
      name,
      Object.getOwnPropertyDescriptor(globalThis, name),
    ])
  );
  for (const name of names) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === "window" ? dom : dom[name],
    });
  }
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const queryApi = await import("@tanstack/react-query");
  const tableApi = await import("@tanstack/react-table");
  const features = tableApi.tableFeatures({
    rowSortingFeature: tableApi.rowSortingFeature,
    rowPaginationFeature: tableApi.rowPaginationFeature,
    columnVisibilityFeature: tableApi.columnVisibilityFeature,
    columnOrderingFeature: tableApi.columnOrderingFeature,
  });
  const helper = tableApi.createColumnHelper();
  const columns = helper.columns([
    helper.accessor("name", {
      header: "Name",
      cell: (cell) => cell.getValue(),
    }),
    helper.accessor((row) => row.visits * 2, {
      id: "score",
      header: "Score",
      cell: (cell) => cell.getValue(),
    }),
    helper.display({
      id: "actions",
      header: "Actions",
      cell: (cell) => cell.row.original.id,
    }),
  ]);
  const client = new queryApi.QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const requests = [];
  const request = {
    pagination: { pageIndex: 3, pageSize: 25 },
    sorting: [{ id: "name", desc: false }],
    filters: { search: "" },
  };
  let snapshot;
  function Smoke() {
    const query = queryApi.useQuery(
      queryApi.queryOptions({
        queryKey: ["grid-smoke", "tenant-a", request],
        queryFn: async () => {
          requests.push(structuredClone(request));
          return {
            envelope: {
              rows: [
                { id: "z", name: "Zoe", visits: 2 },
                { id: "a", name: "Ada", visits: 3 },
              ],
              rowCount: 100,
            },
            privateToken: "not-rendered",
          };
        },
        select: (raw) => raw.envelope,
        staleTime: Infinity,
      })
    );
    const table = tableApi.useTable({
      features,
      columns,
      data: query.data?.rows ?? [],
      getRowId: (row) => row.id,
      manualSorting: true,
      manualPagination: true,
      autoResetPageIndex: false,
      state: { sorting: request.sorting, pagination: request.pagination },
      rowCount: query.data?.rowCount,
    });
    snapshot = { query, table };
    return React.createElement(
      "table",
      { "aria-label": "Users" },
      React.createElement(
        "tbody",
        null,
        table.getRowModel().rows.map((row) =>
          React.createElement(
            "tr",
            { key: row.id },
            row
              .getVisibleCells()
              .map((cell) =>
                React.createElement(
                  "td",
                  { key: cell.id },
                  React.createElement(table.FlexRender, { cell })
                )
              )
          )
        )
      )
    );
  }
  const host = dom.document.createElement("div");
  dom.document.body.append(host);
  const root = createRoot(host);
  try {
    await React.act(async () =>
      root.render(
        React.createElement(
          queryApi.QueryClientProvider,
          { client },
          React.createElement(Smoke)
        )
      )
    );
    for (let attempt = 0; attempt < 10 && !snapshot.query.data; attempt += 1) {
      await React.act(
        async () => new Promise((resolve) => setTimeout(resolve, 10))
      );
    }
    assert.deepEqual(requests, [request]);
    assert.equal(snapshot.query.isSuccess, true);
    assert.deepEqual(
      snapshot.table.getRowModel().rows.map((row) => row.id),
      ["z", "a"]
    );
    assert.equal(host.textContent, "Zoe4zAda6a");
    assert.equal(snapshot.query.data.rowCount, 100);
    assert.equal("privateToken" in snapshot.query.data, false);
    const cached = client.getQueryData(["grid-smoke", "tenant-a", request]);
    assert.equal(cached.privateToken, "not-rendered");
  } finally {
    await React.act(async () => root.unmount());
    client.clear();
    host.remove();
    await dom.happyDOM.abort();
    for (const name of names) {
      const descriptor = saved.get(name);
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
  }
});
