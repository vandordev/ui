const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename, { fsCache: false });
const root = process.cwd();

test("toast duration follows title, detail, persistent state, and explicit override rules", async () => {
  const { getToastDuration } = await jiti.import(
    "../registry/new-york/toast-utils.ts"
  );

  assert.equal(getToastDuration({}), 3000);
  assert.equal(getToastDuration({ description: "" }), 3000);
  assert.equal(getToastDuration({ description: "Saved." }), 4000);
  assert.equal(getToastDuration({ action: true, type: "success" }), 4000);
  assert.equal(getToastDuration({ type: "action" }), 3000);
  assert.equal(getToastDuration({ type: "error" }), 3000);
  assert.equal(getToastDuration({ type: "warning" }), 3000);
  assert.equal(getToastDuration({ duration: 2500, type: "error" }), 2500);
  assert.equal(getToastDuration({ duration: 2500, type: "loading" }), 0);
  assert.equal(getToastDuration({ duration: -1 }), 0);
});

test("toast error fallback never exposes raw error details", async () => {
  const { getToastMessage } = await jiti.import(
    "../registry/new-york/toast-utils.ts"
  );

  assert.equal(
    getToastMessage(new Error("secret token from server")),
    "Something went wrong. Please try again."
  );
  assert.equal(
    getToastMessage({ payload: "private response" }),
    "Something went wrong. Please try again."
  );
});

test("Toast distribution keeps support files and optional integrations separate", () => {
  const registry = JSON.parse(
    readFileSync(join(root, "registry.json"), "utf-8")
  );
  const toastItem = registry.items.find((item) => item.name === "toast");
  const storiesItem = registry.items.find(
    (item) => item.name === "toast-stories"
  );
  const adapterItem = registry.items.find(
    (item) => item.name === "toast-tanstack-query"
  );
  const toastArtifact = JSON.parse(
    readFileSync(join(root, "public/r/toast.json"), "utf-8")
  );
  const storiesArtifact = JSON.parse(
    readFileSync(join(root, "public/r/toast-stories.json"), "utf-8")
  );
  const adapterArtifact = JSON.parse(
    readFileSync(join(root, "public/r/toast-tanstack-query.json"), "utf-8")
  );

  assert.deepEqual(
    toastItem.files.map((file) => file.path),
    ["registry/new-york/toast.tsx", "registry/new-york/toast-utils.ts"]
  );
  assert.ok(
    !toastItem.dependencies.some((dependency) =>
      dependency.includes("tanstack")
    )
  );
  assert.deepEqual(
    toastArtifact.files.map((file) => file.content),
    toastItem.files.map((file) => readFileSync(join(root, file.path), "utf-8"))
  );
  assert.equal(storiesItem.files.length, 1);
  assert.equal(storiesArtifact.type, "registry:item");
  assert.deepEqual(adapterItem.registryDependencies, [
    "https://vandor-ui.vercel.app/r/toast.json",
  ]);
  assert.equal(adapterArtifact.type, "registry:item");
  assert.match(
    readFileSync(join(root, "registry/new-york/toast.tsx"), "utf-8"),
    /createToastManager/
  );
  assert.doesNotMatch(
    readFileSync(join(root, "registry/new-york/toast.tsx"), "utf-8"),
    /@tanstack\/react-query/
  );
});
