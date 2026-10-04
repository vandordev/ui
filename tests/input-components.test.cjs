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
  // DOM-only behavior checks run without animation; browser checks cover motion.
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
  await React.act(() => root.render(element));
};

const buttonByText = (text) =>
  [...document.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === text
  );

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

test("DatePicker opens at the selected month and commits once through the new Popover", async () => {
  await ready;
  const { DatePicker } = jiti("../registry/new-york/date-picker.tsx");
  const changes = [];
  await mount(
    React.createElement(DatePicker, {
      defaultOpen: true,
      defaultValue: new Date(2025, 1, 12),
      label: "Appointment",
      motion: false,
      onValueChange: (next) => changes.push(next),
    })
  );
  const popup = document.querySelector('[data-slot="popover-content"]');
  assert.ok(popup.querySelector('button[data-day="2025-02-12"]'));
  assert.equal(
    popup.getAttribute("aria-labelledby"),
    popup.querySelector('[data-slot="popover-title"]').id
  );
  await React.act(() =>
    popup.querySelector('button[data-day="2025-02-14"]').click()
  );
  assert.equal(changes.length, 1);
  assert.equal(changes[0].getDate(), 14);
  assert.equal(
    host
      .querySelector('[data-slot="popover-trigger"]')
      .getAttribute("aria-expanded"),
    "false"
  );
});

test("DateRangePicker opens at committed range and Cancel discards its draft", async () => {
  await ready;
  const { DateRangePicker } = jiti(
    "../registry/new-york/date-range-picker.tsx"
  );
  const changes = [];
  await mount(
    React.createElement(DateRangePicker, {
      defaultOpen: true,
      defaultValue: { from: new Date(2025, 1, 12), to: new Date(2025, 1, 14) },
      label: "Period",
      motion: false,
      onValueChange: (next) => changes.push(next),
    })
  );
  assert.ok(document.querySelector('button[data-day="2025-02-12"]'));
  await React.act(() =>
    document.querySelector('button[data-day="2025-02-20"]').click()
  );
  await React.act(() =>
    [...document.querySelectorAll("button")]
      .find((button) => button.textContent.trim() === "Cancel")
      .click()
  );
  assert.equal(changes.length, 0);
  await React.act(() =>
    host.querySelector('[data-slot="popover-trigger"]').click()
  );
  assert.equal(
    document.querySelector('button[data-day="2025-02-12"]').dataset.rangeStart,
    "true"
  );
  assert.equal(
    document.querySelector('button[data-day="2025-02-14"]').dataset.rangeEnd,
    "true"
  );
});

test("DatePicker clear commits undefined and read-only prevents changes", async () => {
  await ready;
  const { DatePicker } = jiti("../registry/new-york/date-picker.tsx");
  const changes = [];
  await mount(
    React.createElement(DatePicker, {
      clearable: true,
      defaultOpen: true,
      defaultValue: new Date(2025, 1, 12),
      label: "Date",
      motion: false,
      onValueChange: (next) => changes.push(next),
    })
  );
  await React.act(() =>
    [...document.querySelectorAll("button")]
      .find((button) => button.textContent.trim() === "Clear date")
      .click()
  );
  assert.deepEqual(changes, [undefined]);
  assert.match(host.textContent, /Select a date/);
  await React.act(() =>
    root.render(
      React.createElement(DatePicker, {
        clearable: true,
        defaultOpen: true,
        key: "readonly",
        label: "Date",
        motion: false,
        onValueChange: (next) => changes.push(next),
        readOnly: true,
        value: new Date(2025, 1, 12),
      })
    )
  );
  assert.equal(
    document.querySelector('button[data-day="2025-02-12"]').disabled,
    true
  );
  assert.equal(
    [...document.querySelectorAll("button")].some(
      (button) => button.textContent.trim() === "Clear date"
    ),
    false
  );
  assert.deepEqual(changes, [undefined]);
});

test("DateRangePicker clear remains a draft until Apply", async () => {
  await ready;
  const { DateRangePicker } = jiti(
    "../registry/new-york/date-range-picker.tsx"
  );
  const changes = [];
  await mount(
    React.createElement(DateRangePicker, {
      clearable: true,
      defaultOpen: true,
      defaultValue: { from: new Date(2025, 1, 12), to: new Date(2025, 1, 14) },
      label: "Period",
      motion: false,
      onValueChange: (next) => changes.push(next),
    })
  );
  await React.act(() => buttonByText("Clear").click());
  assert.deepEqual(changes, []);
  assert.match(host.textContent, /2025/);
  await React.act(() => buttonByText("Apply").click());
  assert.deepEqual(changes, [undefined]);
  assert.match(host.textContent, /Select dates/);
});

test("Calendar preserves selection callbacks, disabled dates, keyboard focus and month bounds", async () => {
  await ready;
  const { Calendar } = jiti("../registry/new-york/calendar.tsx");
  const values = [];
  const changes = [];
  const Fixture = () => {
    const [selected, setSelected] = React.useState();
    return React.createElement(Calendar, {
      defaultMonth: new Date(2026, 9, 1),
      disabled: { dayOfWeek: [0, 6] },
      endMonth: new Date(2026, 10, 1),
      mode: "single",
      motion: false,
      onMonthChange: (next) => changes.push(next),
      onSelect: (next) => {
        values.push(next);
        setSelected(next);
      },
      selected,
      startMonth: new Date(2026, 9, 1),
    });
  };
  await mount(React.createElement(Fixture));
  const day = host.querySelector('button[data-day="2026-10-05"]');
  await React.act(() => day.click());
  assert.equal(values.length, 1);
  assert.equal(values[0].getDate(), 5);
  assert.equal(
    host.querySelector('button[data-day="2026-10-05"]').dataset.selectedSingle,
    "true"
  );
  assert.equal(
    host.querySelector('button[data-day="2026-10-04"]').disabled,
    true
  );
  await React.act(() => {
    day.focus();
    day.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })
    );
  });
  assert.equal(document.activeElement.dataset.day, "2026-10-06");
  assert.equal(
    host.querySelector('button[aria-label="Go to the Previous Month"]')
      .disabled,
    true
  );
  const next = host.querySelector('button[aria-label="Go to the Next Month"]');
  await React.act(() => next.click());
  assert.equal(changes.length, 1);
  assert.equal(changes[0].getMonth(), 10);
  assert.equal(
    host.querySelector('button[aria-label="Go to the Next Month"]').disabled,
    true
  );
});

test("CalendarDayButton preserves caller refs and native event handlers through Motion", async () => {
  await ready;
  const { Calendar, CalendarDayButton } = jiti(
    "../registry/new-york/calendar.tsx"
  );
  const ref = React.createRef();
  let clicks = 0;
  const CustomDay = (props) =>
    React.createElement(CalendarDayButton, {
      ...props,
      onClick: (event) => {
        clicks += 1;
        props.onClick?.(event);
      },
      ref: props.day.isoDate === "2026-10-05" ? ref : undefined,
    });
  await mount(
    React.createElement(Calendar, {
      components: { DayButton: CustomDay },
      defaultMonth: new Date(2026, 9, 1),
      mode: "single",
      motion: false,
    })
  );
  assert.equal(ref.current.dataset.day, "2026-10-05");
  await React.act(() => {
    ref.current.focus();
    ref.current.click();
  });
  assert.equal(clicks, 1);
  assert.equal(document.activeElement, ref.current);
});

test("Calendar playground resets selection and navigation", async () => {
  await ready;
  const { InputFamilyPlayground } = jiti(
    "../components/input-family-playground.tsx"
  );
  await mount(
    React.createElement(InputFamilyPlayground, { component: "calendar" })
  );
  const preview = () => host.querySelector('[data-slot="playground-preview"]');
  const day = preview().querySelector("button[data-day]");
  await React.act(() => day.click());
  assert.ok(preview().querySelector('[data-selected-single="true"]'));
  const originalMonth = preview()
    .querySelector('[role="grid"]')
    .getAttribute("aria-label");
  await React.act(() =>
    preview().querySelector('button[aria-label="Go to the Next Month"]').click()
  );
  assert.notEqual(
    preview().querySelector('[role="grid"]').getAttribute("aria-label"),
    originalMonth
  );
  await React.act(() =>
    [...host.querySelectorAll("button")]
      .find((button) => button.textContent.trim() === "Reset")
      .click()
  );
  assert.equal(preview().querySelector('[data-selected-single="true"]'), null);
  assert.equal(
    preview().querySelector('[role="grid"]').getAttribute("aria-label"),
    originalMonth
  );
});

test("Calendar preview uses every exposed option with the same generated configuration", async () => {
  await ready;
  const { AdvancedInputPreview } = jiti(
    "../components/input-family-playground.tsx"
  );
  const { getInputPlaygroundCode } = jiti("../lib/input-component-props.ts");
  const values = {
    buttonVariant: "outline",
    captionLayout: "dropdown",
    mode: "range",
    motion: false,
    numberOfMonths: "2",
    showOutsideDays: false,
    showWeekNumber: true,
    weekStartsOn: "1",
  };
  await mount(
    React.createElement(AdvancedInputPreview, { component: "calendar", values })
  );
  assert.equal(host.querySelectorAll('[role="grid"]').length, 2);
  assert.equal(host.querySelectorAll("select").length, 4);
  assert.ok(host.querySelector(".rdp-week_number"));
  assert.equal(host.querySelector(".rdp-outside button"), null);
  assert.equal(
    host.querySelector(".rdp-weekday").getAttribute("aria-label"),
    "Monday"
  );
  assert.ok(
    host.querySelector(".rdp-button_next").classList.contains("border")
  );
  const first = host.querySelector("button[data-day]");
  const firstDate = first.dataset.day;
  await React.act(() => first.click());
  assert.equal(
    host.querySelector(`button[data-day="${firstDate}"]`).dataset.rangeStart,
    "true"
  );
  assert.equal(
    host.querySelector(`button[data-day="${firstDate}"]`).style.transform,
    ""
  );
  const code = getInputPlaygroundCode("calendar", values);
  assert.match(code, /mode="range"/);
  assert.match(code, /motion=\{false\}/);
  assert.match(code, /showOutsideDays=\{false\}/);
  assert.match(code, /showWeekNumber=\{true\}/);
  assert.match(code, /numberOfMonths=\{2\}/);
  assert.match(code, /weekStartsOn=\{1\}/);
  assert.match(code, /captionLayout="dropdown"/);
  assert.match(code, /buttonVariant="outline"/);
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
  const outline = host.querySelector('[data-slot="input-outline"]');
  assert.equal(outline.tagName, "FIELDSET");
  assert.equal(outline.getAttribute("aria-hidden"), "true");
  assert.equal(outline.querySelector("legend").textContent, "Name");
  assert.ok(input.classList.contains("h-10"));
  assert.equal(input.classList.contains("h-12"), false);
});

test("InputGroupInput supports an associated floating label and controlled value updates", async () => {
  await ready;
  const { InputGroup, InputGroupInput } = jiti(
    "../registry/new-york/input-group.tsx"
  );
  const render = (value) =>
    React.createElement(
      InputGroup,
      null,
      React.createElement(InputGroupInput, {
        label: "Website",
        onChange: (event) => event.currentTarget.value,
        value,
      })
    );
  await mount(render("example.com"));
  const input = host.querySelector("input");
  const label = host.querySelector("label");
  assert.ok(label);
  assert.equal(label.htmlFor, input.id);
  assert.equal(label.dataset.floating, "true");
  await React.act(() => root.render(render("")));
  assert.equal(host.querySelector("label").dataset.floating, "false");
  assert.ok(host.querySelector('[data-slot="input-outline"]'));
});

test("InputPhone forwards floating and static label presentation to its grouped field", async () => {
  await ready;
  const { InputPhone } = jiti("../registry/new-york/input-phone.tsx");
  await mount(
    React.createElement(InputPhone, {
      defaultValue: "628123456789",
      label: "Phone",
    })
  );
  const input = host.querySelector('input[type="tel"]');
  const label = host.querySelector("label");
  assert.equal(label.htmlFor, input.id);
  assert.equal(label.dataset.floating, "true");
  await React.act(() =>
    root.render(
      React.createElement(InputPhone, { label: "Phone", labelStyle: "static" })
    )
  );
  assert.equal(host.querySelector("label").dataset.floating, undefined);
  assert.equal(host.querySelector('[data-slot="input-outline"]'), null);
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
  await React.act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    ).set.call(input, "12a345");
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  assert.equal(input.value, "1234");
  assert.deepEqual(values, ["1234"]);
  assert.deepEqual(completed, ["1234"]);
  await React.act(() => {
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
  await React.act(() => {
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
  await React.act(() => clear.click());
  assert.equal(input.value, "");
  assert.equal(document.activeElement, input);
  assert.deepEqual(values, [""]);
  assert.equal(host.querySelector("label").dataset.floating, "false");
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
  await React.act(() => {
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
  await React.act(() => shortcut.click());
  assert.deepEqual(changes, []);
  const apply = [...document.querySelectorAll("button")].find(
    (button) => button.textContent === "Apply"
  );
  assert.ok(apply);
  assert.equal(apply.disabled, false);
  await React.act(() => apply.click());
  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0], {
    from: new Date(2026, 8, 28),
    to: new Date(2026, 9, 4),
  });
});

test("DateRangePicker preserves a controlled draft when equivalent date values are rerendered", async () => {
  await ready;
  const { DateRangePicker } = jiti(
    "../registry/new-york/date-range-picker.tsx"
  );
  const changes = [];
  const render = () =>
    React.createElement(DateRangePicker, {
      defaultOpen: true,
      features: ["shortcuts"],
      label: "Range",
      now: () => new Date(2026, 9, 4),
      onValueChange: (range) => changes.push(range),
      value: { from: new Date(2026, 0, 1), to: new Date(2026, 0, 3) },
    });
  await mount(render());
  const shortcut = [...host.ownerDocument.querySelectorAll("button")].find(
    (button) => button.textContent === "Last 7 days"
  );
  assert.ok(shortcut);
  await React.act(() => shortcut.click());
  await React.act(() => root.render(render()));
  const apply = [...document.querySelectorAll("button")].find(
    (button) => button.textContent === "Apply"
  );
  assert.ok(apply);
  await React.act(() => apply.click());
  assert.deepEqual(changes, [
    { from: new Date(2026, 8, 28), to: new Date(2026, 9, 4) },
  ]);
});

test("DateRangePicker synchronizes an externally changed controlled range before Apply", async () => {
  await ready;
  const { DateRangePicker } = jiti(
    "../registry/new-york/date-range-picker.tsx"
  );
  const changes = [];
  const render = (value) =>
    React.createElement(DateRangePicker, {
      defaultOpen: true,
      label: "Range",
      onValueChange: (range) => changes.push(range),
      value,
    });
  await mount(render({ from: new Date(2026, 0, 1), to: new Date(2026, 0, 3) }));
  const next = { from: new Date(2026, 1, 1), to: new Date(2026, 1, 3) };
  await React.act(() => root.render(render(next)));
  assert.deepEqual(changes, []);
  const apply = [...document.querySelectorAll("button")].find(
    (button) => button.textContent === "Apply"
  );
  assert.ok(apply);
  await React.act(() => apply.click());
  assert.deepEqual(changes, [next]);
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
    disabled: true,
    label: `O'Neil \\ family`,
    placeholder: `Say "hello"`,
  });

  assert.match(code, /label=\{\\?"O'Neil/);
  assert.match(code, /Say \\"hello\\"/);
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
    Object.keys(playground.inputComponentProps).toSorted(),
    components.toSorted()
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

test("password playground forwards its configured placeholder to the native field", async () => {
  await ready;
  const { InputFamilyPlayground } = jiti(
    "../components/input-family-playground.tsx"
  );
  await mount(
    React.createElement(InputFamilyPlayground, { component: "input-password" })
  );
  const input = host.querySelector(
    '[data-slot="playground-preview"] input[type="password"]'
  );
  assert.ok(input);
  assert.equal(input.placeholder, "Enter password");
});

test("InputGroup preserves block addon placement and native input props", async () => {
  await ready;
  const { InputGroup, InputGroupAddon, InputGroupInput } = jiti(
    "../registry/new-york/input-group.tsx"
  );
  for (const align of ["block-start", "block-end"]) {
    const element = React.createElement(
      InputGroup,
      null,
      React.createElement(InputGroupAddon, { align }, "https://"),
      React.createElement(InputGroupInput, {
        label: "Website",
        name: "website",
        placeholder: "example.com",
      })
    );
    const mountedRoot = root;
    await (mountedRoot
      ? React.act(() => mountedRoot.render(element))
      : mount(element));
    assert.equal(
      host.querySelector('[data-slot="input-group-addon"]').dataset.align,
      align
    );
    assert.equal(
      host.querySelector('input[name="website"]').placeholder,
      "example.com"
    );
    assert.equal(
      host.querySelector("label").htmlFor,
      host.querySelector("input").id
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
        "aria-label": "Search",
        ref: (node) => (received.search = node),
      }),
      React.createElement(InputSecret, {
        "aria-label": "Secret",
        ref: (node) => (received.secret = node),
      }),
      React.createElement(InputPhone, {
        "aria-label": "Phone",
        ref: (node) => (received.phone = node),
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
