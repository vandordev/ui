/* eslint-disable global-require -- Portable CSF modules are loaded through Jiti with actual component dependencies. */
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { test } = require("node:test");
const { renderToStaticMarkup } = require("react-dom/server");
const { createJiti } = require("jiti");

const registry = require("../registry.json");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const names = [
  "loading",
  "input",
  "textarea",
  "input-group",
  "input-password",
  "input-search",
  "input-amount",
  "input-phone",
  "input-otp",
  "input-secret",
];

test("every public UI component has portable stories and an optional source-matching registry artifact", () => {
  for (const component of registry.items.filter(
    (item) => item.type === "registry:ui"
  )) {
    const source = `registry/new-york/${component.name}.stories.tsx`;
    assert.ok(existsSync(source), `${component.name}: stories source missing`);
    const storyItem = registry.items.find(
      (item) => item.name === `${component.name}-stories`
    );
    assert.ok(storyItem, `${component.name}: stories registry item missing`);
    assert.equal(storyItem.type, "registry:item");
    assert.deepEqual(storyItem.registryDependencies ?? [], []);
    assert.deepEqual(storyItem.dependencies ?? [], []);
    assert.equal(storyItem.files.length, 1);
    assert.equal(storyItem.files[0].path, source);
    const artifactPath = `public/r/${component.name}-stories.json`;
    assert.ok(
      existsSync(artifactPath),
      `${component.name}: stories artifact missing`
    );
    const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
    assert.equal(artifact.files.length, 1);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.deepEqual(artifact.dependencies ?? [], []);
    assert.equal(artifact.files[0].content, readFileSync(source, "utf-8"));
    assert.ok(
      !component.files.some((file) => file.path.endsWith(".stories.tsx")),
      "Core installation must remain stories-free"
    );
    // Existing family stories may declare a target; new primitive stories do not.
    if (names.includes(component.name)) {
      assert.equal(artifact.files[0].target, undefined);
      assert.equal(artifact.files[0].type, "registry:ui");
      assert.doesNotMatch(artifact.files[0].content, /from ["']@\//);
    }
  }
});

test("all ten new portable story modules compose and render every exported scenario", async () => {
  const { composeStories } = await import("@storybook/react");
  for (const name of names) {
    const source = jiti(`../registry/new-york/${name}.stories.tsx`);
    assert.match(source.default.title, /^Vandor UI\//);
    const stories = composeStories(source);
    assert.ok(stories.Playground, `${name}: Playground missing`);
    for (const [scenario, Story] of Object.entries(stories)) {
      const html = renderToStaticMarkup(Story());
      assert.match(
        html,
        /data-slot=/,
        `${name}/${scenario}: component must render`
      );
    }
    const controls = {
      "aria-invalid": true,
      "aria-label": "Custom field",
      defaultValue: name === "input-amount" ? "42.5" : "1234",
      disabled: true,
      readOnly: true,
    };
    if (!["input-amount", "input-otp"].includes(name)) {
      controls.label = "Custom field";
    }
    if (!["textarea", "input-amount", "input-otp"].includes(name)) {
      controls.labelStyle = "static";
    }
    const custom = renderToStaticMarkup(
      stories.Playground(
        name === "loading"
          ? {
              "aria-label": "Custom progress",
              size: 48,
              text: "Custom text",
              variant: "text-dots",
            }
          : controls
      )
    );
    if (name === "loading") {
      assert.match(custom, /Custom progress/);
      assert.match(custom, /Custom text/);
      assert.match(custom, /--loading-size:48px/);
      assert.match(custom, /data-variant="text-dots"/);
    } else {
      assert.match(custom, /disabled=""/);
      assert.match(custom, /readOnly=""/);
      assert.match(custom, /aria-invalid="true"/);
      assert.match(custom, /Custom field/);
    }
  }
});

test("Input Group controls configure each addon alignment and labeled field rather than leaking onto the root", async () => {
  const { composeStories } = await import("@storybook/react");
  const { Playground, Textarea } = composeStories(
    jiti("../registry/new-york/input-group.stories.tsx")
  );
  for (const align of [
    "inline-start",
    "inline-end",
    "block-start",
    "block-end",
  ]) {
    const html = renderToStaticMarkup(
      Playground({
        addon: "Custom addon",
        align,
        label: "Custom group",
        labelStyle: "static",
        placeholder: "Custom placeholder",
      })
    );
    assert.match(html, new RegExp(`data-align="${align}"`));
    assert.match(html, /Custom addon/);
    assert.match(html, /Custom group/);
    assert.match(html, /placeholder="Custom placeholder"/);
    assert.match(html, /data-label-style="static"/);
    assert.doesNotMatch(html, /<div[^>]*\s(?:addon|align|labelStyle)=/);
  }
  assert.match(
    renderToStaticMarkup(
      Textarea({ addon: "Custom footer", label: "Custom message" })
    ),
    /<textarea[^>]*aria-label="Custom message"/
  );
});

test("amount formatting Controls stay valid across separator combinations and preserve controlled decimal values", async () => {
  const { composeStories } = await import("@storybook/react");
  const source = jiti("../registry/new-york/input-amount.stories.tsx");
  const { Playground, Controlled } = composeStories(source);
  for (const decimalSeparator of source.default.argTypes.decimalSeparator
    .options) {
    for (const thousandSeparator of source.default.argTypes.thousandSeparator
      .options) {
      const html = renderToStaticMarkup(
        Playground({
          decimalSeparator,
          defaultValue: "1234.5",
          prefix: "",
          suffix: " EUR",
          thousandSeparator,
        })
      );
      assert.match(html, decimalSeparator === "." ? /\.50 EUR/ : /,50 EUR/);
    }
  }
  assert.match(renderToStaticMarkup(Controlled()), /Decimal value: 1250\.5/);
});

test("OTP and phone Controls set actual lengths, keyboard modes, country defaults and localized names", async () => {
  const { composeStories } = await import("@storybook/react");
  const otp = composeStories(
    jiti("../registry/new-york/input-otp.stories.tsx")
  );
  const otpHtml = renderToStaticMarkup(
    otp.Playground({ defaultValue: "AB12", length: 4, type: "alphanumeric" })
  );
  assert.match(otpHtml, /maxLength="4"/);
  assert.match(otpHtml, /inputMode="text"/);
  assert.match(otpHtml, /value="AB12"/);
  const phone = composeStories(
    jiti("../registry/new-york/input-phone.stories.tsx")
  );
  const phoneHtml = renderToStaticMarkup(
    phone.Playground({
      countrySelectLabel: "Choose calling code",
      defaultCountry: "US",
      defaultValue: "",
      locale: "id",
    })
  );
  assert.match(phoneHtml, /Choose calling code/);
  assert.match(phoneHtml, /\+1/);
  const normalized = renderToStaticMarkup(phone.Controlled());
  assert.match(normalized, /International digits: 6281234567890/);
});
