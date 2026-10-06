/* eslint-disable global-require, require-await -- DOM globals precede client imports; React act flushes async updates. */
const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");

test("StatsCard reduced motion renders targets immediately without intermediate frames", async () => {
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
    "SVGElement",
    "Element",
    "Node",
    "Event",
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
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const { Activity } = require("lucide-react");
  const { StatsCard } = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/stats-card.tsx");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    for (const target of [125_000, -125_000, 0, null]) {
      await React.act(async () =>
        root.render(
          React.createElement(StatsCard, {
            ariaLabel: "Balance",
            items: [
              {
                icon: Activity,
                key: "balance",
                title: "Balance",
                value: { target },
              },
            ],
          })
        )
      );
      assert.equal(
        host.querySelector("dd").textContent,
        target === null ? "—" : target.toLocaleString("id-ID")
      );
      assert.ok(
        host.querySelector('dd [aria-hidden="true"]') === null,
        "Reduced motion must render a static final value"
      );
    }
  } finally {
    await React.act(async () => root.unmount());
    host.remove();
    await dom.happyDOM.abort();
  }
});
