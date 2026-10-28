const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { createJiti } = require("jiti");
const manifest = require("../registry.json");

const project = process.cwd();
const run = (cwd, executable, args) =>
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
      cwd,
      encoding: "utf-8",
      env: {
        ...process.env,
        CI: "true",
        NODE_OPTIONS: "--max-old-space-size=512",
        UV_THREADPOOL_SIZE: "1",
        npm_config_offline: "true",
      },
      maxBuffer: 16_000,
      timeout: 95_000,
    }
  );
const success = (result) =>
  assert.equal(
    result.status,
    0,
    (result.stdout + result.stderr).slice(0, 12_000)
  );

test("Frame artifacts install through shadcn into a divergent alias and stories preserve customized core", () => {
  const directory = mkdtempSync("/tmp/opencode/frame-consumer-");
  try {
    mkdirSync(path.join(directory, "src/styles"), { recursive: true });
    writeFileSync(
      path.join(directory, "src/styles/globals.css"),
      '@import "tailwindcss";\n'
    );
    const packageContent = JSON.stringify({
      dependencies: { cn: "^0.4.0" },
      name: "frame-consumer",
      private: true,
      version: "1.0.0",
    });
    writeFileSync(path.join(directory, "package.json"), packageContent);
    writeFileSync(
      path.join(directory, "components.json"),
      JSON.stringify({
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
      })
    );
    writeFileSync(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          esModuleInterop: true,
          ignoreDeprecations: "6.0",
          jsx: "react-jsx",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          paths: {
            react: [path.join(project, "node_modules/@types/react")],
            "~/*": ["./src/*"],
          },
          skipLibCheck: true,
          strict: true,
          target: "ES2022",
        },
        include: ["src/**/*.tsx", "generated*.tsx"],
      })
    );
    const cli = path.join(project, "node_modules/shadcn/dist/index.js");
    success(
      run(directory, cli, [
        "add",
        path.join(project, "public/r/frame.json"),
        "--yes",
        "--silent",
      ])
    );
    const installed = path.join(directory, "src/widgets/controls/frame.tsx");
    const source = readFileSync(installed, "utf-8");
    assert.match(source, /export const Frame/);
    const customized = `${source}\n// Consumer customization must survive stories installation.\n`;
    writeFileSync(installed, customized);
    success(
      run(directory, cli, [
        "add",
        path.join(project, "public/r/frame-stories.json"),
        "--yes",
        "--silent",
      ])
    );
    assert.equal(readFileSync(installed, "utf-8"), customized);
    assert.equal(
      readFileSync(path.join(directory, "package.json"), "utf-8"),
      packageContent
    );
    assert.match(
      readFileSync(
        path.join(directory, "src/widgets/controls/frame.stories.tsx"),
        "utf-8"
      ),
      /from ["']\.\/frame["']/
    );
    // The real core CLI installs cn. Supply only the declared peer/story toolchain
    // from this checkout, never resolve component source through repository aliases.
    mkdirSync(path.join(directory, "node_modules"), { recursive: true });
    for (const name of ["react", "@types", "@storybook"]) {
      const target = path.join(directory, "node_modules", name);
      if (!existsSync(target)) {
        symlinkSync(path.join(project, "node_modules", name), target, "dir");
      }
    }
    const jiti = createJiti(__filename, {
      alias: { "@": project },
      fsCache: false,
      jsx: { runtime: "automatic" },
    });
    const { getFrameCode, getFrameDefaults } = jiti(
      "../lib/frame-playground.ts"
    );
    for (const [index, values] of [
      getFrameDefaults(),
      {
        ...getFrameDefaults(),
        dense: true,
        fit: true,
        spacing: "lg",
        stacked: true,
        title: 'A "quoted" <title> {}',
        variant: "ghost",
      },
    ].entries()) {
      writeFileSync(
        path.join(directory, `generated-${index}.tsx`),
        getFrameCode(values).replaceAll(
          "@/components/ui/frame",
          "~/widgets/controls/frame"
        )
      );
    }
    success(
      run(directory, path.join(project, "node_modules/typescript/bin/tsc"), [
        "-p",
        path.join(directory, "tsconfig.json"),
      ])
    );
    for (const name of ["frame", "frame-stories"]) {
      const item = manifest.items.find((entry) => entry.name === name);
      const artifact = JSON.parse(
        readFileSync(path.join(project, `public/r/${name}.json`), "utf-8")
      );
      assert.equal(artifact.files.length, 1);
      assert.equal(artifact.files[0].target, undefined);
      assert.equal(
        artifact.files[0].content,
        readFileSync(path.join(project, item.files[0].path), "utf-8")
      );
      assert.deepEqual(artifact.registryDependencies ?? [], []);
    }
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
