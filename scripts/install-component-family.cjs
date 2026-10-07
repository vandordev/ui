#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { mkdtempSync, readFileSync, rmSync } = require("node:fs");
const path = require("node:path");
const { prepareFamilyArtifacts } = require("./component-family-artifacts.cjs");

const [name, consumer, ...flags] = process.argv.slice(2);
if (
  !/^(autocomplete|data-grid)(-query|-schema|-stories)?$/.test(name ?? "") ||
  !consumer ||
  flags.some((flag) => flag !== "--dry-run")
) {
  console.error(
    "Usage: node scripts/install-component-family.cjs <item> <consumer-directory> [--dry-run]"
  );
  process.exitCode = 1;
} else {
  const directory = mkdtempSync("/tmp/opencode/family-install-");
  try {
    const cwd = path.resolve(consumer);
    const artifact = prepareFamilyArtifacts({
      artifactDirectory: path.resolve(__dirname, "../public/r"),
      cwd,
      name,
      outputDirectory: directory,
    });
    const manifestPath = path.resolve(
      path.dirname(require.resolve("shadcn")),
      "../package.json"
    );
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    const cli = path.resolve(
      path.dirname(manifestPath),
      typeof manifest.bin === "string" ? manifest.bin : manifest.bin.shadcn
    );
    const result = spawnSync(
      "timeout",
      [
        "--signal=TERM",
        "--kill-after=5s",
        "600s",
        process.execPath,
        cli,
        "add",
        artifact,
        "--cwd",
        cwd,
        ...flags,
      ],
      {
        env: {
          ...process.env,
          NODE_OPTIONS: "--max-old-space-size=512",
          UV_THREADPOOL_SIZE: "1",
        },
        stdio: "inherit",
      }
    );
    process.exitCode = result.status ?? 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}
