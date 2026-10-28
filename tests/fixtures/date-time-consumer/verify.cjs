// Opt-in real installed Server Component boundary. No server listener is started.
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const {
  prepareFamilyArtifacts,
} = require("../../../scripts/component-family-artifacts.cjs");

const repository = path.resolve(__dirname, "../../..");
const root = mkdtempSync("/tmp/opencode/date-time-consumer-");
const run = (command, args, seconds = 180, heap = 512) => {
  console.log(`date-time-consumer: START ${command} ${args.join(" ")}`);
  const result = spawnSync(
    "timeout",
    ["--signal=TERM", "--kill-after=5s", `${seconds}s`, command, ...args],
    {
      cwd: root,
      encoding: "utf-8",
      env: {
        ...process.env,
        CI: "1",
        NEXT_TELEMETRY_DISABLED: "1",
        NODE_OPTIONS: `--max-old-space-size=${heap}`,
        RAYON_NUM_THREADS: "1",
        UV_THREADPOOL_SIZE: "1",
      },
      maxBuffer: 24_000,
    }
  );
  if (result.status !== 0) {
    throw new Error(
      `${command} exited ${result.status}: ${(result.stdout + result.stderr).slice(-16_000)}`
    );
  }
  return result.stdout;
};
try {
  mkdirSync(path.join(root, "app"));
  const templates = path.join(
    repository,
    "tests/fixtures/autocomplete-consumer"
  );
  for (const name of ["package.json", "components.json", "tsconfig.json"]) {
    copyFileSync(
      path.join(templates, `${name}.template`),
      path.join(root, name)
    );
  }
  copyFileSync(
    path.join(templates, "globals.css.template"),
    path.join(root, "app/globals.css")
  );
  writeFileSync(
    path.join(root, "app/layout.tsx"),
    'import "./globals.css"; import type { ReactNode } from "react"; export default function Layout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }'
  );
  writeFileSync(
    path.join(root, "app/page.tsx"),
    'import { DateTime, formatDate } from "@/shared/date-time"; export default function Page() { return <main><DateTime value="2026-10-24T08:00:00Z" timeZone="Asia/Jakarta" data-testid="instant" /><p>{formatDate(0, { timeZone: "UTC" })}</p></main>; }'
  );
  writeFileSync(
    path.join(root, "next.config.mjs"),
    "export default { experimental: { cpus: 1 }, typescript: { ignoreBuildErrors: false } };"
  );
  writeFileSync(
    path.join(root, "postcss.config.mjs"),
    'export default { plugins: { "@tailwindcss/postcss": {} } };'
  );
  run(
    "pnpm",
    [
      "install",
      "--no-frozen-lockfile",
      "--network-concurrency=1",
      "--child-concurrency=1",
    ],
    240
  );
  const manifestPath = path.resolve(
    path.dirname(require.resolve("shadcn")),
    "../package.json"
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const cli = path.resolve(
    path.dirname(manifestPath),
    typeof manifest.bin === "string" ? manifest.bin : manifest.bin.shadcn
  );
  const outputDirectory = path.join(root, "local-registry");
  mkdirSync(outputDirectory);
  const artifact = prepareFamilyArtifacts({
    artifactDirectory: path.join(repository, "public/r"),
    cwd: root,
    name: "date-time",
    outputDirectory,
  });
  run(process.execPath, [cli, "add", artifact, "--cwd", root, "--yes"], 240);
  assert.throws(
    () => require.resolve("@tanstack/react-query", { paths: [root] }),
    { code: "MODULE_NOT_FOUND" }
  );
  run(
    process.execPath,
    [path.join(root, "node_modules/typescript/bin/tsc"), "--noEmit"],
    120,
    768
  );
  run(
    process.execPath,
    [path.join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"],
    360,
    1536
  );
  const html = readFileSync(
    path.join(root, ".next/server/app/index.html"),
    "utf-8"
  );
  assert.match(
    html,
    /<time[^>]*dateTime="2026-10-24T08:00:00.000Z"[^>]*>—<\/time>/i
  );
  console.log(
    "GATE-DATETIME-RSC: PASS — real CLI, independent dependencies, Server Component family import, server fallback and bounded Next build."
  );
} catch (error) {
  console.error(`GATE-DATETIME-RSC: FAIL/BLOCKED — ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(root, { force: true, recursive: true });
}
