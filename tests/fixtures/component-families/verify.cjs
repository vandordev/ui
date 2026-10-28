// Serial real CLI matrix; no repository runtime module fallthrough or servers.
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const {
  prepareFamilyArtifacts,
} = require("../../../scripts/component-family-artifacts.cjs");

const repository = path.resolve(__dirname, "../../..");
const manifestPath = path.resolve(
  path.dirname(require.resolve("shadcn")),
  "../package.json"
);
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
const cli = path.resolve(
  path.dirname(manifestPath),
  typeof manifest.bin === "string" ? manifest.bin : manifest.bin.shadcn
);
const root = mkdtempSync("/tmp/opencode/family-consumer-");
const run = (cwd, command, args, seconds = 180, heap = 512) => {
  console.log(`${path.basename(cwd)}: START ${command} ${args.join(" ")}`);
  const result = spawnSync(
    "timeout",
    ["--signal=TERM", "--kill-after=5s", `${seconds}s`, command, ...args],
    {
      cwd,
      encoding: "utf-8",
      env: {
        ...process.env,
        CI: "1",
        NODE_OPTIONS: `--max-old-space-size=${heap}`,
        UV_THREADPOOL_SIZE: "1",
      },
      maxBuffer: 16_000,
    }
  );
  if (result.status !== 0) {
    throw new Error(
      `${command} exited ${result.status}: ${(result.stdout + result.stderr).slice(-8000)}`
    );
  }
};
const hash = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
try {
  for (const layout of [
    {
      components: "components",
      name: "default",
      src: false,
      ui: "components/ui",
    },
    {
      components: "shared",
      name: "divergent",
      src: false,
      ui: "primitives",
    },
    {
      components: "shared",
      name: "src-divergent",
      src: true,
      ui: "primitives",
    },
    { components: "shared", name: "schema-only", src: false, ui: "primitives" },
  ]) {
    if (
      process.env.FAMILY_VERIFY_LAYOUT &&
      process.env.FAMILY_VERIFY_LAYOUT !== layout.name
    ) {
      continue;
    }
    const cwd = path.join(root, layout.name);
    const source = layout.src ? "src/" : "";
    mkdirSync(path.join(cwd, `${source}app`), { recursive: true });
    const outputDirectory = path.join(cwd, "local-registry");
    mkdirSync(outputDirectory);
    const schemaOnly = layout.name === "schema-only";
    const packageJson = schemaOnly
      ? {
          dependencies: { zod: "^4.3.6" },
          devDependencies: { typescript: "6.0.3" },
          name: layout.name,
          private: true,
        }
      : JSON.parse(
          readFileSync(
            path.join(
              repository,
              "tests/fixtures/autocomplete-consumer/package.json.template"
            ),
            "utf-8"
          )
        );
    writeFileSync(path.join(cwd, "package.json"), JSON.stringify(packageJson));
    writeFileSync(
      path.join(cwd, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          jsx: "react-jsx",
          module: "esnext",
          moduleResolution: "bundler",
          noEmit: true,
          paths: { "@/*": [`./${source}*`] },
          skipLibCheck: true,
          strict: true,
          target: "es2023",
        },
        exclude: ["node_modules"],
        include: [`${source}**/*.ts`, `${source}**/*.tsx`],
      })
    );
    writeFileSync(path.join(cwd, `${source}app/globals.css`), "");
    writeFileSync(
      path.join(cwd, "components.json"),
      JSON.stringify({
        aliases: {
          components: `@/${layout.components}`,
          hooks: "@/hooks",
          lib: "@/lib",
          ui: `@/${layout.ui}`,
          utils: "@/lib/utils",
        },
        rsc: true,
        style: "new-york",
        tailwind: {
          baseColor: "neutral",
          config: "",
          css: `${source}app/globals.css`,
          cssVariables: true,
        },
        tsx: true,
      })
    );
    run(
      cwd,
      "pnpm",
      [
        "install",
        "--no-frozen-lockfile",
        "--network-concurrency=1",
        "--child-concurrency=1",
      ],
      240
    );
    const add = (name) => {
      const artifact = prepareFamilyArtifacts({
        artifactDirectory: path.join(repository, "public/r"),
        cwd,
        name,
        outputDirectory,
      });
      run(
        cwd,
        process.execPath,
        [cli, "add", artifact, "--cwd", cwd, "--yes"],
        240
      );
    };
    const compile = () =>
      run(
        cwd,
        process.execPath,
        [path.join(cwd, "node_modules/typescript/bin/tsc"), "--noEmit"],
        120,
        768
      );
    if (schemaOnly) {
      add("data-grid-schema");
      writeFileSync(
        path.join(cwd, "server.ts"),
        `import * as schema from "@/${layout.components}/data-grid/schema"; export const serverSchema = schema;`
      );
      compile();
      for (const dependency of [
        "react",
        "@tanstack/react-query",
        "@tanstack/react-table",
      ]) {
        assert.throws(() => require.resolve(dependency, { paths: [cwd] }), {
          code: "MODULE_NOT_FOUND",
        });
      }
      console.log(
        "schema-only: PASS — real CLI, server-safe compile, React/Query/Table absent"
      );
      continue;
    }
    add("date-time");
    writeFileSync(
      path.join(cwd, `${source}date-time.tsx`),
      `import { DateTime, formatDate } from "@/${layout.components}/date-time"; export const Instant = () => <DateTime value="2026-10-24T08:00:00Z" />; export const formatted = formatDate(0);`
    );
    assert.throws(
      () => require.resolve("@tanstack/react-query", { paths: [cwd] }),
      { code: "MODULE_NOT_FOUND" }
    );
    compile();
    add("app-shell");
    writeFileSync(
      path.join(cwd, `${source}shell.tsx`),
      `import { AppShell } from "@/${layout.ui}/app-shell"; export const Shell = () => <AppShell brand={{ name: "Consumer" }} navigation={[]} showHeader={false} user={{ name: "Avery", items: [] }}>Content</AppShell>;`
    );
    add("autocomplete");
    writeFileSync(
      path.join(cwd, `${source}core.tsx`),
      `import { Autocomplete } from "@/${layout.components}/autocomplete"; export const Core = () => <Autocomplete items={["Ada"]} />;`
    );
    assert.throws(
      () => require.resolve("@tanstack/react-query", { paths: [cwd] }),
      { code: "MODULE_NOT_FOUND" }
    );
    compile();
    add("autocomplete-query");
    add("data-grid");
    const types = readFileSync(
      path.join(repository, "tests/autocomplete-query.types.tsx"),
      "utf-8"
    )
      .replaceAll(
        "../registry/new-york/autocomplete-query-types",
        `@/${layout.components}/autocomplete/autocomplete-query-types`
      )
      .replaceAll(
        "../registry/new-york/autocomplete-query",
        `@/${layout.components}/autocomplete/query`
      )
      .replaceAll(
        "../registry/new-york/autocomplete",
        `@/${layout.components}/autocomplete`
      );
    writeFileSync(path.join(cwd, `${source}query-types.tsx`), types);
    writeFileSync(
      path.join(cwd, `${source}grid.tsx`),
      `import * as grid from "@/${layout.components}/data-grid"; import * as schema from "@/${layout.components}/data-grid/schema"; export const InstalledGrid = grid; export const InstalledSchema = schema;`
    );
    writeFileSync(
      path.join(cwd, `${source}source-types.tsx`),
      readFileSync(
        path.join(repository, "tests/data-grid-source.types.tsx"),
        "utf-8"
      )
        .replaceAll(
          "../registry/new-york/data-grid-schema",
          `@/${layout.components}/data-grid/schema`
        )
        .replaceAll(
          "../registry/new-york/use-data-grid-source",
          `@/${layout.components}/data-grid`
        )
        .replaceAll(
          "../registry/new-york/data-grid-index",
          `@/${layout.components}/data-grid`
        )
        .replaceAll(
          "../registry/new-york/data-grid-context",
          `@/${layout.components}/data-grid/data-grid-context`
        )
    );
    compile();
    for (const family of ["date-time", "autocomplete", "data-grid"]) {
      const directory = path.join(cwd, source, layout.components, family);
      const entry = path.join(directory, "index.ts");
      writeFileSync(
        entry,
        `${readFileSync(entry, "utf-8")}\n// Consumer customization\n`
      );
      const before = Object.fromEntries(
        readdirSync(directory).map((file) => [
          file,
          hash(path.join(directory, file)),
        ])
      );
      add(`${family}-stories`);
      for (const [file, checksum] of Object.entries(before)) {
        assert.equal(
          hash(path.join(directory, file)),
          checksum,
          `${family}/${file} preserved`
        );
      }
    }
    const shellCore = path.join(cwd, source, layout.ui, "app-shell.tsx");
    writeFileSync(
      shellCore,
      `${readFileSync(shellCore, "utf-8")}\n// Consumer customization\n`
    );
    const shellHash = hash(shellCore);
    add("app-shell-stories");
    assert.equal(
      hash(shellCore),
      shellHash,
      "AppShell stories preserve customized core"
    );
    compile();
    console.log(
      `${layout.name}: PASS — Query-free DateTime/UI, AppShell closure, Query selected-page types, DataGrid source/schema entries, actual stories types and customized-core checksums`
    );
  }
  console.log(
    process.env.FAMILY_VERIFY_LAYOUT
      ? `GATE-FAMILY-CASE: PASS — ${process.env.FAMILY_VERIFY_LAYOUT}`
      : "GATE-FAMILY-MATRIX: PASS"
  );
} catch (error) {
  console.error(`GATE-FAMILY-MATRIX: FAIL/BLOCKED — ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(root, { force: true, recursive: true });
}
