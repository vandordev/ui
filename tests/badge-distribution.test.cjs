const assert = require("node:assert/strict");
const {
  readFileSync,
  mkdtempSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const registry = require("../registry.json");

test("Badge artifacts preserve source, license, alias portability and theme tokens without stories dependencies", () => {
  for (const name of ["badge", "badge-stories"]) {
    const item = registry.items.find((item) => item.name === name);
    const artifact = JSON.parse(readFileSync(`public/r/${name}.json`, "utf8"));
    for (const key of [
      "type",
      "dependencies",
      "registryDependencies",
      "devDependencies",
      "cssVars",
    ])
      assert.deepEqual(artifact[key], item[key]);
    assert.equal(artifact.files.length, 1);
    const file = artifact.files[0];
    assert.equal(file.target, undefined);
    assert.equal(file.path, item.files[0].path);
    assert.equal(file.content, readFileSync(file.path, "utf8"));
    assert.equal(file.content.includes("@/"), false);
    if (name === "badge") {
      assert.ok(file.content.startsWith('"use client";'));
      assert.ok(file.content.includes("Copyright (c) 2025 Keenthemes Inc"));
      assert.ok(file.content.includes("THE SOFTWARE IS PROVIDED"));
      assert.equal(file.content.includes("styles/globals"), false);
      assert.equal(
        item.dependencies.some((dependency) =>
          dependency.includes("storybook")
        ),
        false
      );
      const normalize = (value) =>
        value.replace(/\d+\.\d+/g, (number) => String(Number(number)));
      const stylesheet = normalize(readFileSync("styles/globals.css", "utf8"));
      for (const [scope, variables] of Object.entries(item.cssVars)) {
        for (const [key, value] of Object.entries(variables)) {
          assert.ok(
            stylesheet.includes(normalize(`--${key}: ${value.toLowerCase()};`)),
            `Website and consumer token ${scope}.${key} match`
          );
        }
      }
    } else {
      for (const key of [
        "dependencies",
        "devDependencies",
        "registryDependencies",
      ])
        assert.deepEqual(item[key] ?? [], []);
    }
  }
});

test("Badge generated examples compile with all public variants against generated artifact source", () => {
  const root = process.cwd();
  const directory = mkdtempSync("/tmp/opencode/badge-generated-");
  try {
    symlinkSync(
      path.join(root, "node_modules"),
      path.join(directory, "node_modules"),
      "dir"
    );
    const jiti = createJiti(__filename, {
      alias: { "@": root },
      fsCache: false,
    });
    const { getBadgeCode, getBadgeDefaults, badgeProps } = jiti(
      "../lib/badge-playground.ts"
    );
    const source = JSON.parse(readFileSync("public/r/badge.json", "utf8"))
      .files[0].content;
    writeFileSync(path.join(directory, "badge.tsx"), source);
    badgeProps.variant.control.options.forEach((variant, index) => {
      writeFileSync(
        path.join(directory, `demo-${index}.tsx`),
        getBadgeCode({
          ...getBadgeDefaults(),
          variant,
          size: "xl",
          radius: "full",
          indicator: ["none", "dot", "icon", "spinner"][index % 4],
          children: 'Status "quoted" <tag>\nnext',
        })
      );
    });
    writeFileSync(
      path.join(directory, "stories.tsx"),
      JSON.parse(readFileSync("public/r/badge-stories.json", "utf8")).files[0]
        .content
    );
    writeFileSync(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({
        extends: path.join(root, "tsconfig.json"),
        compilerOptions: {
          incremental: false,
          plugins: [],
          typeRoots: [path.join(root, "node_modules/@types")],
          paths: {
            "@/components/ui/badge": [path.join(directory, "badge.tsx")],
            react: [path.join(root, "node_modules/@types/react")],
          },
        },
        include: [path.join(directory, "*.tsx")],
        exclude: [],
      })
    );
    const result = spawnSync(
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
        encoding: "utf8",
        timeout: 100000,
        maxBuffer: 16000,
        env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=512" },
      }
    );
    assert.equal(
      result.status,
      0,
      `Artifact/generated typecheck: ${(result.stdout + result.stderr).slice(0, 12000)}`
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
