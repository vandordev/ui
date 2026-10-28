/* eslint-disable global-require -- Generated snippets resolve real components in the scoped VM. */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");
const ts = require("typescript");
const { runInNewContext } = require("node:vm");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const normalize = (html) => html.replaceAll(/_R_[^" ]+_/g, "generated-id");

test("Select label controls and hostile text match actual generated JSX and fresh defaults", () => {
  const { Select } = jiti("../registry/new-york/select.tsx");
  const { getSelectCode, getSelectPreviewProps, getSelectDefaults } = jiti(
    "../lib/select-playground.ts"
  );
  for (const override of [
    {},
    { label: 'A "quoted" <label> {value}\nnext' },
    { labelStyle: "static" },
    { label: "" },
    { animated: false, disabled: true, labelStyle: "static", size: "sm" },
  ]) {
    const values = { ...getSelectDefaults(), ...override };
    const output = ts.transpileModule(getSelectCode(values), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    });
    assert.equal(output.diagnostics.length, 0);
    const exports = {};
    runInNewContext(output.outputText, {
      exports,
      require: (name) =>
        name === "@/components/ui/select" ? { Select } : require(name),
    });
    // React useId differs across independent server renders; normalize only IDs.
    const generated = normalize(
      renderToStaticMarkup(React.createElement(exports.SelectDemo))
    );
    const preview = normalize(
      renderToStaticMarkup(
        React.createElement(Select, {
          ...getSelectPreviewProps(values),
          className: "w-56",
        })
      )
    );
    assert.equal(generated, preview);
  }
  const changed = getSelectDefaults();
  changed.label = "Changed";
  assert.equal(getSelectDefaults().label, "Fruit");
});
