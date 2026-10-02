const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const registry = require("../registry.json");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("distributed Button declares the motion package", () => {
  const item = registry.items.find(({ name }) => name === "button");
  assert.ok(item.dependencies.includes("motion"));
});

test("animated Button preserves native disabled markup and filters motion props", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      {
        "aria-label": "Save",
        disabled: true,
        type: "button",
      },
      "Save"
    )
  );
  assert.ok(html.startsWith("<button "));
  assert.ok(html.includes('disabled=""'));
  assert.ok(html.includes('type="button"'));
  assert.ok(html.includes('aria-label="Save"'));
  assert.ok(!html.includes("whileTap"));
  assert.ok(!html.includes("transition="));
});

test("animated asChild preserves a single link and native attributes", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      {
        asChild: true,
        variant: "outline",
      },
      React.createElement("a", { href: "/docs/components" }, "Browse")
    )
  );
  assert.ok(html.startsWith("<a "));
  assert.ok(html.includes('href="/docs/components"'));
  assert.ok(html.includes('data-variant="outline"'));
  assert.ok(!html.includes("<button"));
  assert.ok(!html.includes("<div"));
  assert.ok(!html.includes("whileTap"));
});
