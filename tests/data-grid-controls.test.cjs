const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createFixture } = require("./data-grid-ui-fixture.cjs");

test("real search clear edits Apply draft and retains invalid correction", async () => {
  const f = await createFixture();
  try {
    const h = f.React.createElement;
    await f.mount({
      options: { filterMode: "apply" },
      children: (grid, { ui }) =>
        h(
          "form",
          { onSubmit: (event) => event.preventDefault() },
          h(ui.DataGridSearch, {
            grid,
            field: "search",
            clearable: true,
            "aria-label": "User search",
          }),
          h(ui.DataGridApplyFilters),
          h(ui.DataGridResetFilters),
          h(ui.DataGridTable, { grid, "aria-label": "Users" })
        ),
    });
    await f.React.act(async () =>
      f.grid.setFilter("search", "Ada", { debounce: 50 })
    );
    assert.equal(f.host.querySelector("input").value, "Ada");
    assert.equal(f.requests.length, 1);
    await f.click(f.button("Apply filters"));
    assert.equal(f.grid.request.filters.search, "Ada");
    await f.click(f.host.querySelector('[aria-label="Clear search"]'));
    assert.equal(f.grid.filterDraft.search, "");
    assert.equal(f.grid.request.filters.search, "Ada");
    await f.React.act(async () => f.grid.setFilter("active", "invalid"));
    await f.click(f.button("Apply filters"));
    assert.equal(f.requests.length, 2);
    assert.equal(typeof f.grid.filterErrors.active, "string");
    await f.click(f.button("Reset filters"));
    assert.deepEqual(f.grid.filterDraft, { search: "", active: true });
    assert.deepEqual(f.grid.filterErrors, {});
    assert.equal(f.button("Apply filters").getAttribute("type"), "button");
  } finally {
    await f.dispose();
  }
});

test("real page-size Select resets page atomically and search reset cancels pending debounce", async () => {
  const f = await createFixture();
  try {
    const h = f.React.createElement;
    await f.mount({
      children: (grid, { ui }) =>
        h(
          f.React.Fragment,
          null,
          h(ui.DataGridSearch, {
            grid,
            field: "search",
            clearable: true,
            "aria-label": "User search",
          }),
          h(ui.DataGridResetFilters),
          h(ui.DataGridTable, { grid, "aria-label": "Users" }),
          h(ui.DataGridPagination)
        ),
    });
    await f.click(f.button("Next page"));
    await f.click(f.host.querySelector('[role="combobox"]'));
    const fifty = [...document.querySelectorAll('[role="option"]')].find(
      (option) => option.textContent.trim() === "50"
    );
    await f.click(fifty);
    assert.deepEqual(f.grid.request.pagination, { pageIndex: 0, pageSize: 50 });
    await f.React.act(async () =>
      f.grid.setFilter("search", "pending", { debounce: 80 })
    );
    await f.click(f.button("Reset filters"));
    await f.React.act(
      async () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    assert.equal(f.grid.request.filters.search, "");
    assert.equal(
      f.host.querySelector('input[aria-label="User search"]').value,
      ""
    );
  } finally {
    await f.dispose();
  }
});

test("cursor controls never show totals or arbitrary first and last actions", async () => {
  const f = await createFixture();
  try {
    const contract = f.schemas.createDataGridContract({
      pagination: "cursor",
      row: f.z.object({ id: f.z.string(), name: f.z.string() }),
      filters: f.z.object({ search: f.z.string().default("") }),
      sortBy: f.z.literal("name"),
    });
    const column = f.columnApi.createDataGridColumnHelper(contract);
    const h = f.React.createElement;
    await f.mount({
      options: {
        contract,
        columns: [column.accessor("name", { header: "Name" })],
        selectionMode: "allMatching",
        queryOptions: (input) =>
          f.query.queryOptions({
            queryKey: ["cursor-ui", input],
            queryFn: async () => ({
              rows: [{ id: input.pagination.cursor ?? "a", name: "Ada" }],
              nextCursor: input.pagination.cursor === null ? "next" : null,
            }),
          }),
      },
      children: (grid, { ui }) =>
        h(
          f.React.Fragment,
          null,
          h(ui.DataGridSelectionBar),
          h(ui.DataGridTable, { grid, "aria-label": "Users" }),
          h(ui.DataGridPagination)
        ),
    });
    assert.ok(
      f.button("First page") === undefined,
      "No first-page jump on cursors"
    );
    assert.ok(
      f.button("Last page") === undefined,
      "No last-page jump on cursors"
    );
    await f.click(f.host.querySelector('[aria-label="Select this page"]'));
    assert.ok(Boolean(f.button("Select all matching results")));
    await f.click(f.button("Next page"));
    assert.equal(f.grid.request.pagination.cursor, "next");
    await f.click(f.button("Previous page"));
    assert.equal(f.grid.request.pagination.cursor, null);
    assert.equal(f.host.textContent.includes("of 60"), false);
  } finally {
    await f.dispose();
  }
});

test("real checkboxes expose mixed state and all-matching exclusions without off-page totals", async () => {
  const f = await createFixture();
  try {
    const h = f.React.createElement;
    await f.mount({
      options: { selectionMode: "allMatching" },
      children: (grid, { ui }) =>
        h(
          f.React.Fragment,
          null,
          h(ui.DataGridSelectionBar),
          h(ui.DataGridTable, { grid, "aria-label": "Users" })
        ),
    });
    await f.click(f.host.querySelector('[aria-label="Select row a"]'));
    assert.equal(
      f.host
        .querySelector('[aria-label="Select this page"]')
        .getAttribute("aria-checked"),
      "mixed"
    );
    await f.click(f.host.querySelector('[aria-label="Select this page"]'));
    assert.deepEqual(f.grid.selection.ids, ["a", "b"]);
    await f.click(f.button("Select all 60 matching results"));
    assert.equal(f.grid.selection.mode, "allMatching");
    await f.click(f.host.querySelector('[aria-label="Select row a"]'));
    assert.deepEqual(f.grid.selection.excludedIds, ["a"]);
    await f.click(f.button("Clear selection"));
    assert.deepEqual(f.grid.selection.ids, []);
  } finally {
    await f.dispose();
  }
});

test("native page controls and real visibility menu honor non-hideable columns", async () => {
  const f = await createFixture();
  try {
    const h = f.React.createElement;
    await f.mount({
      children: (grid, { ui }) =>
        h(
          f.React.Fragment,
          null,
          h(ui.DataGridColumnVisibility),
          h(ui.DataGridTable, { grid, "aria-label": "Users" }),
          h(ui.DataGridPagination)
        ),
    });
    assert.ok(f.host.textContent.includes("1–25 of 60 results"));
    await f.click(f.button("Next page"));
    assert.equal(f.grid.request.pagination.pageIndex, 1);
    await f.click(f.host.querySelector('[data-page="3"]'));
    assert.equal(f.grid.request.pagination.pageIndex, 2);
    assert.ok(f.host.textContent.includes("51–60 of 60 results"));
    await f.click(f.button("Columns"));
    const items = [...document.querySelectorAll('[role="menuitemcheckbox"]')];
    assert.deepEqual(
      items.map((item) => item.textContent.trim()),
      ["Name"]
    );
    await f.click(items[0]);
    assert.equal(f.grid.table.getVisibleLeafColumns().length, 1);
    assert.equal(f.grid.table.getVisibleLeafColumns()[0].id, "id");
  } finally {
    await f.dispose();
  }
});
