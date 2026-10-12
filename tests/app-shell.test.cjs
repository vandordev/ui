/* eslint-disable require-await, global-require */
const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const { setTimeout: delay } = require("node:timers/promises");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
let AppShell, React, createRoot, dom, host, root;
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost", width: 1200 });
  // As in the other Motion tests, use the real JS animation fallback:
  // Happy DOM's WAAPI cancellation rejects during interruption/teardown.
  // These DOM checks do not establish browser animation appearance.
  delete dom.Element.prototype.animate;
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "Element",
    "Node",
    "NodeFilter",
    "MouseEvent",
    "PointerEvent",
    "KeyboardEvent",
    "MutationObserver",
    "ResizeObserver",
    "Event",
    "CustomEvent",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "SVGElement",
  ]) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === "window" ? dom : dom[name],
      writable: true,
    });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  React = require("react");
  ({ createRoot } = require("react-dom/client"));
})();
const setup = async () => {
  await ready;
  assert.ok(
    existsSync("registry/new-york/app-shell.tsx"),
    "AppShell must exist"
  );
  ({ AppShell } = jiti("../registry/new-york/app-shell.tsx"));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
};
const render = async (props = {}) => {
  await React.act(async () =>
    root.render(
      React.createElement(
        AppShell,
        {
          brand: { name: "Acme" },
          navigation: [],
          ...props,
        },
        React.createElement("h1", null, "Content")
      )
    )
  );
};
const click = async (element) => {
  assert.ok(element, "Expected a clickable control");
  await React.act(async () => element.click());
};
const settle = async () => {
  await React.act(async () => {
    await delay(350);
  });
};
afterEach(async () => {
  if (root) {
    await React.act(async () => root.unmount());
    root = null;
    host.remove();
  }
  await ready;
  dom.happyDOM.setWindowSize({ height: 900, width: 1200 });
});
after(async () => {
  await ready;
  await dom.happyDOM.abort();
});

test("AppShell portable stories compose and controlled collapse remains interactive", async () => {
  await setup();
  const { composeStories } = require("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/app-shell.stories.tsx")
  );
  await React.act(async () =>
    root.render(React.createElement(stories.Controlled))
  );
  await click(host.querySelector('[aria-label="Collapse sidebar"]'));
  assert.equal(
    host.querySelector('[data-slot="app-shell"]').dataset.collapsed,
    "true"
  );
  await React.act(async () =>
    root.render(React.createElement(stories.Hierarchy))
  );
  await click(
    [...host.querySelectorAll("button")].find((button) =>
      button.textContent.includes("Open Customer Support")
    )
  );
  await settle();
  assert.ok(host.querySelector('[aria-label="All agents"]'));
  assert.equal(host.querySelectorAll("[data-navigation-panel]").length, 1);
});

test("AppShell collapse supports uncontrolled and controlled ownership", async () => {
  await setup();
  const changes = [];
  await render({ onCollapsedChange: (value) => changes.push(value) });
  await click(host.querySelector('[aria-label="Collapse sidebar"]'));
  assert.equal(
    host.querySelector('[data-slot="app-shell"]').dataset.collapsed,
    "true"
  );
  assert.equal(
    host
      .querySelector('[aria-label="Expand sidebar"]')
      .getAttribute("aria-expanded"),
    "false"
  );
  await render({
    collapsed: false,
    onCollapsedChange: (value) => changes.push(value),
  });
  await click(host.querySelector('[aria-label="Collapse sidebar"]'));
  assert.equal(
    host.querySelector('[data-slot="app-shell"]').dataset.collapsed,
    "false"
  );
  assert.deepEqual(changes, [true, true]);
  await render({ collapsed: true });
  assert.ok(host.querySelector('[aria-label="Expand sidebar"]'));
});

test("AppShell renders links, disabled actions, custom controls and separators without extra buttons", async () => {
  await setup();
  let selected = 0;
  await render({
    defaultCollapsed: true,
    navigation: [
      {
        active: true,
        dividerAfter: true,
        href: "/home",
        id: "home",
        label: "Home",
      },
      {
        disabled: true,
        href: "/locked",
        id: "locked",
        label: "Locked",
        onClick: () => {
          selected += 1;
        },
      },
      {
        dividerAfter: true,
        id: "custom",
        label: "Resource",
        renderControl: ({ collapsed }) =>
          React.createElement(
            "button",
            { "data-custom": "", type: "button" },
            collapsed ? "Compact resource" : "Resource"
          ),
      },
    ],
    sidebarFooter: ({ collapsed }) =>
      React.createElement(
        "span",
        null,
        collapsed ? "Compact account" : "Account"
      ),
    sidebarHeader: ({ collapsed }) =>
      React.createElement(
        "span",
        null,
        collapsed ? "Compact workspace" : "Workspace"
      ),
  });
  const link = host.querySelector('a[href="/home"]');
  assert.equal(link?.getAttribute("aria-current"), "page");
  assert.equal(link?.getAttribute("aria-label"), "Home");
  const locked = host.querySelector('[aria-label="Locked"]');
  assert.ok(locked?.hasAttribute("disabled"));
  await click(locked);
  assert.equal(selected, 0);
  const custom = host.querySelector("[data-custom]");
  assert.equal(custom?.textContent, "Compact resource");
  assert.ok(
    custom?.parentElement?.closest("button") === null,
    "No nested button around custom control"
  );
  assert.equal(host.querySelectorAll('[role="separator"]').length, 2);
  assert.match(host.textContent, /Compact workspace/);
  assert.match(host.textContent, /Compact account/);
});

const contextProps = (key, depth, label) => ({
  navigation: [{ id: "destination", label }],
  navigationContext: { depth, key },
  navigationLabel: `${key} navigation`,
});
test("AppShell hierarchy changes retire outgoing navigation and preserve same-context controls", async () => {
  await setup();
  await render(contextProps("workspace", 0, "Agents"));
  const initial = host.querySelector("[data-navigation-panel]");
  await render(contextProps("workspace", 0, "Providers"));
  assert.ok(
    host.querySelector("[data-navigation-panel]") === initial,
    "Same context must not remount"
  );
  host.querySelector('[aria-label="Providers"]').focus();
  await render(contextProps("resource", 1, "Profile"));
  assert.ok(initial.hasAttribute("inert"), "Outgoing panel must be inert");
  assert.equal(initial.getAttribute("aria-hidden"), "true");
  const incoming = host.querySelector("[data-navigation-panel]:not([inert])");
  assert.ok(
    document.activeElement === incoming,
    "Focus must leave outgoing navigation"
  );
  assert.equal(incoming.dataset.navigationDirection, "1");
  await settle();
  assert.equal(host.querySelectorAll("[data-navigation-panel]").length, 1);
  await render(contextProps("workspace", 0, "Agents"));
  assert.equal(
    host.querySelector("[data-navigation-panel]:not([inert])").dataset
      .navigationDirection,
    "-1"
  );
});

const searchKey = () =>
  new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ctrlKey: true,
    key: "k",
  });
test("AppShell optional search shortcut is installed and cleaned up only with a callback", async () => {
  await setup();
  let searches = 0;
  await render();
  const inactive = searchKey();
  document.dispatchEvent(inactive);
  assert.equal(inactive.defaultPrevented, false);
  await render({
    onSearch: () => {
      searches += 1;
    },
    searchLabel: "Find projects",
  });
  await click(
    [...host.querySelectorAll("button")].find((button) =>
      button.textContent.includes("Find projects")
    )
  );
  const active = searchKey();
  document.dispatchEvent(active);
  assert.equal(active.defaultPrevented, true);
  assert.equal(searches, 2);
  await render();
  document.dispatchEvent(searchKey());
  assert.equal(searches, 2);
});

test("AppShell mobile selection closes the drawer and restores trigger focus", async () => {
  await setup();
  dom.happyDOM.setWindowSize({ height: 844, width: 390 });
  let selections = 0;
  await render({
    navigation: [
      {
        id: "projects",
        label: "Projects",
        onClick: () => {
          selections += 1;
        },
      },
    ],
  });
  const trigger = host.querySelector('[aria-label="Open navigation"]');
  await click(trigger);
  await settle();
  const dialog = document.querySelector('[role="dialog"]');
  assert.ok(dialog, "Mobile navigation must open");
  assert.match(dialog.textContent, /Acme/);
  await click(dialog.querySelector('[aria-label="Projects"]'));
  await settle();
  assert.equal(selections, 1);
  assert.ok(
    document.querySelector('[role="dialog"]') === null,
    "Navigation must close"
  );
  assert.ok(
    document.activeElement === trigger,
    "Focus must return to the opener"
  );
});

test("AppShell generated items keep stories optional and documentation omits playground", () => {
  const registry = JSON.parse(readFileSync("registry.json", "utf-8"));
  for (const name of ["app-shell", "app-shell-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    assert.ok(item, `${name} must be registered`);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    for (const file of item.files) {
      assert.equal(file.target, undefined);
      assert.equal(
        artifact.files.find((entry) => entry.path === file.path)?.content,
        readFileSync(file.path, "utf-8")
      );
    }
    if (name.endsWith("-stories")) {
      assert.deepEqual(item.registryDependencies ?? [], []);
    } else {
      assert.ok(!item.files.some((file) => file.path.includes("stories")));
      assert.ok(
        !item.dependencies.some((dependency) =>
          dependency.includes("storybook")
        )
      );
    }
  }
  const { buildComponentDocSections } = jiti("../lib/component-docs.ts");
  const sections = buildComponentDocSections(
    { component: "app-shell" },
    "source"
  );
  const headingNames = new Set(
    sections.before
      .filter((node) => node.type === "heading")
      .map((node) => node.children[0].value)
  );
  assert.ok(headingNames.has("Installation"));
  assert.ok(!headingNames.has("Playground"));
});
