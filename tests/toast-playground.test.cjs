const assert = require("node:assert/strict");
const ts = require("typescript");
const test = require("node:test");
const { createJiti } = require("jiti");
const jiti = createJiti(__filename, {
  alias: { "@": process.cwd() },
  fsCache: false,
});
test("Toast playground serializes action and duration with preview parity", async () => {
  const { getToastDefaults, getToastCode, getToastPreviewOptions } =
    await jiti.import("../lib/toast-playground.ts");
  const values = {
    ...getToastDefaults(),
    action: true,
    actionLabel: "Undo",
    customDuration: true,
    description: "Detail",
    duration: 2500,
    position: "bottom-left",
    title: 'A "quoted"\nmessage',
  };
  let invoked = false;
  const options = getToastPreviewOptions(values, () => {
    invoked = true;
  });
  options.actionOnClick();
  assert.ok(invoked, "preview forwards the action callback");
  assert.equal(options.duration, 2500);
  assert.equal(options.actionLabel, "Undo");
  assert.equal(options.description, "Detail");
  const code = getToastCode(values);
  assert.ok(code.includes('position="bottom-left"'));
  assert.ok(code.includes("duration: 2500"));
  assert.ok(code.includes('actionLabel: "Undo"'));
  assert.ok(code.includes(JSON.stringify(values.title)));
  assert.ok(code.includes("ToastProvider"));
  const result = ts.transpileModule(code, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.equal(result.diagnostics.length, 0);
});
