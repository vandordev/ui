const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { readFileSync } = require("node:fs");
const registry = require("../registry.json");
const jiti = createJiti(__filename, { alias: { "@": process.cwd() }, fsCache: false, jsx: { runtime: "automatic" } });

test("Button installs only the licensed default spinner and keeps its loading API", () => {
  const item = registry.items.find(item => item.name === "button");
  assert.deepEqual(item.registryDependencies ?? [], []);
  assert.deepEqual(item.files.map(file => file.path), ["registry/new-york/button.tsx", "registry/new-york/loading-arc.tsx"]);
  const spinner = readFileSync("registry/new-york/loading-arc.tsx", "utf8");
  assert.ok(spinner.includes("Copyright (c) 2026 Bartosz Zagrodzki"));
  assert.ok(spinner.includes("useReducedMotion"));
  assert.equal(spinner.includes("@/"), false);
  const { Button } = jiti("../registry/new-york/button.tsx");
  const html = renderToStaticMarkup(React.createElement(Button, { isLoading: true }, "Save"));
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(html.includes('disabled=""'));
  assert.ok(html.includes('data-variant="arc"'));
  assert.ok(html.includes("--loading-size:16px"));
  assert.ok(html.includes("Save"));
});

test("public Loading default shares the same Arc primitive without losing variants", () => {
  const { Loading } = jiti("../registry/new-york/loading.tsx");
  const { LoadingArc } = jiti("../registry/new-york/loading-arc.tsx");
  const props = { size: 16, "aria-hidden": true };
  assert.equal(renderToStaticMarkup(React.createElement(Loading, props)), renderToStaticMarkup(React.createElement(LoadingArc, props)));
});
