/* eslint-disable global-require -- DOM globals must precede React DOM imports. */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let dom;
let React;
let createRoot;
let composeStories;
let jiti;
let root;
let host;
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({
    settings: { device: { prefersReducedMotion: "reduce" } },
    url: "http://localhost",
  });
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLTextAreaElement",
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
  ({ composeStories } = await import("@storybook/react"));
  jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
})();
const mount = async (name, scenario) => {
  await ready;
  const stories = composeStories(
    jiti(`../registry/new-york/${name}.stories.tsx`)
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(() => root.render(React.createElement(stories[scenario])));
};
const edit = async (value) => {
  const input = host.querySelector("input");
  const setter = Object.getOwnPropertyDescriptor(
    dom.HTMLInputElement.prototype,
    "value"
  ).set;
  await React.act(() => {
    setter.call(input, value);
    input.dispatchEvent(new dom.Event("input", { bubbles: true }));
  });
};
afterEach(async () => {
  if (root) {
    await React.act(() => root.unmount());
    root = null;
    host.remove();
  }
});
after(async () => {
  await ready;
  await dom.happyDOM.abort();
});

test("controlled Input story reflects native edits in its local output", async () => {
  await mount("input", "Controlled");
  await edit("Alex");
  assert.equal(host.querySelector("output").textContent, "Value: Alex");
});
test("controlled Search story clears its local query and keeps focus", async () => {
  await mount("input-search", "Controlled");
  await React.act(() =>
    host.querySelector('button[aria-label="Clear search"]').click()
  );
  assert.equal(host.querySelector("input").value, "");
  assert.equal(host.querySelector("output").textContent, "Query: empty");
  assert.ok(
    document.activeElement === host.querySelector("input"),
    "Clear must focus input"
  );
});
test("controlled OTP story announces completion and removes it after an incomplete edit", async () => {
  await mount("input-otp", "ControlledCompletion");
  await edit("123456");
  assert.equal(host.querySelector("output").textContent, "Value: 123456");
  assert.equal(
    host.querySelector('[role="status"]').textContent,
    "Code complete (demo only)."
  );
  await edit("123");
  assert.equal(
    host.querySelector('[role="status"]').textContent,
    "Enter a complete code."
  );
});
test("Input Group action submits the edited query using local state", async () => {
  await mount("input-group", "WithAction");
  await edit("tabs");
  await React.act(() => host.querySelector("button").click());
  assert.equal(
    host.querySelector('[role="status"]').textContent,
    "Submitted: tabs"
  );
});
