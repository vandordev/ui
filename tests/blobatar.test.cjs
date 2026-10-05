/* eslint-disable global-require, require-await -- DOM globals precede React DOM; act flushes updates. */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");
const { readFileSync } = require("node:fs");
const { setTimeout: wait } = require("node:timers/promises");
let Blobatar, React, createRoot, dom, host, root;
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLImageElement",
    "SVGElement",
    "SVGSVGElement",
    "Element",
    "Node",
    "Event",
    "PointerEvent",
    "MutationObserver",
    "ResizeObserver",
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
  globalThis.matchMedia = dom.matchMedia.bind(dom);
  globalThis.addEventListener = dom.addEventListener.bind(dom);
  globalThis.removeEventListener = dom.removeEventListener.bind(dom);
  React = require("react");
  ({ createRoot } = require("react-dom/client"));
})();
const mount = async (props) => {
  await ready;
  ({ Blobatar } = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/blobatar.tsx"));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () =>
    root.render(React.createElement(Blobatar, props))
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

test("Blobatar artifacts match source and keep stories installation independent", () => {
  const registry = require("../registry.json");
  for (const name of ["blobatar", "blobatar-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = require(`../public/r/${name}.json`);
    assert.equal(artifact.type, item.type);
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.equal(artifact.files.length, 1);
    assert.equal(
      artifact.files[0].content,
      readFileSync(item.files[0].path, "utf-8")
    );
  }
  const stories = registry.items.find(
    (entry) => entry.name === "blobatar-stories"
  );
  assert.deepEqual(stories.dependencies ?? [], []);
  assert.equal(stories.files[0].target, undefined);
});

test("Blobatar portable stories compose real states and apply Controls args", async () => {
  await ready;
  const { composeStories } = await import("@storybook/react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const jiti = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const stories = composeStories(
    jiti("../registry/new-york/blobatar.stories.tsx")
  );
  for (const name of [
    "Playground",
    "PointerTracking",
    "Sizes",
    "Crowd",
    "Photo",
    "FailedPhoto",
    "HoverMotion",
    "Thinking",
    "Backdrops",
    "Decorative",
  ]) {
    assert.match(renderToStaticMarkup(stories[name]()), /data-slot="blobatar"/);
  }
  const custom = renderToStaticMarkup(
    stories.Playground({ alt: "Custom", name: "custom", size: 96 })
  );
  assert.match(custom, /width:96px/);
  assert.match(custom, /alt="Custom"/);
  assert.match(renderToStaticMarkup(stories.Decorative()), /alt=""/);
  assert.match(renderToStaticMarkup(stories.HoverMotion()), /<svg/);
});

test("Blobatar renders a decorative local fallback and preserves wrapper ref, sizing, and events", async () => {
  await ready;
  const ref = React.createRef();
  let clicks = 0;
  await mount({
    name: "vandor",
    onClick: () => {
      clicks += 1;
    },
    ref,
    size: 72,
  });
  const wrapper = host.querySelector('[data-slot="blobatar"]');
  assert.ok(ref.current === wrapper, "Ref targets the wrapper");
  assert.equal(wrapper.style.width, "72px");
  assert.equal(host.querySelector("img").getAttribute("alt"), "");
  assert.match(
    host.querySelector("img").getAttribute("src"),
    /^data:image\/svg\+xml/
  );
  await React.act(async () => wrapper.click());
  assert.equal(clicks, 1);
});

test("Blobatar exposes the same accessible label for animated and static fallbacks", async () => {
  await mount({ alt: "Vandor", name: "vandor" });
  assert.equal(host.querySelector("img").getAttribute("alt"), "Vandor");
  await React.act(async () =>
    root.render(
      React.createElement(Blobatar, {
        alt: "Vandor",
        blobatar: { animate: "hover" },
        name: "vandor",
      })
    )
  );
  assert.equal(host.querySelector("svg title").textContent, "Vandor");
  assert.equal(host.querySelector("svg").getAttribute("role"), "img");
  assert.ok(host.querySelector("img") === null, "Animated fallback uses SVG");
});

test("Blobatar fills the avatar frame with a circle by default but allows transparent fallback", async () => {
  await mount({ name: "vandor" });
  const markup = decodeURIComponent(
    host.querySelector("img").getAttribute("src").split(",")[1]
  );
  assert.match(markup, /M100 50C100/);
  await React.act(async () =>
    root.render(
      React.createElement(Blobatar, {
        blobatar: { background: false },
        name: "vandor",
      })
    )
  );
  const transparent = decodeURIComponent(
    host.querySelector("img").getAttribute("src").split(",")[1]
  );
  assert.doesNotMatch(transparent, /M100 50C100/);
});

test("Blobatar pointer tracking opts into SVG, configures gaze travel, and keeps the public ref", async () => {
  await ready;
  const ref = React.createRef();
  await mount({
    alt: "Vandor",
    followPointer: true,
    name: "vandor",
    pointerTravel: 4,
    ref,
  });
  const svg = host.querySelector("svg");
  assert.ok(svg !== null, "Pointer tracking requires inline SVG");
  assert.equal(svg.style.getPropertyValue("--mo-track-travel"), "4px");
  assert.equal(svg.querySelector("title").textContent, "Vandor");
  assert.ok(
    ref.current === host.querySelector('[data-slot="blobatar"]'),
    "Public ref stays on wrapper"
  );
  await React.act(async () =>
    root.render(
      React.createElement(Blobatar, { followPointer: false, name: "vandor" })
    )
  );
  assert.ok(
    host.querySelector("svg") === null,
    "Disabling tracking restores static rendering"
  );
});

test("Blobatar gaze responds to pointer movement and detaches when reduced motion is enabled", async () => {
  await ready;
  // Happy DOM cannot model physical pointer capabilities. Simulate only the
  // media boundary; the actual upstream driver handles real DOM pointer events.
  const original = globalThis.matchMedia;
  const fine = Object.assign(new dom.EventTarget(), { matches: true });
  const reduced = Object.assign(new dom.EventTarget(), { matches: false });
  globalThis.matchMedia = (query) =>
    query.includes("prefers-reduced-motion") ? reduced : fine;
  try {
    await mount({ followPointer: true, name: "vandor" });
    const eyes = host.querySelector(".mo-eyes");
    await React.act(async () => {
      dom.dispatchEvent(
        new dom.PointerEvent("pointermove", { clientX: 200, clientY: 100 })
      );
      await wait(60);
    });
    assert.ok(
      Number(eyes.style.getPropertyValue("--mo-track-x")) > 0,
      "Real gaze driver moves toward pointer"
    );
    await React.act(async () => {
      reduced.matches = true;
      reduced.dispatchEvent(new dom.Event("change"));
    });
    assert.equal(eyes.style.getPropertyValue("--mo-track-x"), "");
    assert.equal(eyes.style.getPropertyValue("--mo-track-y"), "");
  } finally {
    globalThis.matchMedia = original;
  }
});

test("Blobatar shows its fallback while a photo loads, hides it on load, and restores it on failure", async () => {
  await mount({ alt: "Vandor", name: "vandor", src: "/profile.png" });
  const photo = host.querySelector('[data-slot="blobatar-image"]');
  assert.ok(
    host.querySelector('[data-slot="blobatar-fallback"]') !== null,
    "Fallback exists before load"
  );
  await React.act(async () => photo.dispatchEvent(new dom.Event("load")));
  assert.ok(
    host.querySelector('[data-slot="blobatar-fallback"]') === null,
    "Loaded photo replaces fallback"
  );
  assert.equal(photo.getAttribute("alt"), "Vandor");
  await React.act(async () => photo.dispatchEvent(new dom.Event("error")));
  assert.ok(
    host.querySelector('[data-slot="blobatar-fallback"]') !== null,
    "Failed photo restores fallback"
  );
  assert.equal(photo.getAttribute("aria-hidden"), "true");
});

test("Blobatar playground serializes every control into runnable code matching the preview", async () => {
  await ready;
  const jiti = createJiti(__filename, {
    alias: {
      "@": process.cwd(),
      "@/components/ui/blobatar": `${process.cwd()}/registry/new-york/blobatar.tsx`,
    },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  const { getBlobatarDefaults, getBlobatarCode, getBlobatarPreviewProps } =
    jiti("../lib/blobatar-playground.ts");
  const { renderToStaticMarkup } = require("react-dom/server");
  ({ Blobatar } = jiti("../registry/new-york/blobatar.tsx"));
  const defaults = getBlobatarDefaults();
  for (const changes of [
    {},
    { name: 'A "quoted" name\n日本語' },
    { src: "/photo.png" },
    { size: 96 },
    { "blobatar.animate": "hover" },
    { "blobatar.animate": "always" },
    { "blobatar.expression": "happy" },
    { "blobatar.expression": "wink" },
    { "blobatar.background": "square" },
    { "blobatar.background": "circle" },
    { "blobatar.background": "squircle" },
    { "blobatar.background": "none" },
    { followPointer: true },
    { followPointer: true, pointerTravel: 4 },
    {
      "blobatar.animate": "always",
      "blobatar.background": "circle",
      "blobatar.expression": "thinking",
      size: 80,
    },
  ]) {
    const values = { ...defaults, ...changes };
    const code = getBlobatarCode(values);
    // Node has no CSS loader; CSS rendering is checked in the website browser.
    const { Demo } = jiti.evalModule(
      code
        .replace('import "blobatar/motion.css";', "")
        .replace('import "blobatar/gaze.css";', ""),
      { filename: `${process.cwd()}/blobatar-generated.tsx` }
    );
    const generated = renderToStaticMarkup(React.createElement(Demo));
    const preview = renderToStaticMarkup(
      React.createElement(Blobatar, getBlobatarPreviewProps(values))
    );
    assert.equal(generated, preview);
  }
  assert.equal(defaults.name, "vandor");
  assert.equal(getBlobatarDefaults()["blobatar.animate"], "off");
});
