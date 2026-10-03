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

test("Loading registry installs every upstream variant as a source snapshot", () => {
  const item = registry.items.find(({ name }) => name === "loading");
  assert.ok(item, "Loading registry item is missing");
  const { loadingVariants } = jiti("../registry/new-york/loading.tsx");
  assert.equal(loadingVariants.length, 47);
  assert.deepEqual(
    item.files
      .filter(
        ({ path }) =>
          path.startsWith("components/loading-ui/") && path.endsWith(".tsx")
      )
      .map(({ path }) => path.split("/").at(-1).replace(".tsx", ""))
      .toSorted(),
    [...loadingVariants].toSorted()
  );
});

test("morphing infinity starts with a valid SVG path before the first animation frame", () => {
  const { Loading } = jiti("../registry/new-york/loading.tsx");
  const html = renderToStaticMarkup(
    React.createElement(Loading, { variant: "morphing-infinity" })
  );
  assert.match(html, /<path[^>]*d="M /);
});

test("Loading defaults to arc with one accessible status and forwards native attributes", () => {
  const { Loading } = jiti("../registry/new-york/loading.tsx");
  const html = renderToStaticMarkup(
    React.createElement(Loading, {
      "aria-label": "Saving",
      duration: 2,
      id: "progress",
      size: 40,
    })
  );
  assert.ok(html.includes('data-variant="arc"'));
  assert.ok(html.includes('id="progress"'));
  assert.ok(html.includes('aria-label="Saving"'));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes("--duration:2s"));
  assert.ok(html.includes("--loading-size:40px"));
  assert.ok(html.includes("border-t-current"));
});

test("every Loading variant renders without missing children or leaking variant props", () => {
  const { Loading, loadingVariants } = jiti("../registry/new-york/loading.tsx");
  for (const variant of loadingVariants) {
    const html = renderToStaticMarkup(
      React.createElement(Loading, { variant })
    );
    assert.ok(html.includes(`data-variant="${variant}"`), variant);
    assert.ok(!html.includes("variantProps="), variant);
    assert.ok(html.includes('aria-label="Loading"'), variant);
  }
});

test("Loading preserves text and variant-specific configuration", () => {
  const { Loading } = jiti("../registry/new-york/loading.tsx");
  const terminal = renderToStaticMarkup(
    React.createElement(Loading, {
      variant: "terminal",
      variantProps: { prompt: "$" },
    })
  );
  assert.ok(terminal.includes("$"));
  const dots = renderToStaticMarkup(
    React.createElement(Loading, {
      text: "Saving",
      variant: "text-dots",
      variantProps: { dots: 5 },
    })
  );
  assert.ok(dots.includes("Saving"));
  assert.equal(dots.match(/>\.<\/span>/g).length, 5);
  const skeleton = renderToStaticMarkup(
    React.createElement(Loading, {
      variant: "skeleton",
      variantProps: {
        className: "rounded-none",
        style: { height: 16, width: 120 },
      },
    })
  );
  assert.ok(skeleton.includes("rounded-none"));
  assert.ok(skeleton.includes("width:120px"));
});

test("Loading playground code safely serializes text", () => {
  const { getLoadingCode, getLoadingDefaults } = jiti(
    "../lib/loading-playground.ts"
  );
  const code = getLoadingCode({
    ...getLoadingDefaults(),
    text: 'Saving "draft"\nnow',
    variant: "text-dots",
  });
  assert.ok(code.includes('variant="text-dots"'));
  assert.ok(code.includes('text={"Saving \\"draft\\"\\nnow"}'));
});
