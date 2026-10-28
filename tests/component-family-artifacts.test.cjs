const assert = require("node:assert/strict");
const {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const {
  prepareFamilyArtifacts,
  resolveAliasDirectory,
} = require("../scripts/component-family-artifacts.cjs");

test("family targets resolve divergent aliases and local dependency closure", () => {
  const root = mkdtempSync("/tmp/opencode/family-artifacts-test-");
  try {
    const artifacts = path.join(root, "artifacts");
    const output = path.join(root, "output");
    mkdirSync(artifacts);
    mkdirSync(output);
    writeFileSync(
      path.join(root, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["src/*"] } } })
    );
    writeFileSync(
      path.join(root, "components.json"),
      JSON.stringify({
        aliases: { components: "@/shared", ui: "@/primitives" },
      })
    );
    writeFileSync(
      path.join(artifacts, "loading.json"),
      JSON.stringify({ files: [], name: "loading" })
    );
    writeFileSync(
      path.join(artifacts, "autocomplete.json"),
      JSON.stringify({
        files: [
          {
            path: "registry/new-york/components/autocomplete/index.ts",
            type: "registry:component",
          },
        ],
        name: "autocomplete",
        registryDependencies: ["https://vandor-ui.vercel.app/r/loading.json"],
      })
    );
    const entry = prepareFamilyArtifacts({
      artifactDirectory: artifacts,
      cwd: root,
      name: "autocomplete",
      outputDirectory: output,
    });
    const result = JSON.parse(readFileSync(entry, "utf-8"));
    assert.equal(result.files[0].target, "~/src/shared/autocomplete/index.ts");
    assert.equal(
      result.registryDependencies[0],
      path.join(output, "loading.json")
    );
    assert.equal(resolveAliasDirectory(root, "@/primitives"), "src/primitives");
    writeFileSync(
      path.join(root, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["../*"] } } })
    );
    assert.throws(() => resolveAliasDirectory(root, "@/shared"), /outside/);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("DateTime family targets stay in components alias and preserve owned relative imports", () => {
  const root = mkdtempSync("/tmp/opencode/date-time-family-");
  try {
    const artifacts = path.join(root, "artifacts");
    const output = path.join(root, "output");
    mkdirSync(artifacts);
    mkdirSync(output);
    writeFileSync(
      path.join(root, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["src/*"] } } })
    );
    writeFileSync(
      path.join(root, "components.json"),
      JSON.stringify({ aliases: { components: "@/shared", ui: "@/ui" } })
    );
    writeFileSync(
      path.join(artifacts, "date-time.json"),
      JSON.stringify({
        files: [
          {
            content: 'import { toDate } from "./date-time-utils";',
            path: "registry/new-york/date-time.tsx",
            target: "components/date-time/date-time.tsx",
          },
        ],
        name: "date-time",
        registryDependencies: [],
      })
    );
    const artifact = prepareFamilyArtifacts({
      artifactDirectory: artifacts,
      cwd: root,
      name: "date-time",
      outputDirectory: output,
    });
    const result = JSON.parse(readFileSync(artifact, "utf-8"));
    assert.equal(
      result.files[0].target,
      "~/src/shared/date-time/date-time.tsx"
    );
    assert.match(result.files[0].content, /\.\/date-time-utils/);
    writeFileSync(
      path.join(artifacts, "date-time-bad.json"),
      JSON.stringify({
        files: [
          {
            content: "",
            path: "registry/new-york/source.ts",
            target: "components/date-time/../outside.ts",
          },
        ],
        name: "date-time-bad",
      })
    );
    assert.throws(
      () =>
        prepareFamilyArtifacts({
          artifactDirectory: artifacts,
          cwd: root,
          name: "date-time-bad",
          outputDirectory: output,
        }),
      /Unsupported DateTime item/
    );
    for (const name of [
      "date-time-query",
      "date-time-schema",
      "../date-time",
    ]) {
      assert.throws(
        () =>
          prepareFamilyArtifacts({
            artifactDirectory: artifacts,
            cwd: root,
            name,
            outputDirectory: output,
          }),
        /Unsupported DateTime item|Invalid local registry item name/
      );
    }
    writeFileSync(
      path.join(artifacts, "date-time.json"),
      JSON.stringify({
        files: [
          {
            path: "registry/new-york/date-time.tsx",
            target: "components/date-time/../outside.ts",
          },
        ],
        name: "date-time",
      })
    );
    assert.throws(
      () =>
        prepareFamilyArtifacts({
          artifactDirectory: artifacts,
          cwd: root,
          name: "date-time",
          outputDirectory: output,
        }),
      /Invalid family source path/
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
