const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const ts = require("typescript");
const jsxRuntime = require("react/jsx-runtime");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

// Catches dropped controls, unsafe string interpolation and preview/code drift.
test("Frame controls generate runnable markup matching the typed preview", () => {
  const { FramePreview } = jiti("../components/frame-playground.tsx");
  const { getFrameDefaults, getFrameCode } = jiti("../lib/frame-playground.ts");
  const component = jiti("../registry/new-york/frame.tsx");
  for (const override of [
    {},
    { variant: "ghost" },
    ...["sm", "default", "lg"].map((spacing) => ({ spacing })),
    { stacked: true },
    { dense: true },
    { fit: true },
    { title: `A "title" <with> {}\nand \`ticks\` \${expressions}` },
    { description: "" },
    { dense: true, fit: true, spacing: "lg", stacked: true, variant: "ghost" },
  ]) {
    const values = { ...getFrameDefaults(), ...override };
    const compiled = ts.transpileModule(getFrameCode(values), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    });
    assert.equal(compiled.diagnostics.length, 0);
    const exports = {};
    vm.runInNewContext(compiled.outputText, {
      exports,
      require: (name) =>
        ({
          "@/components/ui/frame": component,
          "react/jsx-runtime": jsxRuntime,
        })[name],
    });
    const actual = renderToStaticMarkup(
      React.createElement(FramePreview, { values })
    );
    assert.equal(
      renderToStaticMarkup(React.createElement(exports.FrameDemo)),
      actual
    );
    assert.ok(
      actual.includes("Deployment"),
      "The preview must include panel content"
    );
    if (override.title) {
      assert.ok(actual.includes("&lt;with&gt;"));
    }
    for (const key of ["variant", "spacing", "stacked", "dense"]) {
      assert.ok(
        actual.includes(`data-${key}="${values[key]}"`),
        `${key} must reach Frame`
      );
    }
    assert.ok(
      actual.includes(`data-fit="${values.fit}"`),
      "fit must reach panels"
    );
  }
  const defaults = getFrameDefaults();
  defaults.title = "Changed";
  defaults.dense = true;
  assert.equal(getFrameDefaults().title, "Workspace");
  assert.equal(getFrameDefaults().dense, false);
});

test("Frame portable stories compose public controls and meaningful layouts", async () => {
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/frame.stories.tsx")
  );
  const markup = renderToStaticMarkup(
    stories.Playground({
      dense: true,
      spacing: "lg",
      stacked: true,
      variant: "ghost",
    })
  );
  for (const value of [
    'data-variant="ghost"',
    'data-spacing="lg"',
    'data-stacked="true"',
    'data-dense="true"',
  ]) {
    assert.ok(markup.includes(value), value);
  }
  for (const name of [
    "Separated",
    "Stacked",
    "Dense",
    "Ghost",
    "FitPanels",
    "LongContent",
  ]) {
    assert.match(
      renderToStaticMarkup(stories[name]()),
      /data-slot="frame-panel"/
    );
  }
});
