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

test("AppShell desktop toggle stays beside the brand or workspace header and expands the rail", async () => {
  await setup();
  for (const showHeader of [true, false]) {
    for (const sidebarHeader of [
      undefined,
      React.createElement("button", { type: "button" }, "Workspace"),
    ]) {
      await render({ collapsed: false, showHeader, sidebarHeader });
      const sidebar = host.querySelector('[data-slot="app-shell-sidebar"]');
      const row = sidebar.firstElementChild;
      assert.ok(
        row.textContent.includes(sidebarHeader ? "Workspace" : "Acme"),
        "Sidebar header keeps the identity"
      );
      const toggle = row.querySelector('[aria-label="Collapse sidebar"]');
      assert.ok(Boolean(toggle), "Desktop toggle belongs in the identity row");
      assert.ok(
        toggle.closest("a") === null,
        "Toggle must not be nested in a brand link"
      );
      assert.equal(
        host.querySelectorAll('[aria-label="Collapse sidebar"]').length,
        1
      );
      await render({ collapsed: true, showHeader, sidebarHeader });
      assert.ok(
        Boolean(sidebar.querySelector('[aria-label="Expand sidebar"]')),
        "Compact rail retains its expand control"
      );
    }
  }
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

test("AppShell linked brand remains independently available in the collapsed sidebar", async () => {
  await setup();
  for (const showHeader of [true, false]) {
    await render({
      brand: { href: "/workspace", name: "Acme" },
      collapsed: true,
      showHeader,
    });
    const sidebar = host.querySelector('[data-slot="app-shell-sidebar"]');
    const link = sidebar.querySelector('a[href="/workspace"]');
    assert.ok(
      Boolean(link),
      "Collapsing must not remove the brand destination"
    );
    assert.equal(link.getAttribute("aria-label"), "Acme");
    assert.ok(
      Boolean(sidebar.querySelector('[aria-label="Expand sidebar"]')),
      "Brand link is separate from expansion"
    );
    assert.ok(
      link.querySelector("button") === null,
      "Brand link must not wrap the toggle"
    );
  }
});

test("AppShell supports headerless content and localized shell labels", async () => {
  await setup();
  await render({
    labels: {
      collapseSidebar: "Réduire la barre latérale",
      openNavigation: "Ouvrir la navigation",
      sidebar: "Navigation latérale",
      skipToContent: "Aller au contenu",
    },
    showHeader: false,
  });
  assert.ok(
    host.querySelector('[data-slot="app-shell-header"]') === null,
    "Headerless shell omits topbar"
  );
  assert.ok(host.querySelector('[data-slot="app-shell-main"]'));
  assert.equal(
    host.querySelector('[aria-label="Navigation latérale"]')?.tagName,
    "ASIDE"
  );
  assert.ok(
    host.querySelector('a[href^="#"]')?.textContent.includes("Aller au contenu")
  );
  assert.ok(
    host.querySelector('[aria-label="Ouvrir la navigation"]') !== null,
    "Headerless mobile trigger remains available"
  );
  await render({ labels: { collapseSidebar: "Réduire" } });
  assert.ok(host.querySelector('[aria-label="Réduire"]'));
});

test("AppShell built-in user footer is optional and custom footer takes precedence", async () => {
  await setup();
  await render({
    user: { description: "Workspace owner", items: [], name: "Avery Cole" },
  });
  assert.ok(host.querySelector('[aria-label="Avery Cole account menu"]'));
  assert.ok(host.textContent.includes("AC"));
  assert.ok(host.textContent.includes("Workspace owner"));
  await render({
    sidebarFooter: null,
    user: { items: [], name: "Avery Cole" },
  });
  assert.ok(
    host.querySelector('[aria-label="Avery Cole account menu"]') === null,
    "Explicit null footer suppresses built-in user"
  );
  await render({
    sidebarFooter: "Custom footer",
    user: { items: [], name: "Avery Cole" },
  });
  assert.ok(host.textContent.includes("Custom footer"));
  assert.ok(
    host.querySelector('[aria-label="Avery Cole account menu"]') === null,
    "Custom footer replaces built-in user"
  );
});

test("AppShell compact user exposes identity tooltip and caller pending disables the native menu trigger", async () => {
  await setup();
  const user = {
    description: "Workspace owner",
    items: [],
    menuLabel: "Menu akun Avery",
    name: "Avery Cole",
  };
  await render({ collapsed: true, user });
  const trigger = host.querySelector('[aria-label="Menu akun Avery"]');
  assert.equal(trigger.tagName, "BUTTON");
  assert.equal(trigger.textContent, "AC");
  await React.act(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Tab" })
    );
    trigger.focus();
    trigger.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" })
    );
    trigger.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
  });
  await settle();
  assert.equal(
    document.querySelector('[data-slot="tooltip-content"]')?.textContent,
    "Avery Cole"
  );
  await render({ collapsed: true, user: { ...user, pending: true } });
  const pending = host.querySelector('[aria-label="Menu akun Avery"]');
  assert.equal(pending.disabled, true);
  assert.equal(pending.getAttribute("aria-busy"), "true");
  await render({ collapsed: false, user });
  const expanded = host.querySelector('[aria-label="Menu akun Avery"]');
  assert.equal(expanded.dataset.slot, "dropdown-trigger");
  assert.ok(expanded.textContent.includes("Workspace owner"));
});

test("AppShell headerless retains rail controls and localized right mobile navigation", async () => {
  await setup();
  await render({
    labels: { closeNavigation: "Tutup navigasi" },
    showHeader: false,
    sidebarFooter: ({ closeNavigation }) =>
      React.createElement("button", { onClick: closeNavigation }, "Done"),
  });
  await click(host.querySelector('[aria-label="Collapse sidebar"]'));
  assert.equal(
    host.querySelector('[data-slot="app-shell"]').dataset.collapsed,
    "true"
  );
  dom.happyDOM.setWindowSize({ height: 844, width: 390 });
  const trigger = host.querySelector('[aria-label="Open navigation"]');
  await click(trigger);
  await settle();
  assert.ok(
    document.querySelector('[role="dialog"]') !== null,
    "Headerless drawer opens"
  );
  assert.ok(
    document.querySelector('[aria-label="Tutup navigasi"]') !== null,
    "Close control is translated"
  );
  await click(
    [...document.querySelectorAll('[role="dialog"] button')].find(
      (button) => button.textContent === "Done"
    )
  );
  await settle();
  assert.ok(
    document.querySelector('[role="dialog"]') === null,
    "Footer receives closeNavigation"
  );
  assert.ok(
    document.activeElement === trigger,
    "Focus returns to headerless trigger"
  );
});

test("AppShell custom compact links keep native semantics and Tooltip trigger identity", async () => {
  await setup();
  const ref = React.createRef();
  let clicks = 0;
  const navigation = [
    {
      id: "reports",
      label: "Reports",
      renderControl: ({ closeNavigation }) =>
        React.createElement(
          "a",
          {
            "aria-current": "page",
            href: "/reports",
            onClick: () => {
              clicks += 1;
              closeNavigation();
            },
            ref,
          },
          "R"
        ),
    },
  ];
  await render({ defaultCollapsed: true, navigation });
  const link = host.querySelector('a[href="/reports"]');
  assert.equal(link?.getAttribute("aria-current"), "page");
  assert.ok(ref.current === link, "Consumer ref remains on the custom anchor");
  await React.act(async () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Tab" })
    );
    link.focus();
    link.dispatchEvent(
      new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" })
    );
    link.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" })
    );
    link.dispatchEvent(new MouseEvent("mouseenter"));
    link.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
  });
  await settle();
  assert.equal(link.dataset.slot, "tooltip-trigger");
  assert.equal(
    document.querySelector('[data-slot="tooltip-content"]')?.textContent,
    "Reports",
    "Custom link exposes its collapsed label on keyboard focus/hover"
  );
  assert.equal(
    host.querySelectorAll('a[href="/reports"]').length,
    1,
    "Tooltip composition keeps one link root"
  );
  await click(link);
  assert.equal(clicks, 1);
  await render({ collapsed: false, navigation });
  await React.act(() => {
    const expanded = host.querySelector('a[href="/reports"]');
    expanded.focus();
    expanded.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" })
    );
    expanded.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
  });
  await settle();
  assert.ok(
    document.querySelector('[data-slot="tooltip-content"]') === null,
    "Expanded custom navigation does not open a redundant tooltip"
  );
  dom.happyDOM.setWindowSize({ height: 844, width: 390 });
  await render({ collapsed: true, navigation });
  await click(host.querySelector('[aria-label="Open navigation"]'));
  await settle();
  const mobile = document.querySelector(
    '[data-slot="drawer-popup"] a[href="/reports"]'
  );
  assert.ok(Boolean(mobile), "Mobile custom destination exists");
  await React.act(() => mobile.focus());
  await settle();
  assert.ok(
    document.querySelector('[data-slot="tooltip-content"]') === null,
    "Mobile custom navigation does not open a redundant tooltip"
  );
});

test("AppShell user action closes mobile navigation only after successful selection", async () => {
  await setup();
  dom.happyDOM.setWindowSize({ height: 844, width: 390 });
  const { promise: result, resolve: resolveAction } = Promise.withResolvers();
  await render({
    user: {
      items: [
        {
          closeOnSelect: "success",
          id: "save",
          label: "Save",
          onSelect: () => result,
        },
      ],
      name: "Avery Cole",
    },
  });
  await click(host.querySelector('[aria-label="Open navigation"]'));
  await settle();
  const dialog = document.querySelector('[role="dialog"]');
  assert.ok(dialog, "Mobile navigation is open");
  await click(dialog.querySelector('[aria-label="Avery Cole account menu"]'));
  await settle();
  const save = document.querySelector('[role="menuitem"]');
  assert.ok(save, "User action is rendered");
  await click(save);
  assert.ok(
    document.querySelector('[role="dialog"]'),
    "Pending success-only selection keeps the drawer mounted"
  );
  await React.act(async () => resolveAction("saved"));
  await settle();
  assert.ok(
    document.querySelector('[role="dialog"]') === null,
    "Successful selection closes mobile navigation"
  );
});

test("AppShell user default async action preserves mobile owner until rejection is handled", async () => {
  await setup();
  dom.happyDOM.setWindowSize({ height: 844, width: 390 });
  let errors = 0;
  const { promise: result, reject: rejectAction } = Promise.withResolvers();
  await render({
    user: {
      items: [
        {
          id: "save",
          label: "Save",
          onSelect: () => result,
          onSelectError: () => {
            errors += 1;
          },
        },
      ],
      name: "Avery Cole",
    },
  });
  await click(host.querySelector('[aria-label="Open navigation"]'));
  await settle();
  await click(
    document.querySelector(
      '[role="dialog"] [aria-label="Avery Cole account menu"]'
    )
  );
  await settle();
  await click(document.querySelector('[role="menuitem"]'));
  await settle();
  assert.ok(
    document.querySelector('[role="dialog"]') !== null,
    "Pending action must not unmount its Dropdown owner"
  );
  await React.act(async () => rejectAction(new Error("Expected rejection")));
  await settle();
  assert.equal(errors, 1, "Dropdown handles the rejection while mounted");
  assert.ok(
    document.querySelector('[role="dialog"]') !== null,
    "Rejected action keeps navigation available"
  );
});

const registerGroupedUserCase = (scenario) => {
  test(`AppShell grouped user selection respects ${scenario} lifecycle`, async () => {
    await setup();
    dom.happyDOM.setWindowSize({ height: 844, width: 390 });
    let finish;
    let calls = 0;
    let errors = 0;
    const action = {
      closeOnSelect: scenario === "keep" ? false : "success",
      id: "action",
      label: "Run action",
      onSelect: (event) => {
        calls += 1;
        if (scenario === "cancel") {
          event.preventDefault();
        }
        if (scenario === "base-cancel") {
          event.preventBaseUIHandler();
        }
        if (scenario === "throw") {
          throw new Error("Expected action failure");
        }
        if (scenario === "reject" || scenario === "late") {
          const deferred = Promise.withResolvers();
          finish = scenario === "reject" ? deferred.reject : deferred.resolve;
          return deferred.promise;
        }
      },
      onSelectError: () => {
        errors += 1;
      },
    };
    await render({
      user: {
        items: [
          { id: "account", items: [action], label: "Account", type: "group" },
        ],
        name: "Avery",
      },
    });
    await click(host.querySelector('[aria-label="Open navigation"]'));
    await settle();
    const trigger = document.querySelector(
      '[role="dialog"] [aria-label="Avery account menu"]'
    );
    await click(trigger);
    await settle();
    await click(document.querySelector('[role="menuitem"]'));
    if (scenario === "reject" || scenario === "late") {
      await click(document.querySelector('[role="menuitem"]'));
      assert.equal(calls, 1, "Pending action locks repeat selection");
      if (scenario === "late") {
        await click(trigger);
        await click(trigger);
      }
      await React.act(async () => finish(new Error("Expected rejection")));
    }
    await settle();
    assert.equal(calls, 1);
    assert.equal(errors, scenario === "throw" || scenario === "reject" ? 1 : 0);
    assert.equal(
      document.querySelector('[role="dialog"]') !== null,
      scenario !== "sync",
      "Only an accepted current-session success closes navigation"
    );
  });
};

for (const scenario of [
  "sync",
  "cancel",
  "base-cancel",
  "throw",
  "keep",
  "reject",
  "late",
]) {
  registerGroupedUserCase(scenario);
}

const registerUserLinkCase = (scenario) => {
  test(`AppShell user ${scenario} preserves native navigation lifecycle`, async () => {
    await setup();
    dom.happyDOM.setWindowSize({ height: 844, width: 390 });
    let clicks = 0;
    const ref = React.createRef();
    await render({
      user: {
        items: [
          {
            closeOnSelect: scenario !== "persistent-link",
            id: "profile",
            label: "Profile",
            link: React.createElement("a", {
              href: "#profile",
              onClick: (event) => {
                clicks += 1;
                if (scenario === "canceled-link") {
                  event.preventDefault();
                }
              },
              ref,
            }),
          },
        ],
        name: "Avery",
      },
    });
    await click(host.querySelector('[aria-label="Open navigation"]'));
    await settle();
    await click(
      document.querySelector(
        '[role="dialog"] [aria-label="Avery account menu"]'
      )
    );
    await settle();
    const link = document.querySelector('[role="menuitem"][href="#profile"]');
    assert.ok(ref.current === link, "Link ref reaches one native anchor");
    await React.act(async () =>
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          button: 0,
          cancelable: true,
          ctrlKey: scenario === "modified-link",
        })
      )
    );
    await settle();
    assert.equal(clicks, 1);
    assert.equal(
      document.querySelector('[role="dialog"]') !== null,
      scenario !== "link"
    );
  });
};

for (const scenario of [
  "link",
  "canceled-link",
  "modified-link",
  "persistent-link",
]) {
  registerUserLinkCase(scenario);
}

test("AppShell user overlay and menu dismissal leave mobile navigation mounted", async () => {
  await setup();
  const { Dialog } = jiti("../registry/new-york/dialog.tsx");
  dom.happyDOM.setWindowSize({ height: 844, width: 390 });
  await render({
    user: {
      items: [
        {
          id: "details",
          label: "Details",
          renderOverlay: ({ finalFocus, ...props }) =>
            React.createElement(
              Dialog,
              {
                ...props,
                contentProps: { finalFocus },
                title: "Account details",
              },
              "Local account details"
            ),
        },
      ],
      name: "Avery",
    },
  });
  await click(host.querySelector('[aria-label="Open navigation"]'));
  await settle();
  const trigger = document.querySelector(
    '[role="dialog"] [aria-label="Avery account menu"]'
  );
  await click(trigger);
  await settle();
  await React.act(async () =>
    document
      .querySelector('[role="menuitem"]')
      .dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
      )
  );
  await settle();
  assert.equal(
    document.querySelectorAll('[role="dialog"]').length,
    1,
    "Menu Escape does not close drawer"
  );
  await click(trigger);
  await settle();
  await click(document.querySelector('[role="menuitem"]'));
  await settle();
  assert.equal(
    document.querySelectorAll('[role="dialog"]').length,
    2,
    "Overlay activation preserves drawer owner"
  );
  await click(document.querySelector('[data-slot="dialog-close-button"]'));
  await settle();
  assert.equal(
    document.querySelectorAll('[role="dialog"]').length,
    1,
    "Closing overlay preserves navigation"
  );
  assert.ok(
    document.activeElement === trigger,
    "Overlay returns focus to surviving user trigger"
  );
});

test("AppShell user submenu success closes mobile navigation", async () => {
  await setup();
  dom.happyDOM.setWindowSize({ height: 844, width: 390 });
  let calls = 0;
  await render({
    user: {
      items: [
        {
          id: "settings",
          items: [
            {
              id: "save",
              label: "Save",
              onSelect: () => {
                calls += 1;
              },
            },
          ],
          label: "Settings",
          type: "submenu",
        },
      ],
      name: "Avery",
    },
  });
  await click(host.querySelector('[aria-label="Open navigation"]'));
  await settle();
  await click(
    document.querySelector('[role="dialog"] [aria-label="Avery account menu"]')
  );
  await settle();
  const sub = document.querySelector('[data-slot="dropdown-sub-trigger"]');
  await React.act(async () => {
    sub.focus();
    sub.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })
    );
  });
  await settle();
  await click(
    [...document.querySelectorAll('[role="menuitem"]')].find(
      (item) => item.textContent === "Save"
    )
  );
  await settle();
  assert.equal(calls, 1);
  assert.ok(
    document.querySelector('[role="dialog"]') === null,
    "Nested success closes navigation"
  );
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
