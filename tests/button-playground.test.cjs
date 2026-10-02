const assert = require("node:assert/strict");
const test = require("node:test");
const { createRequire } = require("node:module");
const { runInNewContext } = require("node:vm");
const { createJiti } = require("jiti");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");
const { PlusIcon } = require("lucide-react");

const requireDependency = createRequire(__filename);

const normalizeButtonMarkup = (markup) =>
  markup.replace(
    /<button ([^>]+)>/,
    (_, attributes) =>
      `<button ${attributes
        .match(/[\w-]+="[^"]*"/g)
        .toSorted()
        .join(" ")}>`
  );

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("generated JSX renders the same Button across all variants and sizes", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const { buttonProps, getButtonAccessibleLabel, getButtonCode, isIconSize } =
    jiti("../lib/button-playground.ts");
  for (const variant of buttonProps.variant.control.options) {
    for (const size of buttonProps.size.control.options) {
      for (const children of ["Save", 'Save "draft" <now> {value}\nnext', ""]) {
        const values = { children, disabled: true, size, variant };
        const compiled = ts.transpileModule(getButtonCode(values), {
          compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.CommonJS,
          },
          reportDiagnostics: true,
        });
        assert.equal(compiled.diagnostics.length, 0);
        const compiledModule = { exports: {} };
        const resolve = (name) =>
          name === "@/components/ui/button"
            ? { Button }
            : requireDependency(name);
        runInNewContext(compiled.outputText, {
          exports: compiledModule.exports,
          module: compiledModule,
          require: resolve,
        });
        const actual = renderToStaticMarkup(
          React.createElement(compiledModule.exports.ButtonDemo)
        );
        const expected = renderToStaticMarkup(
          React.createElement(
            Button,
            {
              "aria-label": getButtonAccessibleLabel(values),
              disabled: true,
              size,
              variant,
            },
            isIconSize(size) ? React.createElement(PlusIcon) : children
          )
        );
        assert.equal(
          normalizeButtonMarkup(actual),
          normalizeButtonMarkup(expected),
          `${variant}/${size}/${JSON.stringify(children)}`
        );
      }
    }
  }
});

test("Button controls derive a fresh default state from metadata", () => {
  const { getPlaygroundDefaults } = jiti("../lib/playground.ts");
  const { buttonProps } = jiti("../lib/button-playground.ts");
  const defaults = getPlaygroundDefaults(buttonProps);
  assert.deepEqual(defaults, {
    children: "Button",
    disabled: false,
    size: "default",
    variant: "default",
  });
  defaults.children = "Changed";
  assert.equal(getPlaygroundDefaults(buttonProps).children, "Button");
});

test("Button code omits default props and reflects customized controls", () => {
  const { getButtonCode } = jiti("../lib/button-playground.ts");
  const code = getButtonCode({
    children: "Save",
    disabled: true,
    size: "sm",
    variant: "outline",
  });
  assert.ok(code.includes('import { Button } from "@/components/ui/button";'));
  assert.ok(code.includes('variant="outline"'));
  assert.ok(code.includes('size="sm"'));
  assert.ok(code.includes(" disabled"));
  assert.ok(code.includes('{"Save"}'));
  const defaults = getButtonCode({
    children: "Button",
    disabled: false,
    size: "default",
    variant: "default",
  });
  assert.ok(!defaults.includes("variant="));
  assert.ok(!defaults.includes("size="));
  assert.ok(!defaults.includes("disabled"));
});

test("every icon size generates an icon import and accessible name", () => {
  const { getButtonCode } = jiti("../lib/button-playground.ts");
  for (const size of ["icon", "icon-xs", "icon-sm", "icon-lg"]) {
    const code = getButtonCode({
      children: "Add item",
      disabled: false,
      size,
      variant: "default",
    });
    assert.ok(code.includes('import { PlusIcon } from "lucide-react";'));
    assert.ok(code.includes('aria-label="Add item"'));
    assert.ok(code.includes("<PlusIcon />"));
    assert.ok(!code.includes('{"Add item"}'));
  }
});

test("labels are serialized safely as JSX and empty labels retain an accessible name", () => {
  const { getButtonCode } = jiti("../lib/button-playground.ts");
  const label = 'Save "draft" <now> {value}\nnext';
  const code = getButtonCode({
    children: label,
    disabled: false,
    size: "default",
    variant: "default",
  });
  assert.ok(code.includes(`{${JSON.stringify(label)}}`));
  const empty = getButtonCode({
    children: "",
    disabled: false,
    size: "default",
    variant: "default",
  });
  assert.ok(empty.includes('aria-label="Button"'));
  const icon = getButtonCode({
    children: label,
    disabled: false,
    size: "icon",
    variant: "default",
  });
  assert.ok(icon.includes(`aria-label={${JSON.stringify(label)}}`));
});
