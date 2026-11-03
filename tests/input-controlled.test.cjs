const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createAutocompleteFixture } = require("./autocomplete-ui-fixture.cjs");

const edit = async (f, input, value) => {
  await f.React.act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    ).set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

test("controlled phone restores rejected digits and accepts a later parent value", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { InputPhone } = f.jiti("../registry/new-york/input-phone.tsx");
    const values = [];
    const render = (value) =>
      f.render(
        f.React.createElement(InputPhone, {
          onValueChange: (next) => values.push(next),
          value,
        })
      );
    await render("628123456789");
    const input = document.querySelector('input[type="tel"]');
    const initial = input.value;
    await edit(f, input, "8123456788");
    assert.equal(input.value, initial);
    assert.deepEqual(values, ["628123456788"]);
    await render("628123456789");
    assert.equal(input.value, initial);
    await render("628123456788");
    assert.equal(input.value.replaceAll(/\D/g, ""), "8123456788");
  } finally {
    await f.cleanup();
  }
});

test("controlled OTP emits repeated rejected edits and completion", async () => {
  const f = await createAutocompleteFixture();
  try {
    const { InputOTP } = f.jiti("../registry/new-york/input-otp.tsx");
    const values = [];
    const completed = [];
    await f.render(
      f.React.createElement(InputOTP, {
        length: 1,
        onComplete: (next) => completed.push(next),
        onValueChange: (next) => values.push(next),
        value: "",
      })
    );
    const input = document.querySelector("input");
    await edit(f, input, "1");
    await edit(f, input, "1");
    assert.equal(input.value, "");
    assert.deepEqual(values, ["1", "1"]);
    assert.deepEqual(completed, ["1", "1"]);
  } finally {
    await f.cleanup();
  }
});
