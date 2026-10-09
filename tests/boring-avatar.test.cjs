/* eslint-disable global-require, require-await -- DOM globals precede React DOM; async act flushes updates. */
const assert = require("node:assert/strict");
const { test, after, afterEach } = require("node:test");
const { createJiti } = require("jiti");
const { readFileSync } = require("node:fs");
const jiti = createJiti(__filename, {
  alias: { "@": require("node:path").resolve(__dirname, "..") },
  fsCache: false,
  jsx: { runtime: "automatic" },
});
let React, dom, host, root;
const headings = (nodes) =>
  nodes
    .filter((node) => node.type === "heading")
    .map((node) => node.children[0].value);
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
  for (const key of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLImageElement",
    "Element",
    "Node",
    "Event",
    "MutationObserver",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
  ]) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: key === "window" ? dom : dom[key],
      writable: true,
    });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  React = require("react");
})();
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

test("BoringAvatar renders labeled and decorative SVGs without wrapper background", async () => {
  await ready;
  const { BoringAvatar } = jiti("../registry/new-york/boring-avatar.tsx");
  const { renderToStaticMarkup } = require("react-dom/server");
  const markup = renderToStaticMarkup(
    React.createElement(BoringAvatar, {
      alt: "Vandor",
      name: "vandor",
      size: 72,
    })
  );
  assert.match(markup, /aria-label="Vandor"/);
  assert.match(markup, /width:72px/);
  assert.match(markup, /<svg/);
  assert.doesNotMatch(markup, /bg-|background-color/);
  const decorative = renderToStaticMarkup(
    React.createElement(BoringAvatar, { name: "vandor" })
  );
  assert.match(decorative, /aria-hidden="true"/);
  assert.doesNotMatch(decorative, /<title/);
});

test("BoringAvatar preserves ref, style overrides, events and photo lifecycle", async () => {
  await ready;
  const { BoringAvatar } = jiti("../registry/new-york/boring-avatar.tsx");
  const { createRoot } = require("react-dom/client");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const ref = React.createRef();
  let clicks = 0;
  const props = {
    alt: "Vandor",
    name: "vandor",
    onClick: () => {
      clicks += 1;
    },
    ref,
    size: 72,
    style: { width: 80 },
  };
  const render = async (extra) =>
    React.act(async () =>
      root.render(React.createElement(BoringAvatar, { ...props, ...extra }))
    );
  await render({ src: "/profile.svg" });
  const wrapper = host.querySelector('[data-slot="boring-avatar"]');
  assert.ok(ref.current === wrapper, "Ref targets outer span");
  assert.equal(wrapper.style.width, "80px");
  assert.equal(wrapper.style.height, "72px");
  await React.act(async () => wrapper.click());
  assert.equal(clicks, 1);
  assert.ok(
    host.querySelector("svg") !== null,
    "Fallback visible during loading"
  );
  const image = host.querySelector("img");
  await React.act(async () => image.dispatchEvent(new Event("load")));
  assert.ok(
    host.querySelector("svg") === null,
    "Loaded photo replaces fallback"
  );
  assert.equal(image.alt, "Vandor");
  await render({ src: "/missing.svg" });
  await React.act(async () =>
    host.querySelector("img").dispatchEvent(new Event("error"))
  );
  assert.ok(
    host.querySelector("svg") !== null,
    "Failed photo restores fallback"
  );
  assert.ok(
    host.querySelector("img").dataset.error === "",
    "Failed photo hidden by error styling"
  );
  await render({ src: undefined });
  assert.ok(host.querySelector("img") === null, "Removing src removes photo");
  assert.ok(
    host.querySelector("svg") !== null,
    "Removing src restores fallback"
  );
});

test("BoringAvatar playground safely serializes every control and matches preview props", async () => {
  await ready;
  const lib = jiti("../lib/boring-avatar-playground.ts");
  const defaults = lib.getBoringAvatarDefaults();
  const values = {
    ...defaults,
    alt: "Ada",
    colors: "warm",
    name: 'Ada "<test>"',
    size: 96,
    square: true,
    src: '/photo?a="b"',
    variant: "bauhaus",
  };
  const props = lib.getBoringAvatarPreviewProps(values);
  assert.deepEqual(props, {
    alt: "Ada",
    colors: lib.boringAvatarPalettes.warm,
    name: values.name,
    size: 96,
    square: true,
    src: values.src,
    variant: "bauhaus",
  });
  const code = lib.getBoringAvatarCode(values);
  for (const [key, value] of Object.entries(props)) {
    assert.ok(
      code.includes(`${key}={${JSON.stringify(value)}}`),
      `Generated ${key} matches preview`
    );
  }
  const ts = require("typescript");
  assert.equal(
    ts.transpileModule(code, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true,
    }).diagnostics.length,
    0
  );
  assert.notStrictEqual(lib.getBoringAvatarDefaults(), defaults);
  assert.equal(lib.getBoringAvatarPreviewProps(defaults).colors, undefined);
  assert.equal(lib.getBoringAvatarPreviewProps(defaults).src, undefined);
  const { BoringAvatar } = jiti("../registry/new-york/boring-avatar.tsx");
  const { renderToStaticMarkup } = require("react-dom/server");
  for (const variant of lib.boringAvatarProps.variant.control.options) {
    for (const colors of lib.boringAvatarProps.colors.control.options) {
      const config = { ...values, colors, src: "", variant };
      const previewProps = lib.getBoringAvatarPreviewProps(config);
      const markup = renderToStaticMarkup(
        React.createElement(BoringAvatar, previewProps)
      );
      assert.match(markup, /aria-label="Ada"/);
      assert.match(markup, /width:96px/);
      const preset =
        colors === "default" ? undefined : lib.boringAvatarPalettes[colors];
      assert.deepEqual(previewProps.colors, preset);
      if (preset) {
        assert.ok(
          preset.some((color) => markup.includes(color)),
          `${variant} renders ${colors} palette`
        );
      }
      assert.ok(
        lib
          .getBoringAvatarCode(config)
          .includes(`variant={${JSON.stringify(variant)}}`),
        "Code matches variant"
      );
    }
  }
  const reset = lib.getBoringAvatarDefaults();
  assert.deepEqual(reset, defaults);
  const adapter = readFileSync(
    "components/boring-avatar-playground.tsx",
    "utf-8"
  );
  assert.match(
    adapter,
    /<BoringAvatar \{\.\.\.getBoringAvatarPreviewProps\(values\)\}/
  );
  assert.match(adapter, /getCode=\{getBoringAvatarCode\}/);
});

test("BoringAvatar identity is deterministic and empty palettes use upstream defaults", async () => {
  await ready;
  const { BoringAvatar } = jiti("../registry/new-york/boring-avatar.tsx");
  const { renderToStaticMarkup } = require("react-dom/server");
  const render = (props) =>
    renderToStaticMarkup(React.createElement(BoringAvatar, props));
  const initial = render({ name: "vandor" });
  assert.equal(render({ name: "vandor" }), initial);
  assert.equal(render({ colors: [], name: "vandor" }), initial);
  assert.notEqual(render({ name: "ada" }), initial);
});

test("BoringAvatar docs expose installation, shared props and gallery demo", async () => {
  await ready;
  const { buildComponentDocSections, componentFrontmatterSchema } = jiti(
    "../lib/component-docs.ts"
  );
  assert.equal(
    componentFrontmatterSchema.safeParse({ component: "boring-avatar" })
      .success,
    true
  );
  const sections = buildComponentDocSections(
    { component: "boring-avatar" },
    readFileSync("registry/new-york/boring-avatar.tsx", "utf-8")
  );
  assert.deepEqual(headings(sections.before), [
    "Playground",
    "Installation",
    "Dependencies",
  ]);
  assert.deepEqual(headings(sections.after), ["Props", "Source"]);
  const text = JSON.stringify(sections);
  assert.ok(
    text.includes("https://vandor-ui.vercel.app/r/boring-avatar.json"),
    "Install URL is generated"
  );
  assert.ok(
    text.includes("boring-avatars"),
    "Generator dependency is documented"
  );
  assert.ok(text.includes("square"), "Public props are generated");
  const { BoringAvatarDemo } = jiti("../examples/boring-avatar-demo.tsx");
  const { renderToStaticMarkup } = require("react-dom/server");
  assert.equal(
    (
      renderToStaticMarkup(React.createElement(BoringAvatarDemo)).match(
        /data-slot="boring-avatar"/g
      ) ?? []
    ).length,
    4
  );
});

test("BoringAvatar artifacts match source and stories do not reinstall core", () => {
  const registry = require("../registry.json");
  for (const name of ["boring-avatar", "boring-avatar-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf-8"));
    assert.equal(
      artifact.files[0].content,
      readFileSync(item.files[0].path, "utf-8")
    );
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.equal(artifact.files.length, 1);
    assert.equal(item.files[0].target, undefined);
  }
  assert.deepEqual(
    registry.items.find((item) => item.name === "boring-avatar-stories")
      .dependencies ?? [],
    []
  );
});

test("BoringAvatar portable stories compose all variants and apply Controls", async () => {
  await ready;
  const { composeStories } = await import("@storybook/react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const stories = composeStories(
    jiti("../registry/new-york/boring-avatar.stories.tsx")
  );
  for (const story of Object.values(stories)) {
    assert.match(renderToStaticMarkup(story()), /data-slot="boring-avatar"/);
  }
  const markup = renderToStaticMarkup(
    stories.Playground({
      alt: "Ada",
      name: "Ada",
      size: 96,
      square: true,
      variant: "ring",
    })
  );
  assert.match(markup, /aria-label="Ada"/);
  assert.match(markup, /width:96px/);
  assert.match(markup, /viewBox="0 0 90 90"/);
  assert.equal(
    (
      renderToStaticMarkup(stories.Variants()).match(
        /data-slot="boring-avatar"/g
      ) ?? []
    ).length,
    6
  );
});
