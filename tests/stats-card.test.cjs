/* eslint-disable global-require -- Generated consumer imports resolve in an isolated VM using real dependencies. */
const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const { Activity } = require("lucide-react");
const ts = require("typescript");
const { runInNewContext } = require("node:vm");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("StatsCard preserves exact display values and handles missing numeric values", () => {
  const { StatsCard } = jiti("../registry/new-york/stats-card.tsx");
  const html = renderToStaticMarkup(
    React.createElement(StatsCard, {
      ariaLabel: "Payment overview",
      items: [
        {
          icon: Activity,
          key: "exact",
          title: "Volume",
          value: { display: "Rp9.007.199.254.740.993" },
        },
        {
          icon: Activity,
          key: "negative",
          title: "Change",
          value: {
            format: (value) => `Rp ${value.toLocaleString("id-ID")}`,
            target: -125_000,
          },
        },
        ...[null, Number.NaN, Infinity].map((target, index) => ({
          icon: Activity,
          key: String(index),
          title: "Unavailable",
          value: { target },
        })),
        {
          badge: { label: "Stable", variant: "outline" },
          caption: 0,
          icon: Activity,
          key: "zero",
          title: "Zero",
          value: { target: 0 },
        },
      ],
    })
  );
  assert.match(html, /role="group" aria-label="Payment overview"/);
  assert.match(html, /Rp9.007.199.254.740.993/);
  assert.match(html, /Rp -125.000/);
  assert.equal((html.match(/—/g) ?? []).length, 3);
  assert.match(html, />0<\/div>/);
  assert.match(html, /Stable/);
  assert.equal((html.match(/<dt /g) ?? []).length, 6);
  assert.equal((html.match(/<dd /g) ?? []).length, 6);
  assert.doesNotMatch(html, /NaN|Infinity|undefined/);
});

test("every StatsCard playground control matches runnable generated code", () => {
  const { StatsCard } = jiti("../registry/new-york/stats-card.tsx");
  const { getStatsCardCode, getStatsCardDefaults, getStatsCardPreviewProps } =
    jiti("../lib/stats-card-playground.ts");
  const defaults = getStatsCardDefaults();
  const changes = {
    ariaLabel: 'Summary "quoted" <now>\nnext',
    badgeVariant: "destructive",
    caption: 'Caption "quoted"',
    count: 5,
    showBadge: false,
    showCaption: false,
    target: -42,
    title: 'Title "quoted" {value}',
    valueMode: "display",
  };
  const configs = [
    defaults,
    ...Object.entries(changes).map(([key, value]) => ({
      ...defaults,
      [key]: value,
    })),
    { ...defaults, ...changes },
    ...[1, 2, 3, 4, 6].map((count) => ({ ...defaults, count })),
  ];
  for (const values of configs) {
    const compiled = ts.transpileModule(getStatsCardCode(values), {
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
        name === "@/components/ui/stats-card" ? { StatsCard } : require(name),
    });
    assert.equal(
      renderToStaticMarkup(
        React.createElement(compiledModule.exports.StatsCardDemo)
      ),
      renderToStaticMarkup(
        React.createElement(StatsCard, getStatsCardPreviewProps(values))
      )
    );
  }
  defaults.title = "Changed";
  assert.equal(getStatsCardDefaults().title, "Active webhooks");
});

test("portable StatsCard stories compose representative values and wire args", async () => {
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/stats-card.stories.tsx")
  );
  for (const name of [
    "Playground",
    "ThreeMetrics",
    "ExactValues",
    "MissingValues",
    "LongContent",
    "UpdatingValues",
  ]) {
    assert.match(
      renderToStaticMarkup(stories[name]()),
      /data-slot="stats-card"/
    );
  }
  assert.match(
    renderToStaticMarkup(stories.Playground({ ariaLabel: "Custom summary" })),
    /aria-label="Custom summary"/
  );
  assert.match(
    renderToStaticMarkup(stories.ExactValues()),
    /Rp9.007.199.254.740.993/
  );
});

test("StatsCard artifacts preserve source and stories remain optional", () => {
  const { readFileSync } = require("node:fs");
  const registry = require("../registry.json");
  for (const name of ["stats-card", "stats-card-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(artifact.type, item.type);
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.equal(artifact.files.length, item.files.length);
    for (const file of artifact.files) {
      assert.equal(file.target, undefined);
      assert.equal(file.content, readFileSync(file.path, "utf-8"));
      assert.doesNotMatch(
        file.content,
        /@\/lib\/|@\/examples\/|@\/components\//
      );
    }
    if (name.endsWith("stories")) {
      assert.equal(artifact.files.length, 1);
      assert.deepEqual(artifact.dependencies ?? [], []);
    }
  }
});

test("StatsCard generated documentation does not promise native prop forwarding", () => {
  const { buildComponentDocSections } = jiti("../lib/component-docs.ts");
  const sections = JSON.stringify(
    buildComponentDocSections({ component: "stats-card" }, "source")
  );
  assert.doesNotMatch(sections, /Other native attributes are forwarded/);
  assert.match(sections, /does not forward native attributes/);
});

test("StatsCard generated demos and distributed stories typecheck against artifact sources", () => {
  const { readFileSync } = require("node:fs");
  const path = require("node:path");
  const { getStatsCardCode, getStatsCardDefaults } = jiti(
    "../lib/stats-card-playground.ts"
  );
  const base = path.join(process.cwd(), "tests/.virtual-stats-card-consumer");
  const sources = new Map();
  for (const name of ["stats-card", "stats-card-stories"]) {
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    for (const file of artifact.files) {
      sources.set(path.join(base, path.basename(file.path)), file.content);
    }
  }
  const defaults = getStatsCardDefaults();
  const configs = [
    defaults,
    { ...defaults, valueMode: "display" },
    { ...defaults, valueMode: "missing" },
    {
      ...defaults,
      badgeVariant: "outline",
      count: 6,
      showBadge: false,
      showCaption: false,
      target: -25,
    },
  ];
  for (const [index, values] of configs.entries()) {
    sources.set(path.join(base, `demo-${index}.tsx`), getStatsCardCode(values));
  }
  const options = {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    paths: {
      "@/components/ui/stats-card": [path.join(base, "stats-card.tsx")],
    },
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const originalRead = host.readFile;
  const originalExists = host.fileExists;
  const originalDirectoryExists = host.directoryExists;
  host.readFile = (file) => sources.get(file) ?? originalRead(file);
  host.fileExists = (file) => sources.has(file) || originalExists(file);
  host.directoryExists = (directory) =>
    directory === base || originalDirectoryExists(directory);
  const program = ts.createProgram([...sources.keys()], options, host);
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    );
  assert.deepEqual(diagnostics, []);
});
