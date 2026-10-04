// Async act flushes Base UI effects; DOM globals must precede React DOM imports.
/* eslint-disable require-await, global-require */
const assert = require("node:assert/strict");
const { setTimeout: delay } = require("node:timers/promises");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
let React, createRoot, dom, host, popover, root;
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
  popover = jiti("../registry/new-york/popover.tsx");
})();
afterEach(async () => {
  if (root) {
    await React.act(async () => root.unmount());
    root = null;
    host.remove();
  }
});
after(async () => {
  await ready;
  await dom.happyDOM.abort();
});

test("Popover title and description label the popup; close cancellation and public refs survive motion composition", async () => {
  await ready;
  assert.equal(typeof popover.PopoverTitle, "function");
  const el = React.createElement;
  const ref = React.createRef();
  const triggerRef = React.createRef();
  const changes = [];
  let rejectClose = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () =>
    root.render(
      el(
        popover.Popover,
        {
          onOpenChange: (open, details) => {
            changes.push([open, details.reason]);
            if (!open && rejectClose) {
              details.cancel();
            }
          },
        },
        el(
          popover.PopoverTrigger,
          { id: "trigger", ref: triggerRef },
          "Details"
        ),
        el(
          popover.PopoverContent,
          {
            animated: false,
            id: "popup",
            ref,
            render: el("section", { "data-consumer": "yes" }),
          },
          el(
            popover.PopoverHeader,
            null,
            el(popover.PopoverTitle, null, "Workspace"),
            el(popover.PopoverDescription, null, "Manage access.")
          ),
          el(popover.PopoverClose, { id: "close" }, "Done")
        )
      )
    )
  );
  await React.act(async () => triggerRef.current.click());
  assert.equal(triggerRef.current.getAttribute("aria-expanded"), "true");
  assert.equal(ref.current.tagName, "SECTION");
  assert.equal(ref.current.dataset.consumer, "yes");
  assert.ok(ref.current.getAttribute("aria-labelledby"), ref.current.outerHTML);
  assert.equal(
    document.querySelector(
      `[id="${ref.current.getAttribute("aria-labelledby")}"]`
    ).textContent,
    "Workspace"
  );
  assert.equal(
    document.querySelector(
      `[id="${ref.current.getAttribute("aria-describedby")}"]`
    ).textContent,
    "Manage access."
  );
  await React.act(async () => document.querySelector("#close").click());
  assert.equal(triggerRef.current.getAttribute("aria-expanded"), "true");
  rejectClose = false;
  await React.act(async () => document.querySelector("#close").click());
  assert.equal(triggerRef.current.getAttribute("aria-expanded"), "false");
  assert.deepEqual(changes, [
    [true, "trigger-press"],
    [false, "close-press"],
    [false, "close-press"],
  ]);
});

test("Popover playground shares typed preview configuration with safe generated code", () => {
  const { getPopoverDefaults, getPopoverCode, getPopoverPreviewProps } = jiti(
    "../lib/popover-playground.ts"
  );
  const defaults = getPopoverDefaults();
  const values = {
    ...defaults,
    align: "end",
    animated: false,
    defaultOpen: true,
    disabled: true,
    side: "top",
    sideOffset: 12,
    title: 'Workspace "A" <team>',
  };
  assert.deepEqual(getPopoverPreviewProps(values), {
    content: { align: "end", animated: false, side: "top", sideOffset: 12 },
    root: { defaultOpen: true },
    trigger: { disabled: true },
  });
  const code = getPopoverCode(values);
  assert.ok(code.includes(JSON.stringify(values.title)));
  assert.ok(code.includes('side="top"'));
  assert.ok(code.includes('align="end"'));
  assert.ok(code.includes("sideOffset={12}"));
  assert.ok(code.includes("animated={false}"));
  assert.ok(code.includes("defaultOpen={true}"));
  assert.ok(code.includes("disabled={true}"));
  assert.equal(defaults.defaultOpen, false);
  assert.equal(defaults.animated, true);
});

test("controlled Popover waits for the parent, preserves trigger handlers, and Escape requests dismissal", async () => {
  await ready;
  const el = React.createElement;
  const ref = React.createRef();
  let clicks = 0;
  const changes = [];
  const app = (open) =>
    el(
      popover.Popover,
      {
        onOpenChange: (next, details) => changes.push([next, details.reason]),
        open,
      },
      el(
        popover.PopoverTrigger,
        {
          id: "trigger",
          onClick: () => {
            clicks += 1;
          },
        },
        "Open"
      ),
      el(
        popover.PopoverContent,
        { animated: false, ref },
        el(popover.PopoverTitle, null, "Controlled")
      )
    );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () => root.render(app(false)));
  await React.act(async () => document.querySelector("#trigger").click());
  assert.equal(clicks, 1);
  assert.equal(ref.current, null);
  assert.deepEqual(changes, [[true, "trigger-press"]]);
  await React.act(async () => root.render(app(true)));
  assert.ok(ref.current);
  await React.act(async () =>
    ref.current.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
    )
  );
  assert.deepEqual(changes.at(-1), [false, "escape-key"]);
  assert.equal(
    document.querySelector("#trigger").getAttribute("aria-expanded"),
    "true"
  );
  await React.act(async () => root.render(app(false)));
  assert.equal(ref.current, null);
});

test("Motion retains a closing popup until exit finishes and an interrupted close can reopen", async () => {
  await ready;
  const el = React.createElement;
  const ref = React.createRef();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () =>
    root.render(
      el(
        popover.Popover,
        null,
        el(popover.PopoverTrigger, { id: "trigger" }, "Open"),
        el(
          popover.PopoverContent,
          { ref },
          el(popover.PopoverTitle, null, "Animated"),
          el(popover.PopoverClose, { id: "close" }, "Close")
        )
      )
    )
  );
  await React.act(async () => document.querySelector("#trigger").click());
  await React.act(async () => delay(220));
  const popup = ref.current;
  assert.equal(
    Number(popup.style.opacity),
    1,
    "opening reaches its visible Motion target"
  );
  await React.act(async () => document.querySelector("#close").click());
  assert.equal(ref.current, popup, "exit keeps the popup mounted");
  await React.act(async () => document.querySelector("#trigger").click());
  await React.act(async () => delay(220));
  assert.equal(
    ref.current,
    popup,
    "stale exit completion must not unmount a reopened popup"
  );
  await React.act(async () => document.querySelector("#close").click());
  await React.act(async () => delay(180));
  assert.equal(ref.current, null, "finished exit releases the portal");
});

test("externally controlled closing retains the popup until its Motion exit completes", async () => {
  await ready;
  const el = React.createElement;
  const ref = React.createRef();
  const app = (open) =>
    el(
      popover.Popover,
      { open },
      el(popover.PopoverTrigger, null, "Open"),
      el(
        popover.PopoverContent,
        { ref },
        el(popover.PopoverTitle, null, "External")
      )
    );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () => root.render(app(true)));
  await React.act(async () => delay(220));
  const popup = ref.current;
  await React.act(async () => root.render(app(false)));
  assert.equal(
    ref.current,
    popup,
    "external prop changes also preserve exit motion"
  );
  await React.act(async () => delay(180));
  assert.equal(ref.current, null);
});

test("Popover playground resets changed configuration and transient opening", async () => {
  await ready;
  const { PopoverPlayground } = jiti("../components/popover-playground.tsx");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () =>
    root.render(React.createElement(PopoverPlayground))
  );
  const control = (suffix) => host.querySelector(`[id$="-${suffix}"]`);
  await React.act(async () => control("animated").click());
  assert.ok(host.textContent.includes("animated={false}"));
  await React.act(async () => control("defaultOpen").click());
  assert.equal(
    host
      .querySelector('[data-slot="popover-trigger"]')
      .getAttribute("aria-expanded"),
    "true"
  );
  assert.ok(host.textContent.includes("defaultOpen={true}"));
  await React.act(async () => control("disabled").click());
  assert.equal(
    host.querySelector('[data-slot="popover-trigger"]').disabled,
    true
  );
  assert.ok(host.textContent.includes("disabled={true}"));
  await React.act(async () =>
    [...host.querySelectorAll("button")]
      .find((button) => button.textContent.trim() === "Reset")
      .click()
  );
  assert.equal(control("animated").getAttribute("aria-checked"), "true");
  assert.equal(control("defaultOpen").getAttribute("aria-checked"), "false");
  assert.equal(
    host.querySelector('[data-slot="popover-trigger"]').disabled,
    false
  );
  assert.equal(
    host
      .querySelector('[data-slot="popover-trigger"]')
      .getAttribute("aria-expanded"),
    "false"
  );
  assert.ok(host.textContent.includes("animated={true}"));
  const select = async (suffix, value) => {
    await React.act(async () => control(suffix).click());
    const option = [...document.querySelectorAll('[role="option"]')].find(
      (item) => item.textContent.trim() === value
    );
    assert.ok(option, value);
    await React.act(async () => option.click());
  };
  await select("align", "end");
  await select("side", "top");
  assert.ok(host.textContent.includes('align="end"'));
  assert.ok(host.textContent.includes('side="top"'));
  const setInput = async (suffix, value) => {
    await React.act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      ).set.call(control(suffix), value);
      control(suffix).dispatchEvent(new Event("input", { bubbles: true }));
      control(suffix).dispatchEvent(new Event("change", { bubbles: true }));
    });
  };
  await setInput("title", 'Access "A"');
  await setInput("sideOffset", "12");
  assert.ok(host.textContent.includes('Access \\"A\\"'));
  assert.ok(host.textContent.includes("sideOffset={12}"));
  await React.act(async () =>
    host.querySelector('[data-slot="popover-trigger"]').click()
  );
  const popup = document.querySelector('[data-slot="popover-content"]');
  assert.equal(popup.dataset.align, "end");
  assert.equal(popup.dataset.side, "top");
  assert.equal(
    popup.querySelector('[data-slot="popover-title"]').textContent,
    'Access "A"'
  );
});
