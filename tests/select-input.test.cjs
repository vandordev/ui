// DOM globals must exist before importing React DOM and the component.
/* eslint-disable require-await, global-require */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let dom;
let React;
let createRoot;
let Select;
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
  ({ Select } = createJiti(__filename, {
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
      React.createElement(Select, {
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

test("custom trigger element retains its content, ref, events and combobox semantics without nested buttons", async () => {
  await ready;
  const ref = React.createRef();
  const clicks = [];
  await mount({
    data: [{ label: "Apple", value: "apple" }],
    trigger: React.createElement(
      "button",
      { className: "custom-trigger", onClick: () => clicks.push("click") },
      "Choose fruit"
    ),
    triggerProps: { "aria-describedby": "help", ref },
  });
  const trigger = document.querySelector('[role="combobox"]');
  assert.equal(trigger.textContent, "Choose fruit");
  assert.equal(trigger.tagName, "BUTTON");
  assert.equal(trigger.querySelector("button"), null);
  assert.equal(trigger.querySelector("svg"), null);
  assert.equal(trigger.className, "custom-trigger");
  assert.equal(trigger.getAttribute("aria-label"), "Fruit");
  assert.equal(trigger.getAttribute("aria-describedby"), "help");
  assert.equal(ref.current, trigger);
  await React.act(async () => trigger.click());
  assert.deepEqual(clicks, ["click"]);
});

test("trigger callback follows uncontrolled selection without overriding the caller's change handler", async () => {
  await ready;
  const changes = [];
  const ref = React.createRef();
  await mount({
    data: [
      { label: "Zero", value: 0 },
      { label: "One", value: 1 },
    ],
    onValueChange: (value) => changes.push(value),
    placeholder: "Pick a number",
    trigger: ({ selectedLabel, placeholder, open }) =>
      React.createElement(
        "button",
        { "data-open": open },
        selectedLabel ?? placeholder
      ),
    triggerProps: { ref },
  });
  assert.equal(
    document.querySelector('[role="combobox"]').textContent,
    "Pick a number"
  );
  assert.equal(ref.current, document.querySelector('[role="combobox"]'));
  const option = [...document.querySelectorAll('[role="option"]')].find(
    (node) => node.textContent === "Zero"
  );
  await React.act(async () => option.click());
  const trigger = document.querySelector('[role="combobox"]');
  assert.equal(trigger.textContent, "Zero");
  assert.equal(trigger.dataset.open, "false");
  assert.deepEqual(changes, [0]);
});

test("custom callback trigger opens by keyboard and preserves disabled semantics", async () => {
  await ready;
  const props = {
    data: [{ label: "Apple", value: "apple" }],
    defaultOpen: false,
    modal: false,
    trigger: ({ disabled }) =>
      React.createElement(
        "button",
        { "data-disabled-state": disabled },
        "Choose"
      ),
  };
  await mount(props);
  const trigger = document.querySelector('[role="combobox"]');
  await React.act(async () => {
    trigger.focus();
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" })
    );
  });
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.ok(document.querySelector('[role="option"]'));
  await React.act(async () =>
    root.render(
      React.createElement(Select, {
        ...props,
        animated: false,
        "aria-label": "Fruit",
        disabled: true,
      })
    )
  );
  assert.equal(trigger.disabled, true);
  assert.equal(trigger.dataset.disabledState, "true");
});

test("trigger callback derives controlled multiple labels and reflects external changes", async () => {
  await ready;
  const props = {
    data: [
      { label: "Zero", value: 0 },
      { items: [{ label: "One", value: 1 }], label: "Numbers" },
    ],
    defaultOpen: true,
    modal: false,
    multiple: true,
    placeholder: "Choose",
    trigger: ({ selectedLabel, placeholder, value }) =>
      React.createElement(
        "button",
        { "data-count": value.length },
        selectedLabel ?? placeholder
      ),
    value: [0, 1],
  };
  await mount(props);
  assert.equal(
    document.querySelector('[role="combobox"]').textContent,
    "Zero, One"
  );
  await React.act(async () =>
    root.render(
      React.createElement(Select, {
        ...props,
        animated: false,
        "aria-label": "Fruit",
        value: [],
      })
    )
  );
  assert.equal(
    document.querySelector('[role="combobox"]').textContent,
    "Choose"
  );
  assert.equal(document.querySelector('[role="combobox"]').dataset.count, "0");
});
