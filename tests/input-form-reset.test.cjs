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

for (const [name, module, initial, edited] of [
  ["InputSearch", "input-search", "Alice", "Bob"],
  ["InputOTP", "input-otp", "1234", "5678"],
  ["Input", "input", "Alice", "Bob"],
]) {
  test(`${name} restores native form defaults and respects cancelled resets`, async () => {
    const f = await createAutocompleteFixture();
    try {
      const Component = f.jiti(`../registry/new-york/${module}.tsx`)[name];
      const ref = f.React.createRef();
      const values = [];
      const completed = [];
      const render = (cancel) =>
        f.render(
          f.React.createElement(
            "form",
            {
              id: "owner",
              onReset: cancel ? (event) => event.preventDefault() : undefined,
            },
            f.React.createElement(Component, {
              defaultValue: initial,
              form: "owner",
              ref,
              ...(name === "InputOTP"
                ? {
                    length: 4,
                    onComplete: (v) => completed.push(v),
                    onValueChange: (v) => values.push(v),
                  }
                : {
                    label: "Name",
                    ...(name === "InputSearch" ? { clearable: true } : {}),
                  }),
            })
          )
        );
      await render(false);
      const input = document.querySelector("input");
      assert.ok(ref.current === input, "Consumer ref receives input");
      await edit(f, input, edited);
      await render(true);
      // Happy DOM resets values before dispatching a non-cancellable event.
      await f.React.act(async () => {
        document
          .querySelector("form")
          .dispatchEvent(
            new Event("reset", { bubbles: true, cancelable: true })
          );
        await Promise.resolve();
      });
      assert.equal(input.value, edited);
      await render(false);
      await edit(f, input, "");
      await f.React.act(() => input.blur());
      await f.React.act(async () => {
        document.querySelector("form").reset();
        await Promise.resolve();
      });
      assert.equal(input.value, initial);
      if (name === "InputOTP") {
        assert.equal(
          document.querySelectorAll('[data-filled="true"]').length,
          4
        );
        await edit(f, input, edited);
        assert.deepEqual(completed, [edited, edited]);
        assert.deepEqual(values, [edited, "", edited]);
      } else {
        assert.equal(document.querySelector("label").dataset.floating, "true");
        if (name === "InputSearch") {
          assert.ok(
            document.querySelector('button[aria-label="Clear search"]')
          );
        }
      }
    } finally {
      await f.cleanup();
    }
  });
}
