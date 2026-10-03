const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const registry = require("../registry.json");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const el = React.createElement;

test("Drawer registry item declares the Base UI dependency and install target", () => {
  const item = registry.items.find((entry) => entry.name === "drawer");
  assert.ok(item);
  assert.ok(item.dependencies.includes("@base-ui/react"));
  assert.ok(
    item.files.some(
      (file) =>
        file.path === "registry/new-york/drawer.tsx" &&
        file.target === "components/ui/drawer.tsx"
    )
  );
});

test("Drawer exposes its documented composition and renders an accessible trigger", () => {
  const drawer = jiti("../registry/new-york/drawer.tsx");
  for (const name of [
    "Drawer",
    "DrawerBody",
    "DrawerClose",
    "DrawerContent",
    "DrawerDescription",
    "DrawerFooter",
    "DrawerHeader",
    "DrawerOverlay",
    "DrawerPortal",
    "DrawerSwipeHandle",
    "DrawerTitle",
    "DrawerTrigger",
    "useDrawer",
    "useDrawerControl",
  ]) {
    assert.equal(typeof drawer[name], "function", `${name} is exported`);
  }

  const html = renderToStaticMarkup(
    el(
      drawer.Drawer,
      null,
      el(drawer.DrawerTrigger, null, "Open project settings"),
      el(
        drawer.DrawerContent,
        null,
        el(drawer.DrawerHeader, null, el(drawer.DrawerTitle, null, "Settings")),
        el(drawer.DrawerDescription, null, "Update project preferences")
      )
    )
  );
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /class="cursor-pointer /);
  assert.match(html, /Open project settings/);
});

test("Drawer documentation explains direction, controlled state, and accessibility", () => {
  const docs = fs.readFileSync("content/docs/components/drawer.mdx", "utf-8");
  assert.match(docs, /snapPoints/);
  assert.match(docs, /onOpenChange/);
  assert.match(docs, /focus management/i);
  assert.match(docs, /modal=\{false\}/);
});

test("Drawer playground defaults, generated source, and configurable props stay in sync", () => {
  const { drawerProps, getDrawerCode, getDrawerDefaults } = jiti(
    "../lib/drawer-playground.ts"
  );
  const defaults = getDrawerDefaults();
  assert.equal(defaults.swipeDirection, "right");
  assert.equal(defaults.modal, true);
  assert.equal(defaults.showCloseButton, true);
  const code = getDrawerCode({
    ...defaults,
    modal: false,
    showCloseButton: false,
    showSwipeHandle: true,
    snapPoints: "half-full",
    swipeDirection: "down",
  });
  assert.ok(code.includes('swipeDirection="down"'));
  assert.ok(code.includes("modal={false}"));
  assert.ok(code.includes("showSwipeHandle"));
  assert.ok(code.includes("showCloseButton={false}"));
  assert.ok(code.includes("snapPoints={[0.5, 0.9]}"));
  assert.ok(drawerProps.onOpenChange);
  assert.ok(drawerProps.closeButtonLabel);
  assert.ok(code.includes("<DrawerBody>"));
  const external = getDrawerCode({ ...defaults, example: "control" });
  assert.ok(external.includes("useDrawerControl()"));
  assert.ok(external.includes("control={control}"));
  assert.ok(external.includes("finalFocus={opener}"));
  const renderFunction = getDrawerCode({
    ...defaults,
    example: "render-function",
  });
  assert.ok(renderFunction.includes("{({ close }) => ("));
  assert.ok(renderFunction.includes("onClick={close}"));
  const longContent = getDrawerCode({ ...defaults, longContent: true });
  assert.ok(longContent.includes("length: 30"));
});
