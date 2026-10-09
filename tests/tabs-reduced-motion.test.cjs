/* eslint-disable global-require, require-await -- DOM globals precede Motion import; async act flushes state. */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");

test("Tabs reduced motion shows final panel opacity immediately and isolates active indicators", async () => {
  const { Window } = await import("happy-dom");
  const dom = new Window({
    settings: { device: { prefersReducedMotion: "reduce" } },
    url: "http://localhost",
  });
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLButtonElement",
    "Element",
    "Node",
    "MutationObserver",
    "ResizeObserver",
    "Event",
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
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const { Tabs } = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/tabs.tsx");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const items = [
    { content: "First content", label: "First", value: "first" },
    { content: "Second content", label: "Second", value: "second" },
  ];
  try {
    await React.act(async () =>
      root.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(Tabs, { "aria-label": "First group", items }),
          React.createElement(Tabs, {
            "aria-label": "Second group",
            items,
            variant: "segmented",
          })
        )
      )
    );
    const groups = host.querySelectorAll('[data-slot="tabs"]');
    const panelBefore = groups[0].querySelector('[role="tabpanel"]');
    assert.equal(panelBefore.firstElementChild.style.opacity, "1");
    await React.act(async () =>
      groups[0].querySelectorAll('[role="tab"]')[1].click()
    );
    assert.equal(
      groups[0].querySelector('[role="tabpanel"]').textContent,
      "Second content"
    );
    assert.equal(
      groups[0].querySelector('[role="tabpanel"]').firstElementChild.style
        .opacity,
      "1"
    );
    assert.equal(
      groups[1].querySelector('[aria-selected="true"]').textContent,
      "First"
    );
    assert.equal(
      groups[1].querySelector('[role="tabpanel"]').textContent,
      "First content"
    );
    assert.equal(
      host.querySelectorAll('[data-slot="tabs-indicator"]').length,
      2
    );
    for (const indicator of host.querySelectorAll(
      '[data-slot="tabs-indicator"]'
    )) {
      assert.ok(
        !/translate|scale/.test(indicator.style.transform),
        "Reduced motion must not start a positional transform"
      );
    }
    const ids = [
      ...host.querySelectorAll('[role="tab"], [role="tabpanel"]'),
    ].map((element) => element.id);
    assert.equal(new Set(ids).size, ids.length);
  } finally {
    await React.act(async () => root.unmount());
    host.remove();
    await dom.happyDOM.abort();
  }
});
