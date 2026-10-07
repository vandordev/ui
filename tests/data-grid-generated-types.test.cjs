const assert = require("node:assert/strict");
const { test } = require("node:test");
const { mkdtempSync, writeFileSync, rmSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { createJiti } = require("jiti");

test("generated page and cursor TSX compile against actual public modules", () => {
  const root = process.cwd();
  const jiti = createJiti(__filename, { alias: { "@": root }, fsCache: false });
  const { getDataGridCode, getDataGridDefaults } = jiti(
    "../lib/data-grid-playground.ts"
  );
  const directory = mkdtempSync("/tmp/opencode/data-grid-generated-");
  try {
    for (const pagination of ["page", "cursor"]) {
      for (const scenario of [
        "ready",
        "empty",
        "error",
        "inactive",
        "loading",
      ]) {
        writeFileSync(
          path.join(directory, `${pagination}-${scenario}.tsx`),
          getDataGridCode({
            ...getDataGridDefaults(),
            pagination,
            scenario,
            filterMode: "apply",
            selectionMode: "allMatching",
            variant: "bordered",
            density: "compact",
            stickyHeader: true,
          })
        );
      }
    }
    writeFileSync(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({
        extends: path.join(root, "tsconfig.json"),
        compilerOptions: {
          incremental: false,
          plugins: [],
          typeRoots: [path.join(root, "node_modules/@types")],
          baseUrl: root,
          paths: {
            "@/components/ui/*": ["registry/new-york/*"],
            "@/components/data-grid": ["registry/new-york/data-grid-index.ts"],
            "@/components/data-grid/schema": [
              "registry/new-york/data-grid-schema-entry.ts",
            ],
            "@/*": ["*"],
            react: ["node_modules/@types/react"],
            "@tanstack/react-query": ["node_modules/@tanstack/react-query"],
            zod: ["node_modules/zod"],
          },
        },
        include: [path.join(directory, "*.tsx")],
        exclude: [],
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
        encoding: "utf8",
        timeout: 100000,
        maxBuffer: 16000,
        env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=512" },
      }
    );
    assert.equal(
      check.status,
      0,
      `Generated consumer typecheck failed: ${(check.stdout + check.stderr).slice(0, 12000)}`
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
