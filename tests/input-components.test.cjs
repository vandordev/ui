// DOM globals must exist before importing React DOM and registry components.
/* eslint-disable global-require */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let dom;
let React;
let createRoot;
let root;
let host;
let jiti;
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
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
  jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
})();

const mount = async (element) => {
  await ready;
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

test("Input floating label stays associated and elevated for a default value", async () => {
  await ready;
  const { Input } = jiti("../registry/new-york/input.tsx");
  await mount(
    React.createElement(Input, {
      defaultValue: "hello",
      label: "Name",
      name: "name",
    })
  );
  const input = document.querySelector('input[name="name"]');
  const label = document.querySelector("label");
  assert.ok(input);
  assert.equal(label.htmlFor, input.id);
  assert.equal(label.textContent, "Name");
  assert.equal(label.dataset.floating, "true");
});

test("InputOTP sanitizes values and announces completion only for changed user input", async () => {
  await ready;
  const { InputOTP } = jiti("../registry/new-york/input-otp.tsx");
  const values = [];
  const completed = [];
  await mount(
    React.createElement(InputOTP, {
      length: 4,
      onComplete: (value) => completed.push(value),
      onValueChange: (value) => values.push(value),
    })
  );
  const input = document.querySelector('input[autocomplete="one-time-code"]');
  assert.ok(input);
  await React.act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    ).set.call(input, "12a345");
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  assert.equal(input.value, "1234");
  assert.deepEqual(values, ["1234"]);
  assert.deepEqual(completed, ["1234"]);
  await React.act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  assert.deepEqual(completed, ["1234"]);
});

test("InputAmount displays separators but emits exact decimal text without prop-sync callbacks", async () => {
  await ready;
  const { InputAmount } = jiti("../registry/new-york/input-amount.tsx");
  const values = [];
  await mount(
    React.createElement(InputAmount, {
      decimalSeparator: ",",
      defaultValue: "1234.50",
      onValueChange: (value) => values.push(value),
      thousandSeparator: ".",
    })
  );
  const input = document.querySelector("input");
  assert.ok(input);
  assert.equal(input.value, "1.234,50");
  assert.deepEqual(values, []);
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;
  await React.act(async () => {
    setter.call(input, "2.345,67");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.deepEqual(values, ["2345.67"]);
});

test("InputSearch clear action emits an empty native change and restores input focus", async () => {
  await ready;
  const { InputSearch } = jiti("../registry/new-york/input-search.tsx");
  const values = [];
  await mount(
    React.createElement(InputSearch, {
      clearable: true,
      defaultValue: "calendar",
      label: "Search",
      onChange: (event) => values.push(event.currentTarget.value),
    })
  );
  const input = document.querySelector('input[type="search"]');
  const clear = document.querySelector('button[aria-label="Clear search"]');
  assert.ok(input);
  assert.ok(clear);
  await React.act(async () => clear.click());
  assert.equal(input.value, "");
  assert.equal(document.activeElement, input);
  assert.deepEqual(values, [""]);
});

test("InputPhone keeps a national draft and emits international digits without a plus sign", async () => {
  await ready;
  const { InputPhone } = jiti("../registry/new-york/input-phone.tsx");
  const values = [];
  await mount(
    React.createElement(InputPhone, {
      defaultCountry: "ID",
      label: "Phone number",
      onValueChange: (value) => values.push(value),
    })
  );
  const input = document.querySelector('input[type="tel"]');
  assert.ok(input);
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;
  await React.act(async () => {
    setter.call(input, "08123456789");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.ok(values.length > 0);
  assert.equal(values.at(-1), "628123456789");
  assert.equal(values.at(-1).startsWith("+"), false);
});

test("DateRangePicker applies a shortcut once and discards a cancelled draft", async () => {
  await ready;
  const { DateRangePicker } = jiti(
    "../registry/new-york/date-range-picker.tsx"
  );
  const changes = [];
  await mount(
    React.createElement(DateRangePicker, {
      defaultOpen: true,
      features: ["shortcuts"],
      label: "Range",
      now: () => new Date(2026, 9, 4),
      onValueChange: (range) => changes.push(range),
    })
  );
  const shortcut = [...document.querySelectorAll("button")].find(
    (button) => button.textContent === "Last 7 days"
  );
  assert.ok(shortcut);
  await React.act(async () => shortcut.click());
  assert.deepEqual(changes, []);
  const apply = [...document.querySelectorAll("button")].find(
    (button) => button.textContent === "Apply"
  );
  assert.ok(apply);
  assert.equal(apply.disabled, false);
  await React.act(async () => apply.click());
  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0], {
    from: new Date(2026, 8, 28),
    to: new Date(2026, 9, 4),
  });
});

test("date shortcuts cover complete Monday-based periods using local calendar days", async () => {
  await ready;
  const dateUtils = jiti("../registry/new-york/date-picker-utils.ts");
  const today = new Date(2026, 9, 4, 15, 30);
  assert.deepEqual(dateUtils.resolveDateShortcut("thisWeek", today), {
    from: new Date(2026, 8, 28),
    to: new Date(2026, 9, 4),
  });
  assert.deepEqual(dateUtils.resolveDateShortcut("last7Days", today), {
    from: new Date(2026, 8, 28),
    to: new Date(2026, 9, 4),
  });
  assert.equal(
    dateUtils.toLocalDateValue(new Date(2026, 0, 2, 23, 59)),
    "2026-01-02"
  );
});

test("date range validator rejects partial, reversed, and disabled-date ranges", async () => {
  await ready;
  const dateUtils = jiti("../registry/new-york/date-picker-utils.ts");
  const from = new Date(2026, 0, 1);
  const to = new Date(2026, 0, 3);
  assert.equal(dateUtils.isSelectableDateRange({ from }), false);
  assert.equal(dateUtils.isSelectableDateRange({ from: to, to: from }), false);
  assert.equal(
    dateUtils.isSelectableDateRange({ from, to }, [new Date(2026, 0, 2)]),
    false
  );
  assert.equal(dateUtils.isSelectableDateRange({ from, to }), true);
});

test("input family playground code follows configured values and safely serializes text", async () => {
  await ready;
  const playground = jiti("../lib/input-component-props.ts");
  const ts = require("typescript");
  const componentNames = Object.keys(playground.inputComponentProps);
  for (const component of componentNames) {
    const values = playground.getInputPlaygroundDefaults(component);
    const source = playground.getInputPlaygroundCode(component, values);
    const result = ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
      reportDiagnostics: true,
    });
    assert.deepEqual(
      result.diagnostics?.map((diagnostic) => diagnostic.code) ?? [],
      [],
      `${component} generated runnable TSX`
    );
    assert.match(source, /^"use client";/, `${component} client boundary`);
    assert.doesNotMatch(source, /@\/registry\/new-york\//);
  }

  const defaults = playground.getInputPlaygroundDefaults("input");
  assert.equal(defaults.label, "Full name");
  assert.equal(defaults.disabled, false);

  const code = playground.getInputPlaygroundCode("input", {
    ...defaults,
    label: `O'Neil \\ family`,
    placeholder: `Say "hello"`,
    disabled: true,
  });

  assert.match(code, /label=\{\\?"O'Neil/);
  assert.match(code, /Say \\\"hello\\\"/);
  assert.match(code, /disabled/);
  assert.match(code, /export function InputDemo/);
});

test("input family playground offers a typed preview contract for every registry item", async () => {
  await ready;
  const playground = jiti("../lib/input-component-props.ts");
  const components = [
    "input",
    "textarea",
    "input-group",
    "input-password",
    "input-search",
    "input-amount",
    "input-phone",
    "input-otp",
    "input-secret",
    "calendar",
    "date-picker",
    "date-range-picker",
    "popover",
  ];
  assert.deepEqual(
    Object.keys(playground.inputComponentProps).sort(),
    components.sort()
  );
  for (const component of components) {
    const definitions = playground.inputComponentProps[component];
    const values = playground.getInputPlaygroundDefaults(component);
    assert.ok(
      Object.values(definitions).some((definition) => definition.control)
    );
    assert.match(
      playground.getInputPlaygroundCode(component, values),
      /export function/
    );
  }
});

test("internal input refs are also delivered to consumer refs", async () => {
  await ready;
  const { InputSearch } = jiti("../registry/new-york/input-search.tsx");
  const { InputSecret } = jiti("../registry/new-york/input-secret.tsx");
  const { InputPhone } = jiti("../registry/new-york/input-phone.tsx");
  const received = {};
  await mount(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(InputSearch, {
        ref: (node) => (received.search = node),
        "aria-label": "Search",
      }),
      React.createElement(InputSecret, {
        ref: (node) => (received.secret = node),
        "aria-label": "Secret",
      }),
      React.createElement(InputPhone, {
        ref: (node) => (received.phone = node),
        "aria-label": "Phone",
      })
    )
  );
  assert.equal(received.search, document.querySelector('input[type="search"]'));
  assert.equal(
    received.secret,
    document.querySelector('input[type="password"]')
  );
  assert.equal(received.phone, document.querySelector('input[type="tel"]'));
});
