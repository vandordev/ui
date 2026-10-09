/* eslint-disable global-require -- Jiti resolves real distributable TSX modules. */
const assert = require("node:assert/strict");
const test = require("node:test");
const { existsSync, readFileSync } = require("node:fs");
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
const loadTabs = () => {
  assert.ok(
    existsSync("registry/new-york/tabs.tsx"),
    "Public item-based Tabs must exist"
  );
  return jiti("../registry/new-york/tabs.tsx").Tabs;
};
const normalize = (html) =>
  html.replaceAll(/«[^»]+»|_R_[\w-]+_|_r_[\w-]+_/g, "ID");

test("Tabs selects the first enabled panel on the server and connects accessible labels", () => {
  const Tabs = loadTabs();
  const html = renderToStaticMarkup(
    React.createElement(Tabs, {
      "aria-label": "Project sections",
      items: [
        {
          content: "Unavailable",
          disabled: true,
          label: "Locked",
          value: "locked",
        },
        { content: "Project overview", label: "Overview", value: "overview" },
        { content: "Recent activity", label: "Activity", value: "activity" },
      ],
    })
  );
  assert.match(html, /role="tablist"[^>]*aria-label="Project sections"/);
  assert.match(html, /aria-selected="true"[^>]*>[\s\S]*?Overview/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /Project overview/);
  assert.doesNotMatch(html, /Recent activity/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.match(html, /aria-labelledby="[^"]+"/);
});

test("Tabs link items retain native link semantics and never invent panels", () => {
  const Tabs = loadTabs();
  for (const variant of ["underline", "pill", "segmented"]) {
    const html = renderToStaticMarkup(
      React.createElement(Tabs, {
        "aria-label": "Settings navigation",
        items: [
          {
            link: React.createElement(
              "a",
              { href: "/profile", rel: "noreferrer", target: "_blank" },
              "Profile"
            ),
          },
          {
            active: true,
            link: React.createElement(
              "a",
              { className: "consumer-link", href: "/settings" },
              "Settings"
            ),
          },
        ],
        variant,
      })
    );
    assert.match(html, /<nav/);
    assert.match(html, /href="\/profile"/);
    assert.match(html, /target="_blank"/);
    assert.match(html, /consumer-link/);
    assert.match(html, /aria-current="page"/);
    assert.match(html, new RegExp(`data-variant="${variant}"`));
    assert.doesNotMatch(html, /role="tab|aria-controls=|<button/);
  }
});

test("Tabs empty and explicitly unselected panel collections are safe", () => {
  const Tabs = loadTabs();
  for (const props of [
    { items: [] },
    {
      items: [{ content: "Panel content", label: "One", value: "one" }],
      value: null,
    },
    {
      items: [
        {
          content: "Panel content",
          disabled: true,
          label: "One",
          value: "one",
        },
      ],
    },
  ]) {
    const html = renderToStaticMarkup(
      React.createElement(Tabs, { "aria-label": "Sections", ...props })
    );
    assert.doesNotMatch(html, /aria-selected="true"/);
    assert.doesNotMatch(html, /Panel content/);
    if (props.items.length === 0) {
      assert.equal(
        html,
        "",
        "An empty collection must not invent a panel or navigation mode"
      );
    }
  }
});

test("Tabs playground controls generate executable code matching the actual preview", () => {
  const Tabs = loadTabs();
  const { TabsPreview } = jiti("../components/tabs-playground.tsx");
  const { getTabsDefaults, getTabsCode } = jiti("../lib/tabs-playground.ts");
  const cases = [
    {},
    { variant: "pill" },
    { variant: "segmented" },
    { orientation: "vertical" },
    { disabled: true },
    { animated: false },
    { keepMounted: true },
    { activationMode: "automatic" },
    { mode: "links" },
    { label: 'Project "draft" <now> {value}\nnext' },
    {
      animated: false,
      mode: "links",
      orientation: "vertical",
      variant: "segmented",
    },
  ];
  for (const changes of cases) {
    const values = { ...getTabsDefaults(), ...changes };
    const compiled = ts.transpileModule(getTabsCode(values), {
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
        name === "@/components/ui/tabs" ? { Tabs } : require(name),
    });
    assert.equal(
      normalize(
        renderToStaticMarkup(React.createElement(mod.exports.TabsDemo))
      ),
      normalize(
        renderToStaticMarkup(React.createElement(TabsPreview, { values }))
      ),
      JSON.stringify(changes)
    );
  }
  const changed = getTabsDefaults();
  changed.variant = "pill";
  assert.equal(getTabsDefaults().variant, "underline");
});

test("portable Tabs stories render variants, navigation and controlled examples with working args", async () => {
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(jiti("../registry/new-york/tabs.stories.tsx"));
  for (const name of [
    "Playground",
    "Pill",
    "Segmented",
    "Vertical",
    "Disabled",
    "Links",
    "Controlled",
    "KeepMounted",
    "WithoutMotion",
    "RTL",
  ]) {
    assert.match(renderToStaticMarkup(stories[name]()), /data-slot="tabs"/);
  }
  const html = renderToStaticMarkup(
    stories.Playground({
      "aria-label": "Custom sections",
      orientation: "vertical",
      variant: "pill",
    })
  );
  assert.match(html, /data-variant="pill"/);
  assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /Custom sections/);
});

test("Tabs registry artifacts preserve portable source, dependencies and optional stories", () => {
  const registry = require("../registry.json");
  for (const name of ["tabs", "tabs-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    assert.ok(item, `${name} must be registered`);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.equal(artifact.files.length, 1);
    const [{ content, ...metadata }] = artifact.files;
    assert.deepEqual(metadata, item.files[0]);
    assert.equal(content, readFileSync(metadata.path, "utf-8"));
    assert.equal(metadata.target, undefined);
    assert.doesNotMatch(content, /from "@\//);
    if (name === "tabs") {
      assert.match(content, /^"use client";/);
      assert.ok(artifact.dependencies.includes("motion@^12.38.0"));
    } else {
      assert.deepEqual(artifact.dependencies ?? [], []);
      assert.match(content, /from "\.\/tabs"/);
    }
  }
});
