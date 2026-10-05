const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const { createJiti } = require("jiti");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");
const registry = require("../registry.json");
const vm = require("node:vm");
const jsxRuntime = require("react/jsx-runtime");
const icons = require("lucide-react");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("each Empty control keeps generated JSX and the typed preview in sync", async () => {
  const { Window } = await import("happy-dom");
  const dom = new Window();
  const { EmptyPreview } = jiti("../components/empty-playground.tsx");
  const { getEmptyDefaults, getEmptyCode } = jiti("../lib/empty-playground.ts");
  const component = jiti("../registry/new-york/empty.tsx");
  for (const override of [
    {},
    { title: 'A "quoted" <title>\nwith braces {}' },
    { description: `A description with \`ticks\` and \${expressions}` },
    { variant: "default" },
    { outline: true },
    { showMedia: false },
    { showAction: false },
    {
      description: "",
      outline: true,
      showAction: false,
      showMedia: false,
      title: "",
    },
  ]) {
    const values = { ...getEmptyDefaults(), ...override };
    const compiled = ts.transpileModule(getEmptyCode(values), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    });
    assert.deepEqual(compiled.diagnostics, []);
    const exports = {};
    vm.runInNewContext(compiled.outputText, {
      exports,
      require: (name) =>
        ({
          "@/components/ui/empty": component,
          "lucide-react": icons,
          "react/jsx-runtime": jsxRuntime,
        })[name],
    });
    const generated = dom.document.createElement("div");
    const preview = dom.document.createElement("div");
    generated.innerHTML = renderToStaticMarkup(
      React.createElement(exports.EmptyDemo)
    );
    preview.innerHTML = renderToStaticMarkup(
      React.createElement(EmptyPreview, { values })
    );
    assert.ok(generated.isEqualNode(preview), JSON.stringify(override));
  }
  await dom.happyDOM.abort();
});

test("Empty playground controls change the rendered preview and safely generated demo", () => {
  const { EmptyPreview } = jiti("../components/empty-playground.tsx");
  const { getEmptyDefaults, getEmptyCode } = jiti("../lib/empty-playground.ts");
  const defaults = getEmptyDefaults();
  const values = {
    ...defaults,
    description: "Try a different folder.\nNothing here.",
    outline: true,
    showAction: false,
    showMedia: false,
    title: 'No "files" <yet>',
    variant: "default",
  };
  const html = renderToStaticMarkup(
    React.createElement(EmptyPreview, { values })
  );
  assert.match(html, /No &quot;files&quot; &lt;yet&gt;/);
  assert.match(html, /Try a different folder/);
  assert.match(html, /class="[^"]*\bborder\b/);
  assert.doesNotMatch(html, /data-slot="empty-icon"|data-slot="empty-content"/);
  const code = getEmptyCode(values);
  assert.ok(code.includes(JSON.stringify(values.title)));
  assert.ok(code.includes(JSON.stringify(values.description)));
  assert.ok(!code.includes("<EmptyMedia"));
  assert.ok(!code.includes("<EmptyContent"));
  const result = ts.transpileModule(code, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  const withMedia = { ...values, showAction: true, showMedia: true };
  const visible = renderToStaticMarkup(
    React.createElement(EmptyPreview, { values: withMedia })
  );
  assert.match(visible, /data-variant="default"/);
  assert.match(visible, /href="\/docs\/components"/);
  assert.match(getEmptyCode(withMedia), /variant="default"/);
  assert.match(getEmptyCode(withMedia), /href="\/docs\/components"/);
  const reset = renderToStaticMarkup(
    React.createElement(EmptyPreview, { values: getEmptyDefaults() })
  );
  assert.match(reset, /data-variant="icon"/);
  assert.match(reset, /No projects yet/);
  assert.deepEqual(getEmptyDefaults(), defaults);
  defaults.title = "Changed";
  assert.equal(getEmptyDefaults().title, "No projects yet");
});

test("Empty stories compose controls and generated registry files remain portable", async () => {
  for (const name of ["empty", "empty-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    assert.ok(item);
    assert.equal(item.files.length, 1);
    assert.equal(item.files[0].target, undefined);
    assert.deepEqual(item.registryDependencies ?? [], []);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(
      artifact.files[0].content,
      readFileSync(item.files[0].path, "utf-8")
    );
    assert.ok(
      !(artifact.dependencies ?? []).some((dep) => dep.includes("storybook"))
    );
  }
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/empty.stories.tsx")
  );
  for (const name of [
    "Playground",
    "Outline",
    "WithoutMedia",
    "CustomMedia",
    "LongContent",
  ]) {
    assert.match(renderToStaticMarkup(stories[name]()), /data-slot="empty"/);
  }
  const html = renderToStaticMarkup(
    stories.Playground({
      showAction: false,
      title: "No matches",
      variant: "default",
    })
  );
  assert.match(html, /No matches/);
  assert.match(html, /data-variant="default"/);
  assert.doesNotMatch(html, /data-slot="empty-content"/);
});
