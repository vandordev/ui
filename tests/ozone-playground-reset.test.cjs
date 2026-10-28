/* eslint-disable global-require */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

const click = (f, element) => f.React.act(() => element.click());
const control = (text) => {
  const label = [...document.querySelectorAll("label")].find(
    (item) => item.textContent === text
  );
  assert.ok(Boolean(label), `Control ${text} exists`);
  return document.querySelector(`[id="${label.htmlFor}"]`);
};
const edit = (f, input, value) =>
  f.React.act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    ).set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
const button = (text) =>
  [...document.querySelectorAll("button")].find(
    (item) => item.textContent.trim() === text
  );
const preview = () =>
  document.querySelector('[data-slot="playground-preview"]');
const sourceState = () => document.querySelector("output").textContent;
const choose = async (f, label, value) => {
  await click(f, control(label));
  const option = [...document.querySelectorAll('[role="option"]')].find(
    (item) => item.textContent.trim() === value
  );
  assert.ok(Boolean(option), `Option ${value} exists`);
  await click(f, option);
};

test("DateTime real playground Reset restores configured controls, displayed instant and generated code", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { DateTimePlayground } = f.jiti(
      "../components/date-time-playground.tsx"
    );
    await f.render(f.React.createElement(DateTimePlayground));
    const initialCode = document.querySelector("pre code").textContent;
    await choose(f, "Locale", "id-ID");
    await choose(f, "Timezone", "Asia/Jakarta");
    await choose(f, "Display", "date");
    assert.equal(
      document.querySelector("time").textContent,
      new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeZone: "Asia/Jakarta",
      }).format(new Date("2026-10-24T08:00:00Z"))
    );
    assert.ok(
      document
        .querySelector("pre code")
        .textContent.includes('locale={"id-ID"}')
    );
    assert.ok(
      document
        .querySelector("pre code")
        .textContent.includes('timeZone={"Asia/Jakarta"}')
    );
    assert.ok(
      document
        .querySelector("pre code")
        .textContent.includes('format={{"dateStyle":"medium"}}')
    );
    await edit(f, control("Instant"), "invalid");
    await edit(f, control("Fallback"), 'Unavailable "now"');
    assert.equal(
      document.querySelector("time").textContent,
      'Unavailable "now"'
    );
    assert.ok(
      document
        .querySelector("pre code")
        .textContent.includes('value={"invalid"}')
    );
    await click(f, button("Reset"));
    assert.equal(control("Instant").value, "2026-10-24T08:00:00Z");
    assert.equal(control("Fallback").value, "—");
    assert.equal(
      document.querySelector("time").getAttribute("datetime"),
      "2026-10-24T08:00:00.000Z"
    );
    assert.equal(document.querySelector("pre code").textContent, initialCode);
  } finally {
    await f.cleanup();
  }
});

test("Select real Reset restores label configuration and clears a transient selection", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { SelectPlayground } = f.jiti("../components/select-playground.tsx");
    await f.render(f.React.createElement(SelectPlayground));
    const initialCode = document.querySelector("pre code").textContent;
    await edit(f, control("Label"), "Choose fruit");
    await choose(f, "Label style", "static");
    await click(f, preview().querySelector('[role="combobox"]'));
    await click(
      f,
      [...document.querySelectorAll('[role="option"]')].find((item) =>
        item.textContent.includes("Banana")
      )
    );
    assert.ok(preview().textContent.includes("Banana"));
    assert.ok(preview().textContent.includes("Choose fruit"));
    assert.ok(
      document
        .querySelector("pre code")
        .textContent.includes('labelStyle="static"')
    );
    await click(f, button("Reset"));
    assert.equal(control("Label").value, "Fruit");
    assert.ok(!preview().textContent.includes("Banana"));
    assert.equal(document.querySelector("pre code").textContent, initialCode);
  } finally {
    await f.cleanup();
  }
});

test("Password playground translated code and Reset restore hidden transient password and fresh field", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { InputFamilyPlayground } = f.jiti(
      "../components/input-family-playground.tsx"
    );
    await f.render(
      f.React.createElement(InputFamilyPlayground, {
        component: "input-password",
      })
    );
    const initialCode = document.querySelector("pre code").textContent;
    await edit(f, control("Show password label"), "Tampilkan");
    await edit(f, control("Hide password label"), "Sembunyikan");
    await edit(f, preview().querySelector("input"), "fake-demo-value");
    await click(f, preview().querySelector('button[aria-label="Tampilkan"]'));
    assert.equal(preview().querySelector("input").type, "text");
    assert.ok(
      Boolean(
        preview().querySelector(
          'button[aria-label="Sembunyikan"][aria-pressed="true"]'
        )
      )
    );
    const code = document.querySelector("pre code").textContent;
    assert.ok(code.includes('showPasswordLabel={"Tampilkan"}'));
    assert.ok(code.includes('hidePasswordLabel={"Sembunyikan"}'));
    await click(f, button("Reset"));
    assert.equal(preview().querySelector("input").type, "password");
    assert.equal(preview().querySelector("input").value, "");
    assert.ok(
      Boolean(preview().querySelector('button[aria-label="Show password"]'))
    );
    assert.equal(document.querySelector("pre code").textContent, initialCode);
  } finally {
    await f.cleanup();
  }
});

test("StatsCard real Reset restores metric count, label and generated code", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { StatsCardPlayground } = f.jiti(
      "../components/stats-card-playground.tsx"
    );
    await f.render(f.React.createElement(StatsCardPlayground));
    const initialCode = document.querySelector("pre code").textContent;
    await edit(f, control("Group label"), "Custom metrics");
    await edit(f, control("Metrics"), "7");
    assert.equal(
      preview()
        .querySelector('[data-slot="stats-card"]')
        .getAttribute("aria-label"),
      "Custom metrics"
    );
    assert.equal(preview().querySelectorAll("dt").length, 7);
    assert.notEqual(
      document.querySelector("pre code").textContent,
      initialCode
    );
    await click(f, button("Reset"));
    assert.equal(control("Group label").value, "Webhook overview");
    assert.equal(preview().querySelectorAll("dt").length, 2);
    assert.equal(document.querySelector("pre code").textContent, initialCode);
  } finally {
    await f.cleanup();
  }
});

test("Source demo owns initial load, Retry, refresh retention, failure and restart without a Query provider", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { DataGridSourceDemo } = f.jiti(
      "../examples/data-grid-source-demo.tsx"
    );
    await f.render(f.React.createElement(DataGridSourceDemo));
    assert.equal(sourceState(), "Source state: loading");
    assert.ok(!document.body.textContent.includes("Person 01"));
    await click(f, button("Fail request"));
    assert.equal(sourceState(), "Source state: error");
    await click(f, button("Try again"));
    assert.equal(sourceState(), "Source state: loading");
    await click(f, button("Complete request"));
    assert.ok(document.body.textContent.includes("Person 01"));
    await click(f, button("Refresh source"));
    assert.equal(sourceState(), "Source state: refreshing");
    assert.ok(document.body.textContent.includes("Person 01"));
    await click(f, button("Fail request"));
    assert.equal(sourceState(), "Source state: backgroundError");
    assert.ok(document.body.textContent.includes("Person 01"));
    await click(f, button("Try again"));
    await click(f, button("Complete request"));
    assert.equal(sourceState(), "Source state: ready");
    await click(f, button("Restart demo"));
    assert.equal(sourceState(), "Source state: loading");
    assert.ok(!document.body.textContent.includes("Person 01"));
  } finally {
    await f.cleanup();
  }
});
