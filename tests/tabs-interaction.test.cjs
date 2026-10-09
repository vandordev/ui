/* eslint-disable global-require, require-await -- DOM globals precede react-dom; async act flushes React updates. */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { existsSync } = require("node:fs");
const { createJiti } = require("jiti");
let React, Tabs, createRoot, dom, host, root;
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
    "MouseEvent",
    "PointerEvent",
    "KeyboardEvent",
    "MutationObserver",
    "ResizeObserver",
    "Event",
    "EventTarget",
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
const mount = async (props) => {
  await ready;
  assert.ok(
    existsSync("registry/new-york/tabs.tsx"),
    "Public item-based Tabs must exist"
  );
  Tabs ??= createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/tabs.tsx").Tabs;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () =>
    root.render(
      React.createElement(Tabs, {
        animated: false,
        "aria-label": "Sections",
        ...props,
      })
    )
  );
};
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
const panelItems = () => [
  {
    content: React.createElement("input", {
      "aria-label": "Draft",
      defaultValue: "Original",
    }),
    label: "Overview",
    value: "overview",
  },
  { content: "Unavailable", disabled: true, label: "Locked", value: "locked" },
  { content: "Recent activity", label: "Activity", value: "activity" },
];

test("Tabs changes panels from one item declaration, preserves mounted drafts and prevents disabled selection", async () => {
  await ready;
  const changes = [];
  await mount({
    items: panelItems(),
    keepMounted: true,
    onValueChange: (value) => changes.push(value),
  });
  const buttons = host.querySelectorAll('[role="tab"]');
  const draft = host.querySelector("input");
  draft.value = "Unsaved";
  await React.act(async () => {
    buttons[0].focus();
    buttons[0].dispatchEvent(
      new dom.KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })
    );
  });
  assert.ok(
    document.activeElement === buttons[1],
    "Base UI keeps disabled tabs discoverable by keyboard"
  );
  await React.act(async () => buttons[1].click());
  assert.equal(buttons[1].getAttribute("aria-selected"), "false");
  await React.act(async () =>
    buttons[1].dispatchEvent(
      new dom.KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })
    )
  );
  assert.ok(
    document.activeElement === buttons[2],
    "ArrowRight must advance to the next tab"
  );
  assert.equal(
    buttons[0].getAttribute("aria-selected"),
    "true",
    "Manual focus must not select"
  );
  await React.act(async () => buttons[2].click());
  assert.equal(buttons[2].getAttribute("aria-selected"), "true");
  assert.equal(draft.closest('[role="tabpanel"]').hidden, true);
  await React.act(async () => buttons[0].click());
  assert.equal(host.querySelector("input").value, "Unsaved");
  assert.deepEqual(changes, ["activity", "overview"]);
});

test("Tabs controlled values and canceled changes never diverge from active panels", async () => {
  await ready;
  let calls = 0;
  await mount({
    items: panelItems(),
    onValueChange: (_, details) => {
      calls += 1;
      details.cancel();
    },
    value: "overview",
  });
  await React.act(async () => host.querySelectorAll('[role="tab"]')[2].click());
  assert.equal(calls, 1);
  assert.equal(
    host.querySelector('[aria-selected="true"]').textContent,
    "Overview"
  );
  await React.act(async () =>
    root.render(
      React.createElement(Tabs, {
        animated: false,
        "aria-label": "Sections",
        items: panelItems(),
        value: "activity",
      })
    )
  );
  assert.equal(
    host.querySelector('[aria-selected="true"]').textContent,
    "Activity"
  );
  assert.equal(
    host.querySelector('[role="tabpanel"]').textContent,
    "Recent activity"
  );
});

test("Tabs automatic focus activation selects panels and unmounted drafts reset", async () => {
  await ready;
  await mount({ activationMode: "automatic", items: panelItems() });
  const buttons = host.querySelectorAll('[role="tab"]');
  host.querySelector("input").value = "Unsaved";
  await React.act(async () => {
    buttons[0].focus();
    buttons[0].dispatchEvent(
      new dom.KeyboardEvent("keydown", { bubbles: true, key: "End" })
    );
  });
  assert.equal(buttons[2].getAttribute("aria-selected"), "true");
  assert.ok(
    host.querySelector("input") === null,
    "Inactive default panel must unmount"
  );
  await React.act(async () => buttons[0].click());
  assert.equal(host.querySelector("input").value, "Original");
});

test("Tabs preserves custom router link props, handlers and refs without local selection", async () => {
  await ready;
  const linkRef = React.createRef();
  const navRef = React.createRef();
  let clicks = 0;
  const RouterLink = ({ to, ...props }) =>
    React.createElement("a", { ...props, href: to });
  await mount({
    items: [
      {
        link: React.createElement(
          RouterLink,
          {
            className: "custom-link",
            "data-preload": "intent",
            onClick: (event) => {
              event.preventDefault();
              clicks += 1;
            },
            ref: linkRef,
            to: "/overview",
          },
          "Overview"
        ),
      },
      {
        active: true,
        link: React.createElement("a", { href: "/activity" }, "Activity"),
      },
    ],
    ref: navRef,
  });
  const links = host.querySelectorAll("a");
  assert.ok(
    navRef.current === host.querySelector("nav"),
    "Root ref must target nav"
  );
  assert.ok(
    linkRef.current === links[0],
    "Consumer link ref must remain intact"
  );
  assert.equal(links[0].getAttribute("href"), "/overview");
  assert.equal(links[0].dataset.preload, "intent");
  await React.act(async () => links[0].click());
  assert.equal(clicks, 1);
  assert.ok(
    links[0].getAttribute("aria-current") === null,
    "Click must not optimistically select a route"
  );
  assert.equal(links[1].getAttribute("aria-current"), "page");
  assert.ok(
    host.querySelector('[role="tab"]') === null,
    "Navigation must not invent tab semantics"
  );
});
