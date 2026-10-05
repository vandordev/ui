/* eslint-disable global-require, promise/avoid-new, no-promise-executor-return */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let React, createRoot, dom, dropdown, host, reducedQuery, root;
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
  const matchMedia = dom.matchMedia.bind(dom);
  dom.matchMedia = (query) => {
    const result = matchMedia(query);
    if (query.includes("prefers-reduced-motion")) {
      reducedQuery = result;
    }
    return result;
  };
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "SVGElement",
    "Element",
    "Node",
    "NodeFilter",
    "MouseEvent",
    "PointerEvent",
    "KeyboardEvent",
    "MutationObserver",
    "ResizeObserver",
    "Event",
    "EventTarget",
    "CustomEvent",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
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
const load = () => {
  dropdown ??= jiti("../registry/new-york/dropdown.tsx");
  return dropdown;
};
const mount = async (component) => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(() => root.render(component));
};
const frames = async () => {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
};
const finish = async () => {
  for (const element of document.querySelectorAll(
    '[data-slot="dropdown-content"]'
  )) {
    for (const animation of element.getAnimations()) {
      animation.finish();
    }
  }
  await frames();
};
afterEach(async () => {
  if (root) {
    const mountedRoot = root;
    await React.act(() => mountedRoot.unmount());
    root = null;
    host.remove();
  }
});
after(async () => {
  await ready;
  await dom.happyDOM.abort();
});

test("each Dropdown control produces the same live menu behavior in preview and generated code", async () => {
  await ready;
  const ts = require("typescript");
  const { runInNewContext } = require("node:vm");
  const { DropdownPreview } = jiti("../components/dropdown-playground.tsx");
  const { getDropdownDefaults, getDropdownCode } = jiti(
    "../lib/dropdown-playground.ts"
  );
  const cases = [
    {},
    { trigger: 'A "quoted" <label>\nwith {}' },
    { animated: false },
    { disabled: true },
    { side: "top" },
    { side: "left" },
    { side: "right" },
    { align: "center" },
    { align: "end" },
    { showSubmenu: false },
    { showShortcuts: false },
    { animated: false, showShortcuts: false, showSubmenu: false, trigger: "" },
  ];
  await mount(null);
  let key = 0;
  const inspect = async (component) => {
    key += 1;
    await React.act(() =>
      root.render(React.createElement(React.Fragment, { key }, component))
    );
    const button = host.querySelector("button");
    await React.act(() => button.click());
    const menu = document.querySelector('[role="menu"][data-open]');
    const snapshot = {
      align: menu?.dataset.align,
      animated:
        menu
          ?.getAnimations()
          .some((animation) => animation.effect.getTiming().duration === 180) ??
        false,
      disabled: button.disabled,
      items: menu
        ? [...menu.querySelectorAll('[role="menuitem"]')].map((item) => ({
            disabled: item.getAttribute("aria-disabled"),
            text: item.textContent,
          }))
        : [],
      label: button.textContent,
      menu: menu?.textContent,
      side: menu?.dataset.side,
    };
    if (menu) {
      await React.act(() => menu.querySelector('[role="menuitem"]').click());
    }
    snapshot.status = host.querySelector('[role="status"]').textContent;
    return snapshot;
  };
  for (const override of cases) {
    const values = { ...getDropdownDefaults(), ...override };
    const compiled = ts.transpileModule(getDropdownCode(values), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    });
    assert.ok(
      compiled.diagnostics.length === 0,
      "Generated TSX must transpile without diagnostics"
    );
    const exports = {};
    runInNewContext(compiled.outputText, {
      exports,
      require: (name) => {
        if (name === "@/components/ui/dropdown") {
          return load();
        }
        return require(name);
      },
    });
    assert.deepEqual(
      await inspect(React.createElement(DropdownPreview, { values })),
      await inspect(React.createElement(exports.DropdownDemo)),
      JSON.stringify(override)
    );
  }
  assert.deepEqual(getDropdownDefaults(), getDropdownDefaults());
});

test("Dropdown keepMounted hides closed content and disabled animation has no native transition", async () => {
  await ready;
  const { Dropdown } = load();
  const ref = React.createRef();
  await mount(
    React.createElement(Dropdown, {
      animated: false,
      contentProps: { keepMounted: true, ref },
      items: [{ id: "action", label: "Action" }],
      modal: false,
      trigger: React.createElement("button", { type: "button" }, "Open"),
    })
  );
  await React.act(() => host.querySelector("button").click());
  assert.equal(ref.current.style.opacity, "1");
  assert.equal(ref.current.style.scale, "1");
  assert.equal(ref.current.getAnimations().length, 0);
  const popup = ref.current;
  await React.act(() => popup.querySelector('[role="menuitem"]').click());
  await React.act(frames);
  assert.ok(
    ref.current === popup,
    "The popup ref must retain the same element"
  );
  assert.equal(popup.style.opacity, "0");
  assert.ok(popup.hidden || popup.parentElement.hidden);
});

test("Dropdown stories compose meaningful controls and registry artifacts match portable source", async () => {
  await ready;
  const { readFileSync } = require("node:fs");
  const registry = require("../registry.json");
  for (const name of ["dropdown", "dropdown-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(
      artifact.files[0].content,
      readFileSync(item.files[0].path, "utf-8")
    );
    assert.equal(item.files[0].target, undefined);
    assert.deepEqual(item.registryDependencies ?? [], []);
    assert.ok(
      !(artifact.dependencies ?? []).some((dependency) =>
        dependency.includes("storybook")
      )
    );
  }
  const { composeStories } = await import("@storybook/react");
  const stories = composeStories(
    jiti("../registry/new-york/dropdown.stories.tsx")
  );
  for (const name of [
    "Playground",
    "Disabled",
    "WithoutMotion",
    "LongLabel",
    "CompoundSettings",
    "Controlled",
    "IconOnly",
    "AsyncActions",
    "Links",
    "ComponentOverlay",
  ]) {
    await mount(React.createElement(stories[name]));
    assert.ok(host.querySelector('[data-slot="dropdown-trigger"]'));
    const mountedRoot = root;
    await React.act(() => mountedRoot.unmount());
    root = null;
    host.remove();
  }
  await mount(
    React.createElement(stories.Playground, {
      animated: false,
      label: "Custom actions",
      shortcuts: false,
      submenu: false,
    })
  );
  assert.equal(host.querySelector("button").textContent, "Custom actions");
  await React.act(() => host.querySelector("button").click());
  assert.ok(
    document.querySelector('[data-slot="dropdown-sub-trigger"]') === null,
    "The submenu must be omitted"
  );
  assert.ok(
    document.querySelector('[data-slot="dropdown-shortcut"]') === null,
    "Shortcuts must be omitted"
  );
  assert.equal(
    document.querySelector('[role="menu"]').getAnimations().length,
    0
  );
});

test("Dropdown honors reduced motion without running a transition", async () => {
  await ready;
  const { Dropdown } = load();
  assert.ok(reducedQuery);
  Object.defineProperty(reducedQuery, "matches", {
    configurable: true,
    value: true,
  });
  reducedQuery.dispatchEvent(new Event("change"));
  try {
    await mount(
      React.createElement(Dropdown, {
        items: [{ id: "action", label: "Action" }],
        modal: false,
        trigger: React.createElement("button", { type: "button" }, "Open"),
      })
    );
    await React.act(() => host.querySelector("button").click());
    const menu = document.querySelector('[role="menu"][data-open]');
    assert.equal(menu.style.opacity, "1");
    assert.equal(menu.style.scale, "1");
    assert.equal(menu.getAnimations().length, 0);
  } finally {
    Object.defineProperty(reducedQuery, "matches", {
      configurable: true,
      value: false,
    });
    reducedQuery.dispatchEvent(new Event("change"));
  }
});

test("Dropdown playground Reset restores configuration, closes the menu, and clears transient selection", async () => {
  await ready;
  const { DropdownPlayground } = jiti("../components/dropdown-playground.tsx");
  await mount(React.createElement(DropdownPlayground));
  const label = [...host.querySelectorAll("label")].find(
    (node) => node.textContent === "Trigger label"
  );
  const input = document.querySelector(`[id="${label.htmlFor}"]`);
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;
  await React.act(() => {
    setter.call(input, "Custom actions");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.match(host.querySelector("pre").textContent, /Custom actions/);
  const trigger = host.querySelector('[data-slot="dropdown-trigger"]');
  assert.equal(trigger.textContent, "Custom actions");
  await React.act(() => trigger.click());
  await React.act(() =>
    document.querySelector('[data-slot="dropdown-item"]').click()
  );
  assert.match(host.querySelector('[role="status"]').textContent, /Edit/);
  await React.act(() => trigger.click());
  await React.act(() =>
    [...host.querySelectorAll("button")]
      .find((node) => node.textContent.includes("Reset"))
      .click()
  );
  assert.ok(
    document.querySelector('[role="menu"]') === null,
    "Reset must unmount the menu"
  );
  assert.equal(input.value, "Actions");
  assert.equal(
    host
      .querySelector('[data-slot="dropdown-trigger"]')
      .getAttribute("aria-expanded"),
    "false"
  );
  assert.equal(
    host.querySelector('[role="status"]').textContent,
    "Last action: None"
  );
  assert.doesNotMatch(host.querySelector("pre").textContent, /Custom actions/);
});

test("Dropdown keyboard navigation discovers disabled actions without activating them and outside pointer dismisses", async () => {
  await ready;
  const { Dropdown } = load();
  await mount(
    React.createElement(Dropdown, {
      animated: false,
      items: [
        { id: "edit", label: "Edit" },
        { disabled: true, id: "locked", label: "Locked" },
        { id: "copy", label: "Copy" },
      ],
      modal: false,
      trigger: React.createElement("button", { type: "button" }, "Actions"),
    })
  );
  const trigger = host.querySelector("button");
  await React.act(() =>
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "ArrowDown",
      })
    )
  );
  await React.act(frames);
  assert.equal(document.activeElement.textContent, "Edit");
  await React.act(() =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "ArrowDown",
      })
    )
  );
  assert.equal(document.activeElement.textContent, "Locked");
  assert.equal(document.activeElement.getAttribute("aria-disabled"), "true");
  await React.act(() =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
      })
    )
  );
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  await React.act(() =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "ArrowDown",
      })
    )
  );
  assert.equal(document.activeElement.textContent, "Copy");
  await React.act(() =>
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerType: "mouse",
      })
    )
  );
  await React.act(frames);
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
});

test("Dropdown data keeps order, groups, disabled actions, shortcuts and trigger refs without nested buttons", async () => {
  await ready;
  const { Dropdown } = load();
  const el = React.createElement;
  const ref = React.createRef();
  const popupRef = React.createRef();
  const selected = [];
  let clicks = 0;
  await mount(
    el(Dropdown, {
      animated: false,
      contentProps: { ref: popupRef },
      items: [
        {
          closeOnSelect: false,
          id: "edit",
          label: "Edit",
          onSelect: () => selected.push("edit"),
          shortcut: "⌘E",
        },
        { id: "divider", type: "separator" },
        {
          id: "files",
          items: [
            {
              disabled: true,
              id: "locked",
              label: "Locked",
              onSelect: () => selected.push("locked"),
            },
            {
              id: "delete",
              label: "Delete",
              onSelect: () => selected.push("delete"),
              variant: "destructive",
            },
          ],
          label: "Files",
          type: "group",
        },
      ],
      modal: false,
      trigger: el(
        "button",
        {
          onClick: () => {
            clicks += 1;
          },
          type: "button",
        },
        "Actions"
      ),
      triggerProps: { ref },
    })
  );
  assert.equal(host.querySelectorAll("button").length, 1);
  await React.act(() => ref.current.click());
  assert.equal(clicks, 1);
  assert.equal(ref.current.getAttribute("aria-expanded"), "true");
  assert.equal(popupRef.current.getAttribute("role"), "menu");
  const items = [...popupRef.current.querySelectorAll('[role="menuitem"]')];
  assert.deepEqual(
    items.map((item) => item.textContent),
    ["Edit⌘E", "Locked", "Delete"]
  );
  const group = popupRef.current.querySelector(
    '[role="group"][aria-labelledby]'
  );
  assert.equal(
    document.querySelector(`[id="${group.getAttribute("aria-labelledby")}"]`)
      .textContent,
    "Files"
  );
  await React.act(() => items[1].click());
  assert.deepEqual(selected, []);
  await React.act(() => items[0].click());
  assert.deepEqual(selected, ["edit"]);
  assert.equal(ref.current.getAttribute("aria-expanded"), "true");
  await React.act(() => items[2].click());
  await React.act(frames);
  assert.deepEqual(selected, ["edit", "delete"]);
  assert.equal(ref.current.getAttribute("aria-expanded"), "false");
});

test("Dropdown controlled requests respect cancellation and Escape restores trigger focus", async () => {
  await ready;
  const { Dropdown } = load();
  const el = React.createElement;
  const triggerRef = React.createRef();
  let rejected = true;
  const changes = [];
  const App = () => {
    const [open, setOpen] = React.useState(false);
    return el(Dropdown, {
      animated: false,
      items: [{ id: "action", label: "Action" }],
      modal: false,
      onOpenChange: (next, details) => {
        changes.push(next);
        if (rejected) {
          details.cancel();
        } else {
          setOpen(next);
        }
      },
      open,
      trigger: el("button", { type: "button" }, "Open"),
      triggerProps: { ref: triggerRef },
    });
  };
  await mount(el(App));
  await React.act(() => triggerRef.current.click());
  assert.equal(triggerRef.current.getAttribute("aria-expanded"), "false");
  rejected = false;
  await React.act(() => triggerRef.current.click());
  const item = document.querySelector('[role="menuitem"]');
  rejected = true;
  await React.act(() =>
    item.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Escape",
      })
    )
  );
  assert.equal(triggerRef.current.getAttribute("aria-expanded"), "true");
  rejected = false;
  await React.act(() =>
    item.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Escape",
      })
    )
  );
  await React.act(frames);
  assert.equal(triggerRef.current.getAttribute("aria-expanded"), "false");
  assert.ok(
    document.activeElement === triggerRef.current,
    "Focus must return to the trigger"
  );
  assert.deepEqual(changes, [true, true, false, false]);
});

test("Dropdown nested data opens its own menu and submenu Escape leaves its parent open", async () => {
  await ready;
  const { Dropdown } = load();
  const el = React.createElement;
  const selections = [];
  await mount(
    el(Dropdown, {
      animated: false,
      items: [
        {
          id: "share",
          items: [
            {
              id: "team",
              label: "Team",
              onSelect: () => selections.push("team"),
            },
          ],
          label: "Share with",
          type: "submenu",
        },
      ],
      modal: false,
      trigger: el("button", { type: "button" }, "Share"),
    })
  );
  await React.act(() => host.querySelector("button").click());
  const trigger = document.querySelector('[data-slot="dropdown-sub-trigger"]');
  await React.act(() =>
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "ArrowRight",
      })
    )
  );
  await React.act(frames);
  assert.equal(document.querySelectorAll('[role="menu"][data-open]').length, 2);
  const team = [...document.querySelectorAll('[role="menuitem"]')].find(
    (item) => item.textContent === "Team"
  );
  await React.act(() =>
    team.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Escape",
      })
    )
  );
  await React.act(frames);
  assert.equal(document.querySelectorAll('[role="menu"][data-open]').length, 1);
  assert.deepEqual(selections, []);
  await React.act(() =>
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "ArrowRight",
      })
    )
  );
  await React.act(frames);
  await React.act(() =>
    [...document.querySelectorAll('[role="menuitem"]')]
      .find((item) => item.textContent === "Team")
      .click()
  );
  assert.deepEqual(selections, ["team"]);
  assert.equal(
    host.querySelector("button").getAttribute("aria-expanded"),
    "false"
  );
});

test("Dropdown native Motion retains external closing until completion and survives rapid reopening", async () => {
  await ready;
  const { Dropdown } = load();
  const el = React.createElement;
  const completions = [];
  const ref = React.createRef();
  const app = (open) =>
    el(Dropdown, {
      contentProps: { ref, render: el("section", { "data-consumer": "yes" }) },
      items: [{ id: "edit", label: "Edit" }],
      modal: false,
      onOpenChangeComplete: (next) => completions.push(next),
      open,
      trigger: el("button", { type: "button" }, "Actions"),
    });
  await mount(app(true));
  const popup = ref.current;
  assert.equal(popup.tagName, "SECTION");
  assert.equal(popup.dataset.consumer, "yes");
  assert.ok(
    popup
      .getAnimations()
      .some((animation) => animation.effect.getTiming().duration === 180)
  );
  await React.act(async () => {
    await frames();
    await finish();
  });
  await React.act(() => root.render(app(false)));
  assert.ok(
    ref.current === popup,
    "The popup ref must retain the same element"
  );
  assert.ok(
    popup
      .getAnimations()
      .some(
        (animation) =>
          animation.effect.getTiming().duration === 120 &&
          animation.playState === "running"
      )
  );
  await React.act(() => root.render(app(true)));
  await React.act(async () => {
    await frames();
    await finish();
  });
  assert.ok(ref.current === popup, "Reopening must retain the popup element");
  assert.equal(completions.includes(false), false);
  await React.act(() => root.render(app(false)));
  await React.act(async () => {
    await frames();
    await finish();
  });
  assert.ok(ref.current === null, "Completed closing must clear the popup ref");
  assert.deepEqual(completions, [true, true, false]);
});

test("Dropdown compound checkbox and radio items preserve settings and stay open by default", async () => {
  await ready;
  const d = load();
  const el = React.createElement;
  const App = () => {
    const [checked, setChecked] = React.useState(false);
    const [value, setValue] = React.useState("name");
    return el(
      d.DropdownRoot,
      { modal: false },
      el(d.DropdownTrigger, null, "Settings"),
      el(
        d.DropdownContent,
        { animated: false },
        el(
          d.DropdownGroup,
          null,
          el(
            d.DropdownCheckboxItem,
            { checked, onCheckedChange: setChecked },
            "Sidebar"
          )
        ),
        el(
          d.DropdownRadioGroup,
          { onValueChange: setValue, value },
          el(d.DropdownRadioItem, { value: "name" }, "Name"),
          el(
            d.DropdownRadioItem,
            { closeOnClick: false, value: "date" },
            "Date"
          )
        )
      )
    );
  };
  await mount(el(App));
  await React.act(() => host.querySelector("button").click());
  await React.act(() =>
    document.querySelector('[role="menuitemcheckbox"]').click()
  );
  assert.equal(
    document
      .querySelector('[role="menuitemcheckbox"]')
      .getAttribute("aria-checked"),
    "true"
  );
  await React.act(() =>
    [...document.querySelectorAll('[role="menuitemradio"]')]
      .find((item) => item.textContent === "Date")
      .click()
  );
  assert.equal(
    [...document.querySelectorAll('[role="menuitemradio"]')]
      .find((item) => item.textContent === "Date")
      .getAttribute("aria-checked"),
    "true"
  );
  assert.equal(
    host.querySelector("button").getAttribute("aria-expanded"),
    "true"
  );
});

test("Dropdown compound inset=false omits the attribute and inset=true enables it", async () => {
  await ready;
  const d = load();
  const el = React.createElement;
  await mount(
    el(
      d.DropdownRoot,
      { defaultOpen: true, modal: false },
      el(d.DropdownTrigger, null, "Open"),
      el(
        d.DropdownContent,
        { animated: false },
        el(
          d.DropdownGroup,
          null,
          el(d.DropdownLabel, { inset: false }, "Actions"),
          el(d.DropdownItem, { inset: false }, "Plain"),
          el(d.DropdownItem, { inset: true }, "Inset"),
          el(d.DropdownCheckboxItem, { inset: false }, "Checkbox"),
          el(
            d.DropdownRadioGroup,
            null,
            el(d.DropdownRadioItem, { inset: false, value: "name" }, "Name")
          )
        )
      )
    )
  );
  const inset = document.querySelectorAll("[data-inset]");
  assert.equal(inset.length, 1);
  assert.equal(inset[0].textContent, "Inset");
});

test("Dropdown compact links compose router props, refs and handlers onto one anchor", async () => {
  await ready;
  const { Dropdown } = load();
  const ref = React.createRef();
  let clicks = 0;
  const Link = ({ to, ...props }) =>
    React.createElement("a", { ...props, href: to });
  await mount(
    React.createElement(Dropdown, {
      animated: false,
      modal: false,
      trigger: React.createElement("button", { type: "button" }, "Open"),
      items: [
        {
          id: "docs",
          label: "Docs",
          link: React.createElement(Link, {
            to: "#docs",
            ref,
            target: "_blank",
            onClick: (event) => {
              clicks += 1;
              event.preventDefault();
            },
          }),
        },
      ],
    })
  );
  await React.act(() => host.querySelector("button").click());
  const link = document.querySelector('[role="menuitem"]');
  assert.equal(link.tagName, "A");
  assert.equal(link.getAttribute("href"), "#docs");
  assert.equal(link.getAttribute("target"), "_blank");
  assert.ok(
    ref.current === link,
    "The router ref must point to the menu anchor"
  );
  assert.ok(
    link.querySelector("a,button") === null,
    "Links must not nest interactive elements"
  );
  await React.act(() => link.click());
  assert.equal(clicks, 1);
  // Routers prevent native navigation while still allowing menu dismissal.
  assert.equal(
    host.querySelector("button").getAttribute("aria-expanded"),
    "false"
  );
});

test("Dropdown async success blocks duplicate and other actions, then closes", async () => {
  await ready;
  const { Dropdown } = load();
  let resolve;
  let calls = 0;
  let other = 0;
  const request = new Promise((done) => {
    resolve = done;
  });
  await mount(
    React.createElement(Dropdown, {
      animated: false,
      modal: false,
      trigger: React.createElement("button", { type: "button" }, "Open"),
      items: [
        {
          id: "logout",
          label: "Logout",
          closeOnSelect: "success",
          onSelect: () => {
            calls += 1;
            return request;
          },
        },
        {
          id: "other",
          label: "Other",
          onSelect: () => {
            other += 1;
          },
        },
      ],
    })
  );
  const trigger = host.querySelector("button");
  await React.act(() => trigger.click());
  const items = [...document.querySelectorAll('[role="menuitem"]')];
  await React.act(() => {
    items[0].click();
    items[0].click();
    items[1].click();
  });
  assert.equal(calls, 1);
  assert.equal(other, 0);
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(items[0].getAttribute("aria-busy"), "true");
  assert.equal(items[1].getAttribute("aria-disabled"), "true");
  await React.act(async () => {
    resolve();
    await request;
    await frames();
  });
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
});

test("Dropdown overlay survives popup unmount and waits for Motion exit before opening", async () => {
  await ready;
  const { Dropdown } = load();
  const { Dialog } = jiti("../registry/new-york/dialog.tsx");
  const ref = React.createRef();
  await mount(
    React.createElement(Dropdown, {
      modal: false,
      triggerProps: { ref },
      trigger: React.createElement("button", { type: "button" }, "Details"),
      items: [
        {
          id: "details",
          label: "Show details",
          renderOverlay: ({ finalFocus, ...props }) =>
            React.createElement(
              Dialog,
              { ...props, title: "Details", contentProps: { finalFocus } },
              "Persistent details"
            ),
        },
      ],
    })
  );
  await React.act(() => ref.current.click());
  await React.act(async () => {
    await frames();
    await finish();
  });
  await React.act(() => document.querySelector('[role="menuitem"]').click());
  assert.ok(
    document.querySelector('[role="dialog"][data-open]') === null,
    "The dialog must wait for menu closing"
  );
  await React.act(async () => {
    await frames();
    await finish();
    await frames();
  });
  const dialog = document.querySelector('[role="dialog"][data-open]');
  assert.ok(dialog);
  assert.ok(
    document.querySelector('[role="menu"]') === null,
    "The menu must unmount before the dialog opens"
  );
  assert.match(dialog.textContent, /Persistent details/);
  await React.act(() =>
    dialog.querySelector('[data-slot="dialog-close-button"]').click()
  );
  await React.act(async () => {
    for (const element of document.querySelectorAll(
      '[data-slot="dialog-content"], [data-slot="dialog-backdrop"]'
    )) {
      for (const animation of element.getAnimations()) {
        animation.finish();
      }
    }
    await frames();
  });
  // Do not ask Node assert to inspect entire happy-dom/React object graphs
  // when focus differs. Report a small identity failure instead.
  assert.ok(
    document.activeElement === ref.current,
    "Dialog focus must return to the menu trigger"
  );
});

test("Dropdown async failure releases pending, reports the error and permits retry", async () => {
  await ready;
  const { Dropdown } = load();
  const failures = [];
  let reject;
  let calls = 0;
  await mount(
    React.createElement(Dropdown, {
      animated: false,
      modal: false,
      trigger: React.createElement("button", { type: "button" }, "Open"),
      items: [
        {
          id: "save",
          label: "Save",
          closeOnSelect: "success",
          onSelect: () => {
            calls += 1;
            return new Promise((resolve, fail) => {
              reject = fail;
            });
          },
          onSelectError: (error) => failures.push(error.message),
        },
      ],
    })
  );
  await React.act(() => host.querySelector("button").click());
  await React.act(() => document.querySelector('[role="menuitem"]').click());
  await React.act(async () => {
    reject(new Error("Offline"));
  });
  assert.deepEqual(failures, ["Offline"]);
  const item = document.querySelector('[role="menuitem"]');
  assert.equal(item.hasAttribute("aria-busy"), false);
  assert.equal(item.getAttribute("aria-disabled"), null);
  assert.equal(
    host.querySelector("button").getAttribute("aria-expanded"),
    "true"
  );
  await React.act(() => item.click());
  assert.equal(calls, 2);
  await React.act(async () => {
    reject(new Error("Still offline"));
  });
  assert.deepEqual(failures, ["Offline", "Still offline"]);
});

test("Dropdown dismissed pending action remains locked after reopen without closing the new menu on success", async () => {
  await ready;
  const { Dropdown } = load();
  let resolve;
  let calls = 0;
  const request = new Promise((done) => {
    resolve = done;
  });
  await mount(
    React.createElement(Dropdown, {
      animated: false,
      modal: false,
      trigger: React.createElement("button", { type: "button" }, "Open"),
      items: [
        {
          id: "save",
          label: "Save",
          closeOnSelect: "success",
          onSelect: () => {
            calls += 1;
            return request;
          },
        },
      ],
    })
  );
  const trigger = host.querySelector("button");
  await React.act(() => trigger.click());
  await React.act(() => document.querySelector('[role="menuitem"]').click());
  await React.act(() =>
    document.querySelector('[role="menuitem"]').dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Escape",
      })
    )
  );
  await React.act(frames);
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  await React.act(() => trigger.click());
  const item = document.querySelector('[role="menuitem"]');
  assert.equal(item.getAttribute("aria-busy"), "true");
  await React.act(() => item.click());
  assert.equal(calls, 1);
  await React.act(async () => {
    resolve();
    await request;
  });
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(item.hasAttribute("aria-busy"), false);
});

test("Dropdown rejected overlay close requests never open the overlay", async () => {
  await ready;
  const { Dropdown } = load();
  await mount(
    React.createElement(Dropdown, {
      animated: false,
      modal: false,
      onOpenChange: (open, details) => {
        if (!open) {
          details.cancel();
        }
      },
      trigger: React.createElement("button", { type: "button" }, "Open"),
      items: [
        {
          id: "details",
          label: "Details",
          renderOverlay: ({ open }) =>
            open
              ? React.createElement("p", { "data-overlay": "open" }, "Details")
              : null,
        },
      ],
    })
  );
  await React.act(() => host.querySelector("button").click());
  await React.act(() => document.querySelector('[role="menuitem"]').click());
  await React.act(frames);
  assert.equal(
    host.querySelector("button").getAttribute("aria-expanded"),
    "true"
  );
  assert.ok(
    document.querySelector('[data-overlay="open"]') === null,
    "A canceled close must not open an overlay"
  );
});

test("Dropdown remains visible and closes immediately when native animations are unavailable", async () => {
  await ready;
  const { Dropdown } = load();
  const { animate } = HTMLElement.prototype;
  HTMLElement.prototype.animate = undefined;
  try {
    await mount(
      React.createElement(Dropdown, {
        items: [{ id: "action", label: "Action" }],
        modal: false,
        trigger: React.createElement("button", { type: "button" }, "Open"),
      })
    );
    await React.act(() => host.querySelector("button").click());
    const menu = document.querySelector('[role="menu"][data-open]');
    assert.equal(menu.style.opacity, "1");
    await React.act(() => menu.querySelector('[role="menuitem"]').click());
    await React.act(frames);
    assert.ok(
      document.querySelector('[role="menu"]') === null,
      "Closing must unmount content when animation is unavailable"
    );
  } finally {
    HTMLElement.prototype.animate = animate;
  }
});
