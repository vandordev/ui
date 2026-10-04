const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});

test("ComponentPreview puts the demo and source inside one shared frame", () => {
  const { ComponentPreview } = jiti("../components/component-preview.tsx");
  const demo = React.createElement("button", null, "Open drawer");
  const frame = ComponentPreview({
    children: demo,
    name: "drawer-demo",
    title: "drawer-demo.tsx",
  });
  const [preview, source] = React.Children.toArray(frame.props.children);
  assert.equal(frame.props["data-slot"], "component-preview");
  assert.equal(preview.props["data-slot"], "component-preview-demo");
  assert.equal(preview.props.children, demo);
  assert.equal(source.props["data-slot"], "component-preview-source");
  assert.equal(source.props.children.props.name, "drawer-demo");
  assert.equal(source.props.children.props.title, "drawer-demo.tsx");
  assert.equal(source.props.children.props.expandLabel, "Expand code");
  assert.equal(source.props.children.props.collapseLabel, "Collapse code");
});

test("collapsible source uses contextual code labels without changing standalone defaults", () => {
  const { CodeCollapsibleWrapper } = jiti(
    "../components/code-collapsible-wrapper.tsx"
  );
  const embedded = renderToStaticMarkup(
    React.createElement(
      CodeCollapsibleWrapper,
      { collapseLabel: "Collapse code", expandLabel: "Expand code" },
      "Source"
    )
  );
  const standalone = renderToStaticMarkup(
    React.createElement(CodeCollapsibleWrapper, null, "Source")
  );
  assert.match(embedded, /Expand code/);
  assert.doesNotMatch(standalone, /Expand code/);
  assert.match(standalone, /Expand/);
});
