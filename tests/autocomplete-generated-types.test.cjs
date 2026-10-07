const assert = require("node:assert/strict");
const { test } = require("node:test");
const { mkdtempSync, writeFileSync, rmSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { createJiti } = require("jiti");
test("generated four-mode code compiles with public imports and escaped strings", () => {
  const root = process.cwd();
  const p = createJiti(__filename, { alias: { "@": root }, fsCache: false })(
    "../lib/autocomplete-playground.ts"
  );
  const directory = mkdtempSync("/tmp/opencode/autocomplete-generated-");
  try {
    for (const mode of ["free-text", "selection"]) {
      for (const multiple of [false, true]) {
        for (const scenario of [
          "ready",
          "loading",
          "error",
          "empty",
          "hint",
          "background",
          "more",
          "page-loading",
          "page-error",
          "end",
        ]) {
          writeFileSync(
            path.join(directory, `${mode}-${multiple}-${scenario}.tsx`),
            p.getAutocompleteCode({
              ...p.getAutocompleteDefaults(),
              clearable: true,
              grouping: true,
              label: 'Label "quoted"\n<safe>',
              labelStyle: "floating",
              mode,
              multiple,
              placeholder: 'Type "value"\n<safe>',
              scenario,
              showTrigger: true,
              size: "sm",
            })
          );
        }
      }
    }
    writeFileSync(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          baseUrl: root,
          incremental: false,
          paths: {
            "@/components/ui/*": ["registry/new-york/*"],
            "@/components/autocomplete": [
              "registry/new-york/autocomplete-index.ts",
            ],
            "@/*": ["*"],
            react: ["node_modules/@types/react"],
          },
          plugins: [],
          typeRoots: [path.join(root, "node_modules/@types")],
        },
        exclude: [],
        extends: path.join(root, "tsconfig.json"),
        include: [path.join(directory, "*.tsx")],
      })
    );
    const check = spawnSync(
      "timeout",
      [
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        process.execPath,
        path.join(root, "node_modules/typescript/bin/tsc"),
        "-p",
        path.join(directory, "tsconfig.json"),
      ],
      {
        cwd: root,
        encoding: "utf-8",
        env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=512" },
        maxBuffer: 16_000,
      }
    );
    assert.equal(
      check.status,
      0,
      (check.stdout + check.stderr).slice(0, 12_000)
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
