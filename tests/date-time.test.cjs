/* eslint-disable global-require */
const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const { createJiti } = require("jiti");
let dom;
let React;
let createRoot;
let hydrateRoot;
let host;
let root;
let DateTime;
const jiti = createJiti(__filename, {
  fsCache: false,
  jsx: { runtime: "automatic" },
});
const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
  for (const name of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLTimeElement",
    "Element",
    "Node",
    "MutationObserver",
    "Event",
    "MouseEvent",
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
  ({ createRoot, hydrateRoot } = require("react-dom/client"));
  ({ DateTime } = jiti("../registry/new-york/date-time.tsx"));
})();
after(async () => {
  await ready;
  if (root) {
    React.act(() => root.unmount());
  }
  await dom.happyDOM.abort();
});

test("DateTime hydration starts from the server fallback and upgrades locally without mismatch", async () => {
  await ready;
  const { renderToString } = require("react-dom/server");
  const element = React.createElement(DateTime, {
    dateTime: undefined,
    id: "stamp",
    value: "2026-10-24T08:00:00Z",
  });
  const markup = renderToString(element);
  assert.match(markup, /—/);
  assert.match(markup, /dateTime="2026-10-24T08:00:00.000Z"/);
  host = document.createElement("div");
  host.innerHTML = markup;
  document.body.append(host);
  const errors = [];
  await React.act(() => {
    root = hydrateRoot(host, element, {
      onRecoverableError: (error) => errors.push(String(error)),
    });
  });
  assert.equal(errors.length, 0);
  assert.notEqual(host.querySelector("time").textContent, "—");
  assert.equal(host.querySelector("time").id, "stamp");
  assert.ok(
    host.querySelector("time").tagName === "TIME",
    "Native time element is rendered"
  );
  await React.act(() => root.unmount());
  root = null;
  host.remove();
});

test("DateTime forwards a real native ref and updates valid and invalid values without leaking dateTime", async () => {
  await ready;
  host = document.createElement("div");
  document.body.append(host);
  const ref = React.createRef();
  let clicks = 0;
  root = createRoot(host);
  try {
    const render = (value) =>
      React.act(() =>
        root.render(
          React.createElement(DateTime, {
            fallback: "Unavailable",
            onClick: () => {
              clicks += 1;
            },
            ref,
            timeZone: "UTC",
            title: "Created at",
            value,
          })
        )
      );
    await render(0);
    assert.ok(
      ref.current === host.querySelector("time"),
      "Ref reaches the native time element"
    );
    assert.equal(
      ref.current.getAttribute("datetime"),
      "1970-01-01T00:00:00.000Z"
    );
    assert.equal(ref.current.title, "Created at");
    await React.act(() => ref.current.click());
    assert.equal(clicks, 1);
    await render("2026-10-25T08:00:00Z");
    assert.equal(
      ref.current.getAttribute("datetime"),
      "2026-10-25T08:00:00.000Z"
    );
    await render("2026-02-30T08:00:00Z");
    assert.equal(ref.current.textContent, "Unavailable");
    assert.equal(ref.current.hasAttribute("datetime"), false);
  } finally {
    await React.act(() => root.unmount());
    root = null;
    host.remove();
  }
});
