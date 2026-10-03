const assert = require("node:assert/strict");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");
const { readFileSync } = require("node:fs");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const el = React.createElement;

test("the dependency lockfile contains no direct or transitive Radix packages", () => {
  const lockfile = readFileSync("pnpm-lock.yaml", "utf-8");
  assert.ok(!/@radix-ui\/|radix-ui@|\bcmdk@|\bvaul@/.test(lockfile));
});

test("Base UI switch retains its label id, checked state, and native disabled button", () => {
  const { Switch } = jiti("../components/ui/switch.tsx");
  const html = renderToStaticMarkup(
    el(Switch, { defaultChecked: true, disabled: true, id: "feedback" })
  );
  const [button] = html.match(/<button[^>]+>/);
  assert.ok(button.includes('id="feedback"'));
  assert.ok(button.includes('disabled=""'));
  assert.ok(button.includes('role="switch"'));
  assert.ok(button.includes('aria-checked="true"'));
  assert.ok(button.includes('data-state="checked"'));
});

test("Base UI tabs preserve selected styling and accessible panel relationships", () => {
  const { Tabs, TabsList, TabsTrigger, TabsContent } = jiti(
    "../components/ui/tabs.tsx"
  );
  const html = renderToStaticMarkup(
    el(
      Tabs,
      { defaultValue: "npm" },
      el(
        TabsList,
        null,
        el(TabsTrigger, { value: "npm" }, "npm"),
        el(TabsTrigger, { value: "pnpm" }, "pnpm")
      ),
      el(TabsContent, { value: "npm" }, "npm install")
    )
  );
  assert.ok(html.includes('role="tablist"'));
  assert.ok(html.includes('aria-selected="true"'));
  assert.ok(html.includes('data-state="active"'));
  assert.ok(html.includes('role="tabpanel"'));
  assert.ok(html.includes("npm install"));
});

test("Base UI render composition preserves a single link with child content", () => {
  const { Button } = jiti("../components/ui/button.tsx");
  const html = renderToStaticMarkup(
    el(
      Button,
      { asChild: true, variant: "ghost" },
      el("a", { href: "/docs" }, "Docs")
    )
  );
  assert.ok(html.startsWith("<a "));
  assert.ok(html.includes('href="/docs"'));
  assert.ok(html.includes(">Docs</a>"));
  assert.ok(!html.includes("<button"));
});
