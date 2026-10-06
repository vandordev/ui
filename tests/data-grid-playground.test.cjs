const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const { createFixture } = require("./data-grid-ui-fixture.cjs");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("every playground config changes the actual adapter and runnable generated syntax", async () => {
  const f = await createFixture();
  try {
    const metadata = jiti("../lib/data-grid-playground.ts");
    const { DataGridPlaygroundPreview } = jiti(
      "../components/data-grid-playground.tsx"
    );
    const ts = require("typescript");
    const cases = [
      [
        "showPageNumbers",
        false,
        () =>
          assert.ok(
            Boolean(f.button("Last page")),
            "Unnumbered preview shows last icon"
          ),
      ],
      [
        "variant",
        "bordered",
        () =>
          assert.equal(
            f.host
              .querySelectorAll('[data-slot="data-grid"]')[1]
              .getAttribute("data-variant"),
            "bordered"
          ),
      ],
      [
        "density",
        "compact",
        () =>
          assert.equal(
            f.host
              .querySelectorAll('[data-slot="data-grid"]')[1]
              .getAttribute("data-density"),
            "compact"
          ),
      ],
      [
        "pagination",
        "cursor",
        () =>
          assert.ok(
            f.button("Last page") === undefined,
            "Cursor preview has no last action"
          ),
      ],
      [
        "filterMode",
        "apply",
        () => assert.ok(Boolean(f.button("Apply filters"))),
      ],
      [
        "selectionMode",
        "allMatching",
        () =>
          assert.ok(
            Boolean(f.host.querySelector('[aria-label="Select this page"]'))
          ),
      ],
      [
        "stickyHeader",
        true,
        () =>
          assert.ok(f.host.querySelector("thead").className.includes("sticky")),
      ],
      [
        "scenario",
        "inactive",
        () => assert.ok(f.host.textContent.includes("Results are not active")),
      ],
    ];
    for (const [field, value, verify] of cases) {
      const config = { ...metadata.getDataGridDefaults(), [field]: value };
      await f.mount({
        children: () =>
          f.React.createElement(DataGridPlaygroundPreview, { config }),
      });
      await f.React.act(
        async () => new Promise((resolve) => setTimeout(resolve, 160))
      );
      await f.settle();
      verify();
      const source = metadata.getDataGridCode(config);
      assert.ok(
        source.includes(
          field === "pagination"
            ? `pagination: ${JSON.stringify(value)}`
            : field === "scenario"
              ? "enabled: false"
              : field === "showPageNumbers"
                ? "showPageNumbers={false}"
                : field === "stickyHeader"
                  ? "stickyHeader={true}"
                  : `${field}${field === "variant" || field === "density" ? "=" : ": "}${JSON.stringify(value)}`
        )
      );
      const result = ts.transpileModule(source, {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2022,
        },
        reportDiagnostics: true,
      });
      assert.deepEqual(
        (result.diagnostics ?? []).map((diagnostic) => diagnostic.code),
        []
      );
      assert.ok(source.includes("QueryClientProvider"));
    }
  } finally {
    await f.dispose();
  }
});

test("actual playground Reset clears configuration and search draft", async () => {
  const f = await createFixture();
  try {
    const { DataGridPlayground } = jiti(
      "../components/data-grid-playground.tsx"
    );
    await f.mount({
      children: () => f.React.createElement(DataGridPlayground),
    });
    const sticky = f.host.querySelector(
      '[role="switch"][aria-label="Sticky header"]'
    );
    await f.click(sticky);
    assert.equal(sticky.getAttribute("aria-checked"), "true");
    assert.ok(
      f.host
        .querySelector('pre[aria-label="Generated component code"]')
        .textContent.includes("stickyHeader={true}")
    );
    // React's value tracker requires the native prototype setter in DOM fixtures.
    const input = f.host.querySelector('input[aria-label="Search users"]');
    await f.React.act(async () => {
      Object.getOwnPropertyDescriptor(
        f.dom.HTMLInputElement.prototype,
        "value"
      ).set.call(input, "Ada");
      input.dispatchEvent(new f.dom.Event("input", { bubbles: true }));
    });
    await f.click(f.button("Reset"));
    assert.equal(
      f.host.querySelector('input[aria-label="Search users"]').value,
      ""
    );
    assert.equal(
      f.host
        .querySelector('[role="switch"][aria-label="Sticky header"]')
        .getAttribute("aria-checked"),
      "false"
    );
    assert.ok(
      f.host
        .querySelector('pre[aria-label="Generated component code"]')
        .textContent.includes("stickyHeader={false}")
    );
  } finally {
    await f.dispose();
  }
});

test("actual playground Reset remounts selection, preferences and cursor history", async () => {
  const f = await createFixture();
  try {
    const { DataGridPlayground } = jiti(
      "../components/data-grid-playground.tsx"
    );
    await f.mount({
      children: () => f.React.createElement(DataGridPlayground),
    });
    const choose = async (label, value) => {
      const element = [...f.host.querySelectorAll("label")].find(
        (element) => element.textContent === label
      );
      await f.click(document.getElementById(element.htmlFor));
      await f.click(
        [...document.querySelectorAll('[role="option"]')].find(
          (option) => option.textContent === value
        )
      );
    };
    await choose("Pagination mode", "cursor");
    await choose("Selection mode", "allMatching");
    await f.React.act(
      async () => new Promise((resolve) => setTimeout(resolve, 160))
    );
    await f.settle();
    await f.click(f.host.querySelector('[aria-label="Select this page"]'));
    assert.ok(f.host.textContent.includes("rows selected"));
    await f.click(f.button("Next page"));
    await f.React.act(
      async () => new Promise((resolve) => setTimeout(resolve, 160))
    );
    await f.settle();
    assert.ok(f.host.textContent.includes("Page 2"));
    await f.click(f.button("Columns"));
    await f.click(document.querySelector('[role="menuitemcheckbox"]'));
    assert.equal(
      f.host.querySelectorAll("table th").length,
      1,
      "Only the selection column remains"
    );
    await f.click(f.button("Reset"));
    await f.React.act(
      async () => new Promise((resolve) => setTimeout(resolve, 160))
    );
    await f.settle();
    assert.ok(
      Boolean(f.host.querySelector('[data-page="4"]')),
      "Default numbered page contract restored"
    );
    assert.equal(
      f.host.querySelectorAll('input[aria-label="Select this page"]').length,
      0
    );
    assert.equal(
      f.host.querySelector('[aria-current="page"]').textContent,
      "1"
    );
    assert.equal(
      f.host.querySelectorAll('th button[aria-label="Sort Name ascending"]')
        .length,
      1
    );
    assert.equal(f.host.textContent.includes("rows selected"), false);
  } finally {
    await f.dispose();
  }
});
