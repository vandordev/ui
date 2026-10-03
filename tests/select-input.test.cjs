// DOM globals must exist before importing React DOM and the component.
/* eslint-disable require-await, global-require */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let dom;
let React;
let createRoot;
let SelectInput;
let root;
let host;
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
  ({ SelectInput } = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/select.tsx"));
})();

const mount = async (props) => {
  await ready;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () =>
    root.render(
      React.createElement(SelectInput, {
        animated: false,
        "aria-label": "Fruit",
        defaultOpen: true,
        modal: false,
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

test("mixed data renders ordered options, accessible group headings and disabled items", async () => {
  await mount({
    contentProps: { "aria-label": "Fruit options" },
    data: [
      { label: "Apple", value: "apple" },
      { items: [], label: "Empty" },
      {
        items: [
          { label: "Mango", value: "mango" },
          { disabled: true, label: "Banana", value: "banana" },
        ],
        label: "Tropical",
      },
      { label: "Pear", value: "pear" },
    ],
  });
  const options = [...document.querySelectorAll('[role="option"]')];
  assert.deepEqual(
    options.map((option) => option.textContent),
    ["Apple", "Mango", "Banana", "Pear"]
  );
  assert.equal(options[2].getAttribute("aria-disabled"), "true");
  const heading = [
    ...document.querySelectorAll('[data-slot="select-label"]'),
  ].find((node) => node.textContent === "Tropical");
  assert.ok(heading);
  assert.equal(
    heading.parentElement.getAttribute("aria-labelledby"),
    heading.id
  );
  assert.ok(document.querySelector('[aria-label="Fruit options"]'));
});

test("custom item rendering retains selected labels and emits primitive values on selection", async () => {
  const changes = [];
  await mount({
    data: [
      { label: "Apple", value: "apple" },
      { label: "Mango", value: "mango" },
    ],
    onValueChange: (value, details) => changes.push([value, details.reason]),
    renderItem: (item) =>
      React.createElement("span", null, `${item.label} details`),
  });
  const option = [...document.querySelectorAll('[role="option"]')].find(
    (node) => node.textContent === "Mango details"
  );
  assert.ok(option);
  await React.act(async () => option.click());
  assert.deepEqual(changes, [["mango", "item-press"]]);
  assert.equal(
    document.querySelector('[role="combobox"]').textContent,
    "Mango"
  );
});
