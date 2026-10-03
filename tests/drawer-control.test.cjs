// Async act must flush microtasks; DOM globals must exist before React DOM is required.
/* eslint-disable require-await, global-require */
const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { createJiti } = require("jiti");

let dom;
let React;
let createRoot;
let drawer;
let root;
let host;

const ready = (async () => {
  const { Window } = await import("happy-dom");
  dom = new Window({ url: "http://localhost" });
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
  drawer = createJiti(__filename, {
    fsCache: false,
    jsx: { runtime: "automatic" },
  })("../registry/new-york/drawer.tsx");
})();

const mount = async (component) => {
  await ready;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await React.act(async () => root.render(component));
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

test("external control and explicit hook follow accepted Base UI state, including cancellation", async () => {
  await ready;
  let control;
  let selected;
  let rejectClose = false;
  const changes = [];
  const el = React.createElement;
  const Consumer = () => {
    selected = drawer.useDrawer(control);
    return el("output", null, String(selected.isOpen));
  };
  const App = () => {
    control = drawer.useDrawerControl();
    return el(
      React.Fragment,
      null,
      el("output", { id: "external-state" }, String(control.isOpen)),
      el(Consumer),
      el(
        drawer.Drawer,
        {
          control,
          onOpenChange: (open, details) => {
            changes.push([open, details.reason]);
            if (!open && rejectClose) {
              details.cancel();
            }
          },
        },
        el(drawer.DrawerTrigger, { id: "trigger" }, "Open")
      )
    );
  };
  await mount(el(App));
  const identity = control;
  await React.act(async () => control.open());
  assert.equal(
    control,
    identity,
    "control binding stays stable across state changes"
  );
  assert.equal(control.isOpen, true);
  assert.equal(selected.isOpen, true);
  assert.equal(document.querySelector("#external-state").textContent, "true");
  assert.deepEqual(changes[0], [true, "imperative-action"]);
  rejectClose = true;
  await React.act(async () => selected.close());
  assert.equal(control.isOpen, true, "cancelled close must not change state");
  rejectClose = false;
  await React.act(async () => selected.close());
  assert.equal(selected.isOpen, false);
  await React.act(async () => document.querySelector("#trigger").click());
  assert.equal(
    control.isOpen,
    true,
    "ordinary triggers update the same controller"
  );
});

test("context hook selects nearest drawer and explicit control selects an outer drawer", async () => {
  await ready;
  const el = React.createElement;
  let outer;
  let inner;
  let explicit;
  const Inner = () => {
    inner = drawer.useDrawer();
    explicit = drawer.useDrawer(outer);
    return null;
  };
  const App = () => {
    outer = drawer.useDrawerControl();
    return el(
      drawer.Drawer,
      { control: outer },
      el(drawer.Drawer, { defaultOpen: true }, el(Inner))
    );
  };
  await mount(el(App));
  assert.equal(outer.isOpen, false);
  assert.equal(inner.isOpen, true);
  await React.act(async () => explicit.open());
  await React.act(async () => inner.close());
  assert.equal(inner.isOpen, false);
  assert.equal(outer.isOpen, true);
});

test("controlled drawers wait for their parent to accept requests", async () => {
  await ready;
  const el = React.createElement;
  let context;
  const changes = [];
  const Child = () => {
    context = drawer.useDrawer();
    return null;
  };
  await mount(
    el(
      drawer.Drawer,
      {
        onOpenChange: (open) => changes.push(open),
        open: true,
      },
      el(Child)
    )
  );
  await React.act(async () => context.close());
  assert.deepEqual(changes, [false]);
  assert.equal(context.isOpen, true);
  await React.act(async () =>
    root.render(el(drawer.Drawer, { open: false }, el(Child)))
  );
  assert.equal(context.isOpen, false);
});

test("render function receives controller and DrawerBody preserves scrolling structure", async () => {
  await ready;
  const el = React.createElement;
  let actions;
  await mount(
    el(
      drawer.Drawer,
      { defaultOpen: true, modal: false },
      el(drawer.DrawerContent, null, (value) => {
        actions = value;
        return el(
          React.Fragment,
          null,
          el(
            drawer.DrawerHeader,
            null,
            el(drawer.DrawerTitle, null, "Settings")
          ),
          el(drawer.DrawerBody, { id: "body" }, "Long content"),
          el(drawer.DrawerFooter, null, "Actions")
        );
      })
    )
  );
  assert.equal(actions.isOpen, true);
  const body = document.querySelector("#body");
  assert.ok(body.classList.contains("min-h-0"));
  assert.ok(body.classList.contains("overflow-y-auto"));
  assert.ok(document.querySelector('[data-slot="drawer-close-button"]'));
  await React.act(async () => actions.close());
  assert.equal(actions.isOpen, false);
});

test("unmounted controls ignore actions and do not queue them for remount", async () => {
  await ready;
  const el = React.createElement;
  let control;
  let setMounted;
  const App = () => {
    control = drawer.useDrawerControl();
    const [mounted, set] = React.useState(false);
    setMounted = set;
    return mounted ? el(drawer.Drawer, { control }) : null;
  };
  await mount(el(App));
  await React.act(async () => control.open());
  await React.act(async () => setMounted(true));
  assert.equal(control.isOpen, false);
  await React.act(async () => control.open());
  assert.equal(control.isOpen, true);
  await React.act(async () => setMounted(false));
  assert.equal(control.isOpen, false);
  await React.act(async () => control.open());
  await React.act(async () => setMounted(true));
  assert.equal(control.isOpen, false);
});

test("missing context, duplicate bindings, and conflicting ownership fail clearly", async () => {
  await ready;
  const el = React.createElement;
  const { renderToStaticMarkup } = require("react-dom/server");
  const Missing = () => {
    drawer.useDrawer();
    return null;
  };
  assert.throws(() => renderToStaticMarkup(el(Missing)), /inside Drawer/);
  const Conflict = () => {
    const control = drawer.useDrawerControl();
    return el(drawer.Drawer, { control, open: true });
  };
  assert.throws(() => renderToStaticMarkup(el(Conflict)), /control.*open/);
  const Duplicate = () => {
    const control = drawer.useDrawerControl();
    return el(
      React.Fragment,
      null,
      el(drawer.Drawer, { control }),
      el(drawer.Drawer, { control })
    );
  };
  await assert.rejects(mount(el(Duplicate)), /one Drawer/);
});

test("Strict Mode preserves controller binding and a mounted drawer can switch controllers", async () => {
  await ready;
  const el = React.createElement;
  let first;
  let second;
  let switchControl;
  const App = () => {
    first = drawer.useDrawerControl();
    second = drawer.useDrawerControl();
    const [useSecond, setUseSecond] = React.useState(false);
    switchControl = setUseSecond;
    return el(
      React.Fragment,
      null,
      el("output", { id: "first-state" }, String(first.isOpen)),
      el("output", { id: "second-state" }, String(second.isOpen)),
      el(drawer.Drawer, { control: useSecond ? second : first })
    );
  };
  await mount(el(React.StrictMode, null, el(App)));
  await React.act(async () => first.open());
  assert.equal(first.isOpen, true);
  await React.act(async () => switchControl(true));
  assert.equal(first.isOpen, false);
  assert.equal(second.isOpen, true);
  assert.equal(document.querySelector("#first-state").textContent, "false");
  assert.equal(document.querySelector("#second-state").textContent, "true");
  await React.act(async () => second.close());
  assert.equal(second.isOpen, false);
});

test("cancelled opening leaves both context and external consumers closed", async () => {
  await ready;
  const el = React.createElement;
  let control;
  let context;
  const Child = () => {
    context = drawer.useDrawer();
    return el("output", null, String(context.isOpen));
  };
  const App = () => {
    control = drawer.useDrawerControl();
    return el(
      drawer.Drawer,
      {
        control,
        onOpenChange: (_, details) => details.cancel(),
      },
      el(Child)
    );
  };
  await mount(el(App));
  await React.act(async () => control.open());
  assert.equal(control.isOpen, false);
  assert.equal(context.isOpen, false);
  assert.equal(document.querySelector("output").textContent, "false");
});
