/* eslint-disable global-require -- Generated demo imports resolve in an isolated VM using real dependencies. */
const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const ts = require("typescript");
const { runInNewContext } = require("node:vm");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("Checkbox exposes checked and mixed semantics with a native form input", () => {
  const { Checkbox } = jiti("../registry/new-york/checkbox.tsx");
  for (const [props, state] of [
    [{}, "false"],
    [{ defaultChecked: true }, "true"],
    [{ indeterminate: true }, "mixed"],
  ]) {
    const html = renderToStaticMarkup(
      React.createElement(Checkbox, {
        ...props,
        "aria-label": "Updates",
        name: "updates",
        value: "weekly",
      })
    );
    assert.match(html, new RegExp(`aria-checked="${state}"`));
    assert.match(html, /type="checkbox"/);
    assert.match(html, /name="updates"/);
    assert.match(html, /value="weekly"/);
    assert.doesNotMatch(html, /animated=/);
  }
});

test("each Checkbox playground control is reflected by runnable generated code and preview props", () => {
  const { Checkbox } = jiti("../registry/new-york/checkbox.tsx");
  const { getCheckboxCode, getCheckboxDefaults, getCheckboxPreviewProps } =
    jiti("../lib/checkbox-playground.ts");
  const defaults = getCheckboxDefaults();
  const changes = {
    animated: false,
    defaultChecked: true,
    disabled: true,
    indeterminate: true,
    invalid: true,
    label: 'Save "draft" <now> {value}\nnext',
    readOnly: true,
  };
  for (const [key, value] of Object.entries(changes)) {
    const values = { ...defaults, [key]: value };
    const compiled = ts.transpileModule(getCheckboxCode(values), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    });
    assert.equal(compiled.diagnostics.length, 0);
    const compiledModule = { exports: {} };
    runInNewContext(compiled.outputText, {
      exports: compiledModule.exports,
      module: compiledModule,
      require: (name) =>
        name === "@/components/ui/checkbox" ? { Checkbox } : require(name),
    });
    const actual = renderToStaticMarkup(
      React.createElement(compiledModule.exports.CheckboxDemo)
    );
    const expected = renderToStaticMarkup(
      React.createElement(
        "label",
        { className: "flex items-center gap-3 text-sm" },
        React.createElement(Checkbox, getCheckboxPreviewProps(values)),
        React.createElement("span", null, values.label)
      )
    );
    // eslint-disable-next-line unicorn/consistent-function-scoping -- Local to markup parity assertions.
    const normalize = (html) =>
      html.replaceAll(/«[^»]+»/g, "ID").replaceAll(
        /<span ([^>]+)>/g,
        (_, attributes) =>
          `<span ${attributes
            .match(/[\w-]+="[^"]*"/g)
            ?.toSorted()
            .join(" ")}>`
      );
    assert.equal(normalize(actual), normalize(expected), key);
  }
  defaults.label = "Changed";
  assert.equal(getCheckboxDefaults().label, "Enable notifications");
});

test("portable Checkbox stories compose states and wire args", async () => {
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/checkbox.stories.tsx")
  );
  for (const name of [
    "Playground",
    "Checked",
    "Indeterminate",
    "Disabled",
    "ReadOnly",
    "Invalid",
    "WithoutMotion",
    "Controlled",
  ]) {
    assert.match(renderToStaticMarkup(stories[name]()), /data-slot="checkbox"/);
  }
  assert.match(
    renderToStaticMarkup(stories.Indeterminate()),
    /aria-checked="mixed"/
  );
  assert.match(
    renderToStaticMarkup(
      stories.Playground({ "aria-label": "Custom", defaultChecked: true })
    ),
    /aria-checked="true"/
  );
});

test("Checkbox and optional stories artifacts match their source without website dependencies", () => {
  const { readFileSync } = require("node:fs");
  const registry = require("../registry.json");
  for (const name of ["checkbox", "checkbox-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(artifact.type, item.type);
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.equal(artifact.files.length, 1);
    const [{ content, ...metadata }] = artifact.files;
    assert.deepEqual(metadata, item.files[0]);
    assert.equal(content, readFileSync(metadata.path, "utf-8"));
    assert.equal(metadata.target, undefined);
    assert.doesNotMatch(content, /from "@\//);
    if (name === "checkbox") {
      assert.match(content, /^"use client";/);
      assert.match(content, /Copyright \(c\) 2023 shadcn/);
    } else {
      assert.deepEqual(artifact.dependencies ?? [], []);
      assert.match(content, /from "\.\/checkbox"/);
    }
  }
});
