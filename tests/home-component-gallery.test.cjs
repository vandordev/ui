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

test("home gallery includes every UI registry item with its documentation link", () => {
  const { HomeComponentGallery } = jiti(
    "../components/home-component-gallery.tsx"
  );
  const html = renderToStaticMarkup(React.createElement(HomeComponentGallery));

  for (const item of registry.items.filter(
    ({ type }) => type === "registry:ui"
  )) {
    assert.ok(html.includes(`href="/docs/components/${item.name}"`), item.name);
    assert.ok(html.includes(item.title), item.name);
  }
});

test("home gallery displays the Button and default arc Loading previews", () => {
  const { HomeComponentGallery } = jiti(
    "../components/home-component-gallery.tsx"
  );
  const html = renderToStaticMarkup(React.createElement(HomeComponentGallery));

  assert.match(html, /<button/);
  assert.match(html, /data-variant="arc"/);
  assert.match(html, /role="status"/);
});

test("new registry components appear without a dedicated preview", () => {
  const loadedRegistry = jiti("../registry.json");
  const { HomeComponentGallery } = jiti(
    "../components/home-component-gallery.tsx"
  );
  loadedRegistry.items.push({
    name: "future-component",
    title: "Future Component",
    type: "registry:ui",
  });

  try {
    const html = renderToStaticMarkup(
      React.createElement(HomeComponentGallery)
    );
    assert.ok(html.includes('href="/docs/components/future-component"'));
    assert.ok(html.includes("Future Component"));
    assert.ok(html.includes("Explore examples in the documentation."));
  } finally {
    loadedRegistry.items.pop();
  }
});
