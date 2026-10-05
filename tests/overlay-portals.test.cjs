// Node tests run sequentially with one shared DOM/root; loop cases use const bindings.
/* eslint-disable require-await, global-require, no-loop-func */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let React, components, createRoot, dom, host, root;
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
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
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  components = Object.assign(
    {},
    ...[
      "dialog",
      "drawer",
      "popover",
      "select",
      "date-picker",
      "date-range-picker",
    ].map((name) => jiti(`../registry/new-york/${name}.tsx`))
  );
})();
const mount = async (element) => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () => root.render(element));
};
afterEach(async () => {
  if (root) {
    await React.act(async () => root.unmount());
    host.remove();
    root = null;
  }
  document.body.removeAttribute("style");
});
after(async () => {
  await ready;
  await dom.happyDOM.abort();
});
const inFlow = (parent) =>
  [...parent.children].flatMap((child) => {
    const style = getComputedStyle(child);
    if (style.display === "contents") {
      return inFlow(child);
    }
    return ["absolute", "fixed"].includes(style.position) ||
      style.display === "none"
      ? []
      : [child];
  });
const settle = async () => {
  for (let index = 0; index < 4; index += 1) {
    await React.act(async () => {
      for (const node of document.querySelectorAll("*")) {
        for (const animation of node.getAnimations()) {
          animation.finish();
        }
      }
      // Base UI settles focus/unmount on actual frames.
      // eslint-disable-next-line promise/avoid-new
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
    });
  }
};
const assertFlow = (parent, expected) => {
  const actual = inFlow(parent);
  assert.equal(
    actual.length,
    expected.length,
    "portal must not add a layout item"
  );
  assert.ok(actual.every((node, index) => node === expected[index]));
};

// A static portal wrapper adds an empty flex/grid item, even with fixed children.
for (const name of ["Dialog", "Drawer"]) {
  for (const layout of ["flex", "grid"]) {
    for (const modal of [true, false, "trap-focus"]) {
      for (const keepMounted of [false, true]) {
        test(`${name} preserves ${layout} items through open/close (modal=${modal}, keepMounted=${keepMounted})`, async () => {
          await ready;
          const el = React.createElement;
          await mount(
            el(
              "div",
              { id: "layout", style: { display: layout, gap: "12px" } },
              el(
                components[name],
                {
                  contentProps: { keepMounted },
                  modal,
                  title: name,
                  trigger: el(
                    "button",
                    { id: "opener", type: "button" },
                    "Open"
                  ),
                },
                "Content"
              ),
              el("output", { id: "value" }, "Current value")
            )
          );
          const container = document.querySelector("#layout");
          const expected = [
            document.querySelector("#opener"),
            document.querySelector("#value"),
          ];
          assertFlow(container, expected);
          await React.act(async () => expected[0].click());
          assertFlow(container, expected);
          await settle();
          await React.act(async () =>
            document
              .querySelector(`[data-slot="${name.toLowerCase()}-close-button"]`)
              .click()
          );
          assertFlow(container, expected);
          await settle();
          assertFlow(container, expected);
          assert.equal(
            document.querySelectorAll('[role="dialog"][data-open]').length,
            0
          );
          assert.equal(document.activeElement, expected[0]);
        });
      }
    }
  }
}

for (const name of ["Popover", "Select", "DatePicker", "DateRangePicker"]) {
  for (const layout of ["flex", "grid"]) {
    test(`${name} adds no normal-flow item to a ${layout} body`, async () => {
      await ready;
      const el = React.createElement;
      document.body.style.display = layout;
      document.body.style.gap = "12px";
      let element;
      if (name === "Popover") {
        element = el(
          components.Popover,
          null,
          el(components.PopoverTrigger, {
            render: el("button", { type: "button" }, "Open"),
          }),
          el(components.PopoverContent, { animated: false }, "Content")
        );
      } else if (name === "Select") {
        element = el(components.Select, {
          animated: false,
          "aria-label": "Choice",
          data: [{ label: "One", value: "one" }],
        });
      } else {
        element = el(components[name], { label: "Date", motion: false });
      }
      await mount(element);
      assertFlow(document.body, [host]);
      await React.act(async () => host.querySelector("button").click());
      assert.ok(document.querySelector("[data-base-ui-portal]"));
      assertFlow(document.body, [host]);
      await React.act(async () =>
        document.activeElement.dispatchEvent(
          new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
        )
      );
      assertFlow(document.body, [host]);
      await settle();
      assertFlow(document.body, [host]);
    });
  }
}

// Reintroducing a per-panel portal host traps children in a transformed ancestor.
for (const [outerName, innerName] of [
  ["Drawer", "Drawer"],
  ["Dialog", "Drawer"],
  ["Drawer", "Dialog"],
  ["Dialog", "Dialog"],
]) {
  test(`${outerName} > ${innerName} escapes the parent panel and preserves theme and focus`, async () => {
    await ready;
    const el = React.createElement;
    let blockDismissal = true;
    await mount(
      el(
        "div",
        { className: "dark", id: "theme", style: { "--background": "red" } },
        el(
          components[outerName],
          { defaultOpen: true, title: "Parent" },
          el(
            components[`${outerName}Body`],
            null,
            el(
              components[innerName],
              {
                onOpenChange: (open, details) => {
                  if (!open && blockDismissal) {
                    details.cancel();
                  }
                },
                title: "Child",
                trigger: el(
                  "button",
                  { id: "child-trigger", type: "button" },
                  "Child"
                ),
              },
              "Child content"
            )
          )
        )
      )
    );
    await settle();
    const parent = document.querySelector('[role="dialog"]');
    const trigger = document.querySelector("#child-trigger");
    assert.ok(parent.contains(trigger));
    await React.act(async () => trigger.click());
    await settle();
    const child = [
      ...document.querySelectorAll('[role="dialog"][data-open]'),
    ].find((node) => node !== parent);
    assert.ok(child);
    assert.equal(
      parent.contains(child),
      false,
      "child must escape scaled/clipping panel"
    );
    assert.ok(child.closest("#theme"), "portal remains inside the outer theme");
    assert.ok(
      child.closest("[data-base-ui-portal]").parentElement ===
        parent.closest("[data-base-ui-portal]").parentElement
    );
    const pressEscape = async () =>
      React.act(async () =>
        child.dispatchEvent(
          new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            key: "Escape",
          })
        )
      );
    await pressEscape();
    assert.equal(
      document.querySelectorAll('[role="dialog"][data-open]').length,
      2,
      "cancelled dismissal preserves both panels"
    );
    blockDismissal = false;
    await pressEscape();
    await settle();
    assert.equal(
      document.querySelectorAll('[role="dialog"][data-open]').length,
      1
    );
    assert.equal(document.activeElement, trigger);
  });
}

test("three mixed levels share their own outer theme host without capturing sibling panels", async () => {
  await ready;
  const el = React.createElement;
  await mount(
    el(
      "div",
      null,
      el(
        "section",
        { className: "dark", id: "first-theme" },
        el(
          components.Drawer,
          { defaultOpen: true, title: "Outer" },
          el(
            components.Dialog,
            { defaultOpen: true, title: "Middle" },
            el(
              components.Drawer,
              { defaultOpen: true, title: "Inner" },
              "Deep content"
            )
          )
        )
      ),
      el(
        "section",
        { id: "second-theme" },
        el(
          components.Dialog,
          { defaultOpen: true, title: "Sibling" },
          "Separate content"
        )
      )
    )
  );
  const popups = [...document.querySelectorAll('[role="dialog"]')];
  assert.equal(popups.length, 4);
  const first = document.querySelector("#first-theme");
  const nested = popups.filter((node) => first.contains(node));
  assert.equal(nested.length, 3);
  const sharedHost = nested[0].closest("[data-base-ui-portal]").parentElement;
  assert.ok(
    nested.every(
      (node) =>
        node.closest("[data-base-ui-portal]").parentElement === sharedHost
    )
  );
  assert.ok(
    nested.every(
      (node) => !nested.some((other) => other !== node && other.contains(node))
    )
  );
  const sibling = popups.find((node) => !first.contains(node));
  assert.ok(sibling.closest("#second-theme"));
  assert.ok(
    sibling.closest("[data-base-ui-portal]").parentElement !== sharedHost
  );
});

test("Drawer and Select portable stories compose and Controls affect installed public components", async () => {
  await ready;
  const { composeStories } = await import("@storybook/react");
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  await mount(null);
  for (const name of ["drawer", "select"]) {
    const stories = composeStories(
      jiti(`../registry/new-york/${name}.stories.tsx`)
    );
    for (const [storyName, Story] of Object.entries(stories)) {
      await React.act(async () => root.render(React.createElement(Story)));
      const trigger = host.querySelector("button");
      assert.ok(trigger, `${name}/${storyName} renders a trigger`);
      if (!trigger.disabled) {
        await React.act(async () => trigger.click());
        assert.ok(
          document.querySelector('[role="dialog"], [role="listbox"]'),
          `${name}/${storyName} opens`
        );
      }
      await React.act(async () => root.render(null));
    }
    const props =
      name === "drawer"
        ? { keepMounted: true, swipeDirection: "left", title: "Consumer title" }
        : { animated: false, placeholder: "Consumer placeholder", size: "sm" };
    await React.act(async () =>
      root.render(React.createElement(stories.Playground, props))
    );
    await React.act(async () => host.querySelector("button").click());
    if (name === "drawer") {
      assert.equal(
        document.querySelector('[data-slot="drawer-title"]').textContent,
        "Consumer title"
      );
      assert.equal(
        document.querySelector('[data-slot="drawer-popup"]').dataset
          .swipeDirection,
        "left"
      );
    } else {
      assert.equal(host.querySelector("button").dataset.size, "sm");
      assert.ok(host.textContent.includes("Consumer placeholder"));
    }
    await React.act(async () => root.render(null));
  }
});
