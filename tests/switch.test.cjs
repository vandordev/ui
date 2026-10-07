/* eslint-disable global-require, unicorn/consistent-function-scoping -- Generated code resolves real dependencies; normalization belongs to markup parity checks. */
const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const { readFileSync, existsSync } = require("node:fs");
const ts = require("typescript");
const { runInNewContext } = require("node:vm");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("Switch supplies checked semantics, sizes, and a native form input", () => {
  assert.ok(
    existsSync("registry/new-york/switch.tsx"),
    "Registry Switch must exist"
  );
  const { Switch } = jiti("../registry/new-york/switch.tsx");
  for (const size of ["default", "sm"]) {
    for (const checked of [false, true]) {
      const html = renderToStaticMarkup(
        React.createElement(Switch, {
          animated: false,
          "aria-label": "Updates",
          defaultChecked: checked,
          name: "updates",
          size,
          value: "weekly",
        })
      );
      assert.match(html, /role="switch"/);
      assert.match(html, new RegExp(`aria-checked="${checked}"`));
      assert.match(html, new RegExp(`data-size="${size}"`));
      assert.match(html, /type="checkbox"/);
      assert.match(html, /name="updates"/);
      assert.doesNotMatch(html, /animated=/);
    }
  }
});

test("Switch playground controls generate runnable code matching the preview adapter", () => {
  const { Switch } = jiti("../registry/new-york/switch.tsx");
  const { SwitchPreview } = jiti("../components/switch-playground.tsx");
  const { getSwitchCode, getSwitchDefaults } = jiti(
    "../lib/switch-playground.ts"
  );
  const changes = {
    animated: false,
    defaultChecked: true,
    disabled: true,
    invalid: true,
    label: 'Save "draft" <now> {value}\nnext',
    readOnly: true,
    size: "sm",
  };
  for (const [key, value] of Object.entries(changes)) {
    const values = { ...getSwitchDefaults(), [key]: value };
    const compiled = ts.transpileModule(getSwitchCode(values), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    });
    assert.equal(compiled.diagnostics.length, 0);
    const mod = { exports: {} };
    runInNewContext(compiled.outputText, {
      exports: mod.exports,
      module: mod,
      require: (name) =>
        name === "@/components/ui/switch" ? { Switch } : require(name),
    });
    const normalize = (html) =>
      html.replaceAll(/«[^»]+»/g, "ID").replaceAll(
        /<span ([^>]+)>/g,
        (_, attributes) =>
          `<span ${attributes
            .match(/[\w-]+="[^"]*"/g)
            ?.toSorted()
            .join(" ")}>`
      );
    assert.equal(
      normalize(
        renderToStaticMarkup(React.createElement(mod.exports.SwitchDemo))
      ),
      normalize(
        renderToStaticMarkup(React.createElement(SwitchPreview, { values }))
      ),
      key
    );
  }
  const defaults = getSwitchDefaults();
  defaults.label = "Changed";
  assert.equal(getSwitchDefaults().label, "Enable notifications");
});

test("Switch initializes thumb at the checked position in both directions without leaking custom props", () => {
  const { Switch } = jiti("../registry/new-york/switch.tsx");
  for (const dir of ["ltr", "rtl"]) {
    const html = renderToStaticMarkup(
      React.createElement(Switch, {
        animated: false,
        "aria-label": "Updates",
        className: (state) =>
          state.checked ? "consumer-checked" : "consumer-unchecked",
        defaultChecked: true,
        dir,
      })
    );
    assert.match(html, /consumer-checked/);
    assert.match(
      html,
      dir === "rtl"
        ? /translateX\(calc\(-100% \+ 2px\)\)/
        : /translateX\(calc\(100% - 2px\)\)/
    );
    assert.doesNotMatch(html, /animated=/);
  }
});

test("portable Switch stories compose states and wire args", async () => {
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/switch.stories.tsx")
  );
  for (const name of [
    "Playground",
    "Checked",
    "Small",
    "Disabled",
    "ReadOnly",
    "Invalid",
    "WithoutMotion",
    "Controlled",
  ]) {
    assert.match(renderToStaticMarkup(stories[name]()), /data-slot="switch"/);
  }
  const html = renderToStaticMarkup(
    stories.Playground({
      "aria-label": "Custom",
      defaultChecked: true,
      size: "sm",
    })
  );
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /data-size="sm"/);
  assert.match(html, /Custom/);
});

test("Switch and stories artifacts preserve source, dependencies and portable targets", () => {
  const registry = require("../registry.json");
  for (const name of ["switch", "switch-stories"]) {
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
    if (name === "switch") {
      assert.match(content, /^"use client";/);
      assert.match(content, /Copyright \(c\) 2023 shadcn/);
    } else {
      assert.deepEqual(artifact.dependencies ?? [], []);
      assert.match(content, /from "\.\/switch"/);
    }
  }
});
