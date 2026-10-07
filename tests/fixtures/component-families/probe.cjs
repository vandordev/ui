// Real shadcn capability probe. No server, repository aliases, or runtime symlinks.
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");

const repository = path.resolve(__dirname, "../../..");
const cliManifest = path.resolve(
  path.dirname(require.resolve("shadcn", { paths: [repository] })),
  "../package.json"
);
const cliPackage = JSON.parse(readFileSync(cliManifest, "utf-8"));
const cli = path.resolve(
  path.dirname(cliManifest),
  typeof cliPackage.bin === "string" ? cliPackage.bin : cliPackage.bin.shadcn
);
const root = mkdtempSync("/tmp/opencode/component-families-probe-");
const results = [];

const run = (directory, args) => {
  const result = spawnSync(
    "timeout",
    [
      "--signal=TERM",
      "--kill-after=5s",
      "90s",
      process.execPath,
      cli,
      "add",
      ...args,
      "--cwd",
      directory,
      "--yes",
    ],
    {
      cwd: directory,
      encoding: "utf-8",
      env: {
        ...process.env,
        CI: "1",
        NODE_OPTIONS: "--max-old-space-size=512",
        UV_THREADPOOL_SIZE: "1",
      },
      maxBuffer: 16_000,
    }
  );
  if (result.status !== 0) {
    throw new Error(
      `CLI ${args.join(" ")} exited ${result.status}: ${(
        result.stdout + result.stderr
      ).slice(-6000)}`
    );
  }
  return result.stdout;
};

const files = (directory, prefix = "") =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(prefix, entry.name);
    return entry.isDirectory()
      ? files(path.join(directory, entry.name), name)
      : [name];
  });

try {
  for (const layout of [
    { components: "components", name: "default", ui: "components/ui" },
    { components: "shared", name: "divergent", ui: "primitives" },
    {
      components: "shared",
      name: "src-divergent",
      src: true,
      ui: "primitives",
    },
  ]) {
    const directory = path.join(root, layout.name);
    const source = layout.src ? "src" : ".";
    mkdirSync(path.join(directory, source, "app"), { recursive: true });
    writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify({ name: `probe-${layout.name}`, private: true })
    );
    writeFileSync(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { baseUrl: ".", paths: { "@/*": [`${source}/*`] } },
      })
    );
    writeFileSync(path.join(directory, source, "app/globals.css"), "");
    writeFileSync(
      path.join(directory, "components.json"),
      JSON.stringify({
        $schema: "https://ui.shadcn.com/schema.json",
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
          css: `${layout.src ? "src/" : ""}app/globals.css`,
          cssVariables: true,
        },
        tsx: true,
      })
    );
    // Minimal dependency-free local artifacts isolate target/import capability.
    // These are probe modules, never a substitute for actual consumer compilation.
    const artifact = path.join(root, `${layout.name}.json`);
    writeFileSync(
      artifact,
      JSON.stringify({
        $schema: "https://ui.shadcn.com/schema/registry-item.json",
        files: [
          {
            content:
              'export { probe } from "@/registry/new-york/components/autocomplete/query";\nexport { primitive } from "@/registry/new-york/ui/primitive";\n',
            path: "registry/new-york/components/autocomplete/index.ts",
            type: "registry:component",
          },
          {
            content: "export const probe = true;\n",
            path: "registry/new-york/components/autocomplete/query.ts",
            type: "registry:component",
          },
          {
            content: "export const schema = true;\n",
            path: "registry/new-york/components/data-grid/schema.ts",
            type: "registry:component",
          },
          {
            content: 'import { probe } from "./index";\nexport { probe };\n',
            path: "registry/new-york/components/autocomplete/autocomplete.stories.tsx",
            type: "registry:component",
          },
          {
            content: "export const primitive = true;\n",
            path: "registry/new-york/ui/primitive.ts",
            type: "registry:ui",
          },
        ],
        name: "family-probe",
        type: "registry:item",
      })
    );
    const dryRun = run(directory, [artifact, "--dry-run"]);
    assert.ok(dryRun.length > 0, "CLI dry-run must produce a report");
    run(directory, [artifact]);
    const expected = path.join(
      directory,
      source,
      layout.components,
      "autocomplete/index.ts"
    );
    const installed = files(directory).filter(
      (name) => /\.(ts|tsx)$/.test(name) && !name.endsWith(".json")
    );
    const entry = installed.find((name) => name.endsWith("index.ts"));
    const content = readFileSync(path.join(directory, entry), "utf-8");
    assert.ok(
      content.includes(`@/${layout.components}/autocomplete/query`),
      "Components alias import must rewrite"
    );
    assert.ok(
      content.includes(`@/${layout.ui}/primitive`),
      "Divergent primitive alias import must rewrite"
    );
    const nested = existsSync(expected);
    const result = {
      entryImports: content.trim(),
      installed,
      layout: layout.name,
      nested,
    };
    results.push(result);
    console.log(JSON.stringify(result));
    // Test the proposed amendment, not a production alias-aware installer.
    // A wrapper would have to resolve these paths from consumer configuration.
    const targeted = JSON.parse(readFileSync(artifact, "utf-8"));
    targeted.name = "family-explicit-target-probe";
    for (const file of targeted.files) {
      const isPrimitive = file.type === "registry:ui";
      const [, suffix] = file.path.split(isPrimitive ? "/ui/" : "/components/");
      file.target = `${layout.src ? "src/" : ""}${
        isPrimitive ? layout.ui : layout.components
      }/${suffix}`;
    }
    const targetedArtifact = path.join(root, `${layout.name}-targeted.json`);
    writeFileSync(targetedArtifact, JSON.stringify(targeted));
    run(directory, [targetedArtifact, "--dry-run"]);
    run(directory, [targetedArtifact, "--overwrite"]);
    for (const file of targeted.files) {
      assert.ok(
        existsSync(path.join(directory, file.target)),
        `Explicit consumer-resolved target must exist: ${file.target}`
      );
    }
    const targetedContent = readFileSync(expected, "utf-8");
    assert.ok(
      targetedContent.includes(`@/${layout.components}/autocomplete/query`),
      "Explicit target must preserve components import rewrite"
    );
    assert.ok(
      targetedContent.includes(`@/${layout.ui}/primitive`),
      "Explicit target must preserve primitive import rewrite"
    );
    console.log(
      JSON.stringify({
        consumerResolvedExplicitTargets: "PASS",
        layout: layout.name,
        targets: targeted.files.map((file) => file.target),
      })
    );
  }
  assert.equal(results[0].nested, true, "Default nesting probe must succeed");
  if (results.some((result) => !result.nested)) {
    console.log(
      "GATE-CLI-PROBE: FAIL — shadcn 4.5.0 flattens no-target family paths for divergent components directory basenames; imports retain missing nested paths. Path migration requires approved replan."
    );
    process.exitCode = 2;
  } else {
    console.log("GATE-CLI-PROBE: PASS — all probed layouts resolve");
  }
} catch (error) {
  console.error(`GATE-CLI-PROBE: BLOCKED — ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(root, { force: true, recursive: true });
}
