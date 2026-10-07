/* eslint-disable global-require */
/* eslint-disable require-await, sort-keys */
const { createJiti } = require("jiti");

const createAutocompleteFixture = async () => {
  const { Window } = await import("happy-dom");
  const dom = new Window({ url: "http://localhost" });
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
    "InputEvent",
    "FocusEvent",
    "CompositionEvent",
    "CustomEvent",
    "FormData",
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
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const jiti = createJiti(__filename, {
    alias: { "@": process.cwd() },
    fsCache: false,
    jsx: { runtime: "automatic" },
  });
  let root;
  let host;
  return {
    React,
    async cleanup() {
      if (root) {
        await React.act(async () => root.unmount());
        root = null;
        host.remove();
      }
      await dom.happyDOM.abort();
    },
    dom,
    async input(value) {
      const input = document.querySelector('[role="combobox"]');
      await React.act(async () => {
        input.focus();
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value"
        ).set.call(input, value);
        input.dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            inputType: "insertText",
            data: value,
          })
        );
      });
    },
    jiti,
    async key(key, options = {}) {
      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key,
        ...options,
      });
      await React.act(async () => document.activeElement.dispatchEvent(event));
      return event.defaultPrevented;
    },
    async render(element) {
      if (!root) {
        host = document.createElement("div");
        document.body.append(host);
        root = createRoot(host);
      }
      await React.act(async () => root.render(element));
    },
  };
};
module.exports = { createAutocompleteFixture };
