const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const { runInNewContext } = require("node:vm");
const { createJiti } = require("jiti");
const React = require("react");
const jsxRuntime = require("react/jsx-runtime");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");
const registry = require("../registry.json");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("PageHeader renders its heading and slots without nesting breadcrumb navigation", () => {
  const { PageHeader } = jiti("../registry/new-york/page-header.tsx");
  const html = renderToStaticMarkup(
    React.createElement(PageHeader, {
      actions: React.createElement("button", { type: "button" }, "Export"),
      breadcrumb: React.createElement(
        "nav",
        { "aria-label": "Breadcrumb" },
        "Workspace / Payments"
      ),
      description: React.createElement("p", null, "Review payments."),
      id: "page-heading",
      status: React.createElement("span", null, "Test"),
      title: "Payments",
    })
  );
  assert.match(html, /^<header[^>]*id="page-heading"/);
  assert.match(html, /<h1[^>]*>Payments<\/h1>/);
  assert.equal([...html.matchAll(/<nav\b/g)].length, 1);
  assert.doesNotMatch(html, /<p[^>]*>\s*<p/);
  assert.ok(
    html.indexOf("Workspace / Payments") < html.indexOf("Payments</h1>")
  );
  assert.ok(html.indexOf("Payments</h1>") < html.indexOf("Test"));
  assert.ok(html.indexOf("Review payments.") < html.indexOf("Export"));
  for (const empty of [undefined, null, false, ""]) {
    const minimal = renderToStaticMarkup(
      React.createElement(PageHeader, {
        actions: empty,
        breadcrumb: empty,
        description: empty,
        status: empty,
        title: "Settings",
      })
    );
    assert.doesNotMatch(
      minimal,
      /data-slot="page-header-(breadcrumb|description|status|actions)"/
    );
  }
  const zero = renderToStaticMarkup(
    React.createElement(PageHeader, {
      description: 0,
      status: 0,
      title: "Results",
    })
  );
  assert.match(zero, /data-slot="page-header-description"[^>]*>0<\/div>/);
  assert.match(zero, /data-slot="page-header-status"[^>]*>0<\/div>/);
});

test("PageHeader controls keep safely generated JSX and the typed preview in sync", () => {
  const { PageHeaderPreview } = jiti(
    "../components/page-header-playground.tsx"
  );
  const { getPageHeaderDefaults, getPageHeaderCode } = jiti(
    "../lib/page-header-playground.ts"
  );
  const component = jiti("../registry/new-york/page-header.tsx");
  for (const override of [
    {},
    { title: `A "title" <with> braces {}\nand \`ticks\` \${expressions}` },
    { description: 'A "description" <with> braces {}' },
    { breadcrumb: "Workspace / Settings" },
    { status: "Live" },
    { showActions: false },
    { breadcrumb: "", description: "", showActions: false, status: "" },
  ]) {
    const values = { ...getPageHeaderDefaults(), ...override };
    const compiled = ts.transpileModule(getPageHeaderCode(values), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    });
    assert.deepEqual(compiled.diagnostics, []);
    const exports = {};
    runInNewContext(compiled.outputText, {
      exports,
      require: (name) =>
        ({
          "@/components/ui/page-header": component,
          "react/jsx-runtime": jsxRuntime,
        })[name],
    });
    assert.equal(
      renderToStaticMarkup(React.createElement(exports.PageHeaderDemo)),
      renderToStaticMarkup(React.createElement(PageHeaderPreview, { values }))
    );
  }
  const defaults = getPageHeaderDefaults();
  defaults.title = "Changed";
  defaults.showActions = false;
  assert.equal(getPageHeaderDefaults().title, "Projects");
  assert.equal(getPageHeaderDefaults().showActions, true);
});

test("PageHeader artifacts isolate optional stories and composed controls change rendered slots", async () => {
  for (const name of ["page-header", "page-header-stories"]) {
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
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
  }
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/page-header.stories.tsx")
  );
  const html = renderToStaticMarkup(
    stories.Playground({
      breadcrumb: "Workspace",
      showActions: false,
      status: "Live",
      title: "Settings",
    })
  );
  assert.match(html, />Settings<\/h1>/);
  assert.match(html, /Workspace/);
  assert.match(html, /Live/);
  assert.doesNotMatch(html, /data-slot="page-header-actions"/);
  for (const name of [
    "Minimal",
    "WithBreadcrumb",
    "WithStatus",
    "MultipleActions",
    "LongContent",
  ]) {
    assert.match(
      renderToStaticMarkup(stories[name]()),
      /data-slot="page-header"/
    );
  }
});
