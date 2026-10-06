const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const { createFixture } = require("./data-grid-ui-fixture.cjs");

test("portable composed stories wire controls and real Query feedback", async () => {
  const f = await createFixture();
  try {
    const jiti = createJiti(__filename, {
      alias: { "@": process.cwd() },
      fsCache: false,
      jsx: { runtime: "automatic" },
    });
    const { composeStories } = await import("@storybook/react");
    const module = jiti("../registry/new-york/data-grid.stories.tsx");
    const stories = composeStories(module);
    for (const name of [
      "Playground",
      "CompactStriped",
      "ApplyFilters",
      "AllMatching",
      "Error",
      "Inactive",
      "Empty",
      "Cursor",
      "Controlled",
    ]) {
      await f.mount({ children: () => f.React.createElement(stories[name]) });
      await f.React.act(
        async () => new Promise((resolve) => setTimeout(resolve, 120))
      );
      await f.settle();
      const roots = f.host.querySelectorAll('[data-slot="data-grid"]');
      const root = roots[roots.length - 1];
      if (name === "CompactStriped") {
        assert.equal(root.getAttribute("data-variant"), "striped");
        assert.equal(root.getAttribute("data-density"), "compact");
      } else if (name === "ApplyFilters")
        assert.ok(Boolean(f.button("Apply filters")));
      else if (name === "AllMatching")
        assert.ok(
          Boolean(f.host.querySelector('[aria-label="Select this page"]'))
        );
      else if (name === "Error")
        assert.ok(f.host.textContent.includes("Could not load results"));
      else if (name === "Inactive")
        assert.ok(f.host.textContent.includes("Results are not active"));
      else if (name === "Empty")
        assert.ok(f.host.textContent.includes("No data yet"));
      else assert.ok(f.host.textContent.includes("Example user 1"));
      if (name === "Cursor") {
        assert.ok(
          f.button("Last page") === undefined,
          "Cursor story has no last jump"
        );
        await f.click(f.button("Next page"));
        assert.ok(f.host.textContent.includes("Example user 26"));
      }
      if (name === "Controlled") {
        await f.click(f.button("Next page"));
        await f.React.act(
          async () => new Promise((resolve) => setTimeout(resolve, 120))
        );
        await f.settle();
        assert.ok(f.host.textContent.includes("Example user 26"));
      }
    }
  } finally {
    await f.dispose();
  }
});
