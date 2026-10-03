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
  const {
    buttonProps,
    getButtonDefaults,
    getButtonAccessibleLabel,
    getButtonCode,
    isIconSize,
  } = jiti("../lib/button-playground.ts");
  for (const variant of buttonProps.variant.control.options) {
    for (const size of buttonProps.size.control.options) {
      for (const children of ["Save", 'Save "draft" <now> {value}\nnext', ""]) {
        const values = {
          ...getButtonDefaults(),
          children,
          disabled: true,
          size,
          variant,
        };
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
  const { buttonPlaygroundDefinitions } = jiti("../lib/button-playground.ts");
  const defaults = getPlaygroundDefaults(buttonPlaygroundDefinitions);
  assert.deepEqual(defaults, {
    children: "Button",
    disabled: false,
    isLoading: false,
    size: "default",
    tapScale: 0.96,
    variant: "default",
    whileTap: true,
  });
  defaults.children = "Changed";
  assert.equal(
    getPlaygroundDefaults(buttonPlaygroundDefinitions).children,
    "Button"
  );
});

test("loading playground toggle generates the actual loading Button", () => {
  const { Button } = jiti("../registry/new-york/button.tsx");
  const { getButtonDefaults, getButtonCode, buttonProps } = jiti(
    "../lib/button-playground.ts"
  );
  assert.equal(buttonProps.isLoading.control.kind, "boolean");
  const defaults = getButtonDefaults();
  assert.equal(defaults.isLoading, false);
  assert.ok(!getButtonCode(defaults).includes("isLoading"));
  const code = getButtonCode({ ...defaults, isLoading: true });
  assert.ok(code.includes(" isLoading"));
  const compiled = ts.transpileModule(code, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
    },
  });
  const compiledModule = { exports: {} };
  runInNewContext(compiled.outputText, {
    exports: compiledModule.exports,
    module: compiledModule,
    require: (name) =>
      name === "@/components/ui/button" ? { Button } : requireDependency(name),
  });
  const html = renderToStaticMarkup(
    React.createElement(compiledModule.exports.ButtonDemo)
  );
  assert.ok(html.includes('data-slot="loading"'));
  assert.ok(html.includes('disabled=""'));
});

test("tap controls synchronize Motion targets and generated JSX", () => {
  const { getButtonDefaults, getButtonCode, getButtonWhileTap } = jiti(
    "../lib/button-playground.ts"
  );
  const defaults = getButtonDefaults();
  assert.deepEqual(getButtonWhileTap(defaults), { scale: 0.96 });
  assert.ok(!getButtonCode(defaults).includes("whileTap="));
  for (const tapScale of [0.8, 0.9, 0.96, 1]) {
    const values = { ...defaults, tapScale };
    assert.deepEqual(getButtonWhileTap(values), { scale: tapScale });
    if (tapScale !== 0.96) {
      assert.ok(
        getButtonCode(values).includes(`whileTap={{ scale: ${tapScale} }}`)
      );
    }
    const off = { ...values, whileTap: false };
    assert.equal(getButtonWhileTap(off), false);
    assert.ok(getButtonCode(off).includes("whileTap={false}"));
    assert.ok(!getButtonCode(off).includes("scale:"));
  }
  assert.equal(getButtonDefaults().tapScale, 0.96);
});

test("Button code omits default props and reflects customized controls", () => {
  const { getButtonCode, getButtonDefaults } = jiti(
    "../lib/button-playground.ts"
  );
  const code = getButtonCode({
    ...getButtonDefaults(),
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
    ...getButtonDefaults(),
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
  const { getButtonCode, getButtonDefaults } = jiti(
    "../lib/button-playground.ts"
  );
  for (const size of ["icon", "icon-xs", "icon-sm", "icon-lg"]) {
    const code = getButtonCode({
      ...getButtonDefaults(),
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
  const { getButtonCode, getButtonDefaults } = jiti(
    "../lib/button-playground.ts"
  );
  const label = 'Save "draft" <now> {value}\nnext';
  const code = getButtonCode({
    ...getButtonDefaults(),
    children: label,
    disabled: false,
    size: "default",
    variant: "default",
  });
  assert.ok(code.includes(`{${JSON.stringify(label)}}`));
  const empty = getButtonCode({
    ...getButtonDefaults(),
    children: "",
    disabled: false,
    size: "default",
    variant: "default",
  });
  assert.ok(empty.includes('aria-label="Button"'));
  const icon = getButtonCode({
    ...getButtonDefaults(),
    children: label,
    disabled: false,
    size: "icon",
    variant: "default",
  });
  assert.ok(icon.includes(`aria-label={${JSON.stringify(label)}}`));
});
