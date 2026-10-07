/* eslint-disable require-await, global-require, no-loop-func -- Serial parameterized tests share a cleaned-up DOM; globals precede React DOM imports. */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let React, Switch, createRoot, dom, host, root;
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
  ({ Switch } = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/switch.tsx"));
})();
const mount = async (props, formProps = {}) => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () =>
    root.render(
      React.createElement(
        "form",
        formProps,
        React.createElement(Switch, {
          animated: false,
          "aria-label": "Updates",
          ...props,
        })
      )
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

test("Switch toggles by click and Space, submits both values, and forwards refs and handlers", async () => {
  await ready;
  const ref = React.createRef();
  const inputRef = React.createRef();
  const changes = [];
  let clicks = 0;
  await mount({
    defaultChecked: true,
    inputRef,
    name: "updates",
    onCheckedChange: (value) => changes.push(value),
    onClick: () => {
      clicks += 1;
    },
    ref,
    uncheckedValue: "off",
    value: "weekly",
  });
  const control = host.querySelector('[role="switch"]');
  const form = host.querySelector("form");
  assert.ok(ref.current === control, "Ref must target the visible switch");
  assert.equal(inputRef.current.type, "checkbox");
  assert.equal(new dom.FormData(form).get("updates"), "weekly");
  await React.act(async () => control.click());
  assert.equal(control.getAttribute("aria-checked"), "false");
  assert.equal(new dom.FormData(form).get("updates"), "off");
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
  assert.ok(document.activeElement === control, "Ref must focus the switch");
});

for (const kind of ["canceled", "disabled", "readOnly"]) {
  test(`Switch prevents ${kind} state changes`, async () => {
    await ready;
    let callbacks = 0;
    await mount({
      defaultChecked: true,
      name: "updates",
      onCheckedChange: (_, details) => {
        callbacks += 1;
        details.cancel();
      },
      value: "weekly",
      ...(kind === "canceled" ? {} : { [kind]: true }),
    });
    const control = host.querySelector('[role="switch"]');
    await React.act(async () => control.click());
    assert.equal(control.getAttribute("aria-checked"), "true");
    assert.equal(callbacks, kind === "canceled" ? 1 : 0);
    assert.equal(
      new dom.FormData(host.querySelector("form")).get("updates"),
      kind === "disabled" ? null : "weekly"
    );
  });
}

test("Switch controlled form example resets state and submitted value", async () => {
  await ready;
  const { SwitchForm } = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../examples/switch-form.tsx");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () => root.render(React.createElement(SwitchForm)));
  const form = host.querySelector("form");
  const control = host.querySelector('[role="switch"]');
  // Happy DOM activates enclosing labels before React's delegated preventDefault.
  // Exercise the real native input here; root click/Space are covered separately.
  await React.act(async () =>
    host.querySelector('input[type="checkbox"]').click()
  );
  assert.equal(control.getAttribute("aria-checked"), "false");
  assert.equal(new dom.FormData(form).get("updates"), "off");
  await React.act(async () => form.reset());
  assert.equal(control.getAttribute("aria-checked"), "true");
  assert.equal(new dom.FormData(form).get("updates"), "weekly");
});
