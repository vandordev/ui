const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");
const { createJiti } = require("jiti");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");
const jsxRuntime = require("react/jsx-runtime");
const registry = require("../registry.json");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("PageContainer controls generate the same markup as the typed preview and reset safely", () => {
  const { PageContainerPreview } = jiti(
    "../components/page-container-playground.tsx"
  );
  const { getPageContainerDefaults, getPageContainerCode } = jiti(
    "../lib/page-container-playground.ts"
  );
  const component = jiti("../registry/new-york/page-container.tsx");
  for (const override of [
    {},
    ...["sm", "md", "lg", "xl", "full"].map((size) => ({ size })),
    { children: `A "title" <with> braces {}\nand \`ticks\` \${expressions}` },
    { children: "", size: "full" },
  ]) {
    const values = { ...getPageContainerDefaults(), ...override };
    const compiled = ts.transpileModule(getPageContainerCode(values), {
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
          "@/components/ui/page-container": component,
          "react/jsx-runtime": jsxRuntime,
        })[name],
    });
    assert.equal(
      renderToStaticMarkup(React.createElement(exports.PageContainerDemo)),
      renderToStaticMarkup(
        React.createElement(PageContainerPreview, { values })
      )
    );
  }
  const defaults = getPageContainerDefaults();
  defaults.children = "Changed";
  defaults.size = "full";
  assert.equal(getPageContainerDefaults().children, "Page content");
  assert.equal(getPageContainerDefaults().size, "lg");
});

test("PageContainer preserves native props and ref and lets callers override layout classes", () => {
  const { PageContainer } = jiti("../registry/new-york/page-container.tsx");
  const ref = React.createRef();
  let clicks = 0;
  const onClick = () => {
    clicks += 1;
  };
  const element = PageContainer({
    children: "Content",
    className: "max-w-none px-0 sm:px-0 lg:px-0",
    id: "content",
    onClick,
    ref,
  });
  assert.ok(element.props.ref === ref, "Consumer ref must be forwarded");
  assert.ok(
    element.props.onClick === onClick,
    "Consumer handler must be forwarded"
  );
  element.props.onClick();
  assert.equal(clicks, 1);
  assert.equal(element.type, "div");
  assert.equal(element.props.id, "content");
  assert.match(element.props.className, /max-w-none/);
  assert.doesNotMatch(
    element.props.className,
    /max-w-6xl|\bpx-4\b|sm:px-6|lg:px-8/
  );
});

test("PageContainer artifacts remain stories-free and portable stories compose size controls", async () => {
  for (const name of ["page-container", "page-container-stories"]) {
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
    jiti("../registry/new-york/page-container.stories.tsx")
  );
  assert.match(
    renderToStaticMarkup(
      stories.Playground({ children: "Wide content", size: "full" })
    ),
    /Wide content/
  );
  assert.match(
    renderToStaticMarkup(stories.Playground({ size: "sm" })),
    /max-w-2xl/
  );
  for (const name of ["Sizes", "FullWidth", "LongContent"]) {
    assert.match(
      renderToStaticMarkup(stories[name]()),
      /data-slot="page-container"/
    );
  }
});
