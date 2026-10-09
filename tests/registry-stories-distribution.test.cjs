const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const names = [
  "loading",
  "input",
  "textarea",
  "input-group",
  "input-password",
  "input-search",
  "input-amount",
  "input-phone",
  "input-otp",
  "input-secret",
];
const project = process.cwd();
const run = (directory, executable, args, heap = 512) =>
  spawnSync(
    "timeout",
    [
      "--signal=TERM",
      "--kill-after=5s",
      "90s",
      process.execPath,
      executable,
      ...args,
    ],
    {
      cwd: directory,
      encoding: "utf-8",
      env: {
        ...process.env,
        CI: "true",
        NODE_OPTIONS: `--max-old-space-size=${heap}`,
        npm_config_offline: "true",
      },
      maxBuffer: 16_000,
      timeout: 100_000,
    }
  );

test("real shadcn stories-only installation honors a divergent UI alias without overwriting customized components or packages", () => {
  const directory = mkdtempSync("/tmp/opencode/registry-stories-cli-");
  try {
    const ui = path.join(directory, "src/widgets/controls");
    mkdirSync(ui, { recursive: true });
    mkdirSync(path.join(directory, "src/styles"), { recursive: true });
    writeFileSync(
      path.join(directory, "src/styles/globals.css"),
      '@import "tailwindcss";\n'
    );
    const packageContent = JSON.stringify({
      name: "stories-consumer",
      private: true,
      version: "1.0.0",
    });
    writeFileSync(path.join(directory, "package.json"), packageContent);
    writeFileSync(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "~/*": ["./src/*"] } } })
    );
    const configContent = JSON.stringify({
      $schema: "https://ui.shadcn.com/schema.json",
      aliases: {
        components: "~/widgets",
        hooks: "~/hooks",
        lib: "~/lib",
        ui: "~/widgets/controls",
        utils: "~/lib/utils",
      },
      rsc: true,
      style: "base-nova",
      tailwind: {
        baseColor: "neutral",
        config: "",
        css: "src/styles/globals.css",
        cssVariables: true,
        prefix: "",
      },
      tsx: true,
    });
    writeFileSync(path.join(directory, "components.json"), configContent);
    const customized =
      "// Consumer-owned customized component.\nexport const customized = true;\n";
    for (const name of names) {
      writeFileSync(path.join(ui, `${name}.tsx`), customized);
    }
    const result = run(
      directory,
      path.join(project, "node_modules/shadcn/dist/index.js"),
      [
        "add",
        ...names.map((name) =>
          path.join(project, `public/r/${name}-stories.json`)
        ),
        "--cwd",
        directory,
        "--yes",
        "--silent",
      ]
    );
    assert.equal(
      result.status,
      0,
      `CLI result: ${(result.stdout + result.stderr).slice(0, 12_000)}`
    );
    for (const name of names) {
      assert.ok(
        existsSync(path.join(ui, `${name}.stories.tsx`)),
        `${name}: CLI must honor UI alias`
      );
      assert.equal(
        readFileSync(path.join(ui, `${name}.tsx`), "utf-8"),
        customized,
        `${name}: core must stay untouched`
      );
      const story = readFileSync(path.join(ui, `${name}.stories.tsx`), "utf-8");
      assert.match(story, new RegExp(`from ["']\\./${name}["']`));
    }
    assert.equal(
      readFileSync(path.join(directory, "package.json"), "utf-8"),
      packageContent
    );
    assert.equal(
      readFileSync(path.join(directory, "components.json"), "utf-8"),
      configContent
    );
    assert.equal(
      readFileSync(path.join(directory, "src/styles/globals.css"), "utf-8"),
      '@import "tailwindcss";\n'
    );
    assert.ok(
      !existsSync(path.join(directory, ".storybook")),
      "Stories installation must not configure Storybook"
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("all new stories compile against their installed artifact dependency graph without repository source aliases", () => {
  const directory = mkdtempSync("/tmp/opencode/registry-stories-types-");
  try {
    symlinkSync(
      path.join(project, "node_modules"),
      path.join(directory, "node_modules"),
      "dir"
    );
    const seen = new Set();
    const install = (name) => {
      if (seen.has(name)) {
        return;
      }
      seen.add(name);
      const item = JSON.parse(
        readFileSync(path.join(project, `public/r/${name}.json`), "utf-8")
      );
      for (const dependency of item.registryDependencies ?? []) {
        install(path.basename(dependency, ".json"));
      }
      for (const file of item.files) {
        const relative =
          file.type === "registry:ui"
            ? `src/widgets/controls/${path.basename(file.path)}`
            : file.target.replace(/^components\//, "src/widgets/");
        const target = path.join(directory, relative);
        mkdirSync(path.dirname(target), { recursive: true });
        // Apply the consumer alias transform to Loading's declared snapshot imports.
        const content = file.content.replaceAll("@/components/", "~/widgets/");
        assert.ok(
          !content.includes('from "@/'),
          `${file.path}: unportable import`
        );
        writeFileSync(target, content);
      }
    };
    for (const name of names) {
      install(name);
      install(`${name}-stories`);
    }
    // Compile one public story entry at a time. Imports still pull in its full
    // installed graph, without accumulating all ten Storybook generic graphs.
    for (const name of names) {
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
          include: [`src/widgets/controls/${name}.stories.tsx`],
        })
      );
      const result = run(
        directory,
        path.join(project, "node_modules/typescript/bin/tsc"),
        ["-p", path.join(directory, "tsconfig.json")],
        1024
      );
      assert.equal(
        result.status,
        0,
        `${name} consumer typecheck: ${(result.stdout + result.stderr).slice(0, 12_000)}`
      );
    }
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
