/* eslint-disable require-await, global-require, no-loop-func -- React act async scope flushes updates; DOM globals must exist before importing react-dom. */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let Checkbox, React, createRoot, dom, host, root;
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
  ({ Checkbox } = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/checkbox.tsx"));
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
    root = null;
    host.remove();
  }
});
after(async () => {
  await ready;
  await dom.happyDOM.abort();
});

test("Checkbox toggles with clicks and Space, submits native values, and forwards both refs", async () => {
  await ready;
  const inputRef = React.createRef();
  const ref = React.createRef();
  const changes = [];
  let clicks = 0;
  await mount(
    React.createElement(
      "form",
      null,
      React.createElement(Checkbox, {
        animated: false,
        "aria-label": "Updates",
        defaultChecked: true,
        inputRef,
        name: "updates",
        onCheckedChange: (value) => changes.push(value),
        onClick: () => {
          clicks += 1;
        },
        ref,
        value: "weekly",
      })
    )
  );
  const form = host.querySelector("form");
  const control = host.querySelector('[role="checkbox"]');
  assert.equal(ref.current, control);
  assert.equal(inputRef.current.type, "checkbox");
  assert.equal(new dom.FormData(form).get("updates"), "weekly");
  await React.act(async () => control.click());
  assert.equal(control.getAttribute("aria-checked"), "false");
  assert.equal(new dom.FormData(form).get("updates"), null);
  await React.act(async () => {
    control.dispatchEvent(
      new dom.KeyboardEvent("keydown", { bubbles: true, key: " " })
    );
    control.dispatchEvent(
      new dom.KeyboardEvent("keyup", { bubbles: true, key: " " })
    );
  });
  assert.equal(control.getAttribute("aria-checked"), "true");
  assert.deepEqual(changes, [false, true]);
  assert.ok(clicks >= 1);
  await React.act(async () => ref.current.focus());
  assert.equal(document.activeElement, control);
});

test("Checkbox controlled form reset restores the public state and submitted value", async () => {
  await ready;
  const Demo = () => {
    const [checked, setChecked] = React.useState(true);
    return React.createElement(
      "form",
      { onReset: () => setChecked(true) },
      React.createElement(Checkbox, {
        animated: false,
        "aria-label": "Updates",
        checked,
        name: "updates",
        onCheckedChange: setChecked,
        value: "weekly",
      })
    );
  };
  await mount(React.createElement(Demo));
  const form = host.querySelector("form");
  const control = host.querySelector('[role="checkbox"]');
  await React.act(async () => control.click());
  assert.equal(control.getAttribute("aria-checked"), "false");
  await React.act(async () => form.reset());
  assert.equal(control.getAttribute("aria-checked"), "true");
  assert.equal(new dom.FormData(form).get("updates"), "weekly");
});

test("Checkbox respects rejected callbacks, disabled and read-only changes", async () => {
  await ready;
  for (const kind of ["canceled", "disabled", "readOnly"]) {
    let callbacks = 0;
    const props = {
      animated: false,
      "aria-label": kind,
      defaultChecked: true,
      onCheckedChange: (_, details) => {
        callbacks += 1;
        details.cancel();
      },
      ...(kind === "canceled" ? {} : { [kind]: true }),
    };
    await mount(React.createElement(Checkbox, props));
    const control = host.querySelector('[role="checkbox"]');
    await React.act(async () => control.click());
    assert.equal(control.getAttribute("aria-checked"), "true", kind);
    assert.equal(callbacks, kind === "canceled" ? 1 : 0, kind);
    await React.act(async () => root.unmount());
    root = null;
    host.remove();
  }
});
