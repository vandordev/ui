/* eslint-disable global-require, require-await */
const assert = require("node:assert/strict");
const test = require("node:test");
const { createJiti } = require("jiti");

test("Tooltip reduced motion opens at its final scale and closes without retaining an exit", async () => {
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
    "NodeFilter",
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
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const tooltip = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/tooltip.tsx");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const ref = React.createRef();
  const el = React.createElement;
  const app = (open) =>
    el(
      tooltip.Tooltip,
      { open, triggerId: "save" },
      el(tooltip.TooltipTrigger, { id: "save" }, "Save"),
      el(tooltip.TooltipContent, { ref }, "Save changes")
    );
  try {
    await React.act(async () => root.render(app(true)));
    assert.ok(ref.current, "Reduced motion must render the tooltip");
    assert.equal(Number(ref.current.style.opacity), 1);
    assert.ok(
      !/scale\(|translate[XY]\(/.test(ref.current.style.transform),
      "Reduced motion must not begin with scale or directional movement"
    );
    await React.act(async () => root.render(app(false)));
    assert.ok(
      ref.current === null,
      "Reduced motion must not retain an animated exit"
    );
  } finally {
    await React.act(async () => root.unmount());
    host.remove();
    await dom.happyDOM.abort();
  }
});
