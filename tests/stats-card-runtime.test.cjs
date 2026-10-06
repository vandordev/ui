/* eslint-disable global-require, require-await -- DOM globals precede client imports; React act flushes async updates. */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");
const { setTimeout: delay } = require("node:timers/promises");

let Activity, React, StatsCard, createRoot, dom, host, root;
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
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
  React = require("react");
  ({ createRoot } = require("react-dom/client"));
  ({ Activity } = require("lucide-react"));
  ({ StatsCard } = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/stats-card.tsx"));
})();
const render = async (value) => {
  if (!root) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  }
  await React.act(async () =>
    root.render(
      React.createElement(StatsCard, {
        ariaLabel: "Live summary",
        items: [{ icon: Activity, key: "count", title: "Count", value }],
      })
    )
  );
};
const wait = () => delay(1400);
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

test("StatsCard interrupts transitions, announces final values, changes format, and switches modes", async () => {
  await ready;
  await render({ target: 100 });
  assert.equal(host.querySelector(".sr-only").textContent, "100");
  assert.ok(
    host.querySelector('dd [aria-hidden="true"]') !== null,
    "Numeric animation must hide intermediate frames from assistive technology"
  );
  await render({ target: -25 });
  assert.equal(host.querySelector(".sr-only").textContent, "-25");
  await React.act(async () => wait());
  assert.equal(
    host.querySelector('dd [aria-hidden="true"]').textContent,
    "-25"
  );
  await render({ format: (value) => `${Math.round(value)}%`, target: -25 });
  await React.act(async () => delay(50));
  assert.equal(
    host.querySelector('dd [aria-hidden="true"]').textContent,
    "-25%"
  );
  await render({ target: null });
  assert.equal(host.querySelector("dd").textContent, "—");
  await render({ display: "Rp9.007.199.254.740.993" });
  assert.equal(host.querySelector("dd").textContent, "Rp9.007.199.254.740.993");
  await render({ target: 42 });
  await React.act(async () => wait());
  assert.equal(host.querySelector('dd [aria-hidden="true"]').textContent, "42");
});
