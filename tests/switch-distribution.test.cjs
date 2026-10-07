/* eslint-disable global-require -- Consumer code is generated from current registry artifacts and playground configuration. */
const assert = require("node:assert/strict");
const {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
  rmSync,
} = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { test } = require("node:test");
const { createJiti } = require("jiti");

test("Switch artifacts and generated demos compile in an isolated consumer", () => {
  const project = process.cwd();
  const directory = mkdtempSync("/tmp/opencode/switch-consumer-");
  try {
    symlinkSync(
      path.join(project, "node_modules"),
      path.join(directory, "node_modules"),
      "dir"
    );
    const ui = path.join(directory, "src/widgets/controls");
    mkdirSync(ui, { recursive: true });
    for (const name of ["switch", "switch-stories"]) {
      const artifact = JSON.parse(
        readFileSync(`public/r/${name}.json`, "utf-8")
      );
      writeFileSync(
        path.join(ui, name === "switch" ? "switch.tsx" : "switch.stories.tsx"),
        artifact.files[0].content
      );
    }
    const { getSwitchCode, getSwitchDefaults } = createJiti(__filename, {
      alias: { "@": project },
      fsCache: false,
    })("../lib/switch-playground.ts");
    const configurations = [
      getSwitchDefaults(),
      {
        ...getSwitchDefaults(),
        animated: false,
        defaultChecked: true,
        disabled: true,
        invalid: true,
        label: 'Save "draft" <tag> {value}\nnext',
        readOnly: true,
        size: "sm",
      },
    ];
    for (const [index, values] of configurations.entries()) {
      writeFileSync(
        path.join(directory, `demo-${index}.tsx`),
        getSwitchCode(values).replaceAll(
          "@/components/ui/switch",
          "~/widgets/controls/switch"
        )
      );
    }
    writeFileSync(
      path.join(directory, "consumer.tsx"),
      `import { Switch } from "~/widgets/controls/switch";
import { createRef } from "react";
export function Consumer() {
  return <Switch ref={createRef<HTMLSpanElement>()} inputRef={createRef<HTMLInputElement>()} checked onCheckedChange={(_, details) => details.cancel()} dir="rtl" name="setting" value="yes" uncheckedValue="no" required className={(state) => state.checked ? "checked" : "unchecked"} />;
}`
    );
    writeFileSync(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          incremental: false,
          paths: {
            react: [path.join(project, "node_modules/@types/react")],
            "~/*": [path.join(directory, "src/*")],
          },
          plugins: [],
          typeRoots: [path.join(project, "node_modules/@types")],
        },
        exclude: ["node_modules"],
        extends: path.join(project, "tsconfig.json"),
        include: ["**/*.tsx"],
      })
    );
    const result = spawnSync(
      "timeout",
      [
        "--signal=TERM",
        "--kill-after=5s",
        "90s",
        process.execPath,
        path.join(project, "node_modules/typescript/bin/tsc"),
        "-p",
        path.join(directory, "tsconfig.json"),
      ],
      {
        encoding: "utf-8",
        env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=512" },
        maxBuffer: 16_000,
        timeout: 100_000,
      }
    );
    assert.equal(
      result.status,
      0,
      `Consumer compilation: ${(result.stdout + result.stderr).slice(0, 12_000)}`
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
