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

test("registry Button declares cn directly without a utils registry dependency", () => {
  const item = registry.items.find(({ name }) => name === "button");
  assert.deepEqual(item.dependencies.toSorted(), [
    "@base-ui/react",
    "class-variance-authority",
    "cn",
    "motion",
  ]);
  assert.deepEqual(item.registryDependencies ?? [], []);
  assert.ok(item.files.some((file) => file.path.endsWith("/loading-arc.tsx")));
});

test("loading Button renders arc before its label and cannot be enabled by disabled=false", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      { "aria-busy": false, disabled: false, isLoading: true },
      "Save"
    )
  );
  assert.ok(html.includes('disabled=""'));
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(html.includes('data-variant="arc"'));
  assert.ok(html.indexOf('data-slot="loading"') < html.indexOf("Save"));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(!html.includes("isLoading="));
});

test("icon-only loading Buttons replace their icon and retain their accessible name", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  for (const size of ["icon", "icon-sm", "icon-lg", "icon-xs"]) {
    const html = renderToStaticMarkup(
      React.createElement(
        Button,
        { "aria-label": "Save", isLoading: true, size },
        React.createElement("svg", { "data-original-icon": true })
      )
    );
    assert.ok(html.includes('aria-label="Save"'));
    assert.ok(html.includes('data-slot="loading"'));
    assert.ok(!html.includes("data-original-icon"));
  }
});

test("loading asChild preserves the child element and its content", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      { asChild: true, isLoading: true },
      React.createElement("a", { href: "/docs" }, "Browse")
    )
  );
  assert.ok(html.startsWith("<a "));
  assert.ok(html.includes('aria-disabled="true"'));
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(html.includes('data-slot="loading"'));
  assert.ok(html.includes("Browse"));
  assert.ok(!html.includes("<button"));
});

test("non-loading Button has no spinner or loading busy state", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(
    React.createElement(Button, { isLoading: false }, "Save")
  );
  assert.ok(!html.includes('data-slot="loading"'));
  assert.ok(!html.includes('aria-busy="true"'));
  assert.ok(!html.includes('disabled=""'));
});

test("Button className overrides conflicting Tailwind classes", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      {
        className: "px-8 rounded-full bg-background bg-none border-0",
      },
      "Save"
    )
  );
  const classes = html.match(/class="([^"]+)"/)[1].split(" ");
  assert.ok(classes.includes("px-8"));
  assert.ok(classes.includes("rounded-full"));
  assert.ok(classes.includes("bg-background"));
  assert.ok(!classes.includes("px-4"));
  assert.ok(!classes.includes("rounded-md"));
  assert.ok(!classes.includes("bg-primary"));
  assert.ok(!classes.includes("bg-linear-to-b"));
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

test("Button supports Base UI render composition and defaults to a non-submit button", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      {
        render: React.createElement("button", { "data-custom": "save" }),
      },
      "Save"
    )
  );
  assert.ok(html.includes('data-custom="save"'));
  assert.ok(html.includes('type="button"'));
  assert.equal((html.match(/<button /g) ?? []).length, 1);
});

test("Base UI render can target a navigation link without nesting a button", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      {
        nativeButton: false,
        render: React.createElement("a", { href: "/docs" }),
        variant: "outline",
      },
      "Browse"
    )
  );
  assert.ok(html.startsWith("<a "));
  assert.ok(html.includes('href="/docs"'));
  assert.ok(html.includes(">Browse</a>"));
  assert.ok(!html.includes("<button"));
});
