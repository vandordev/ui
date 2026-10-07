// Opt-in real boundary: network/package-cache access required. No server launched.
/* eslint-disable global-require */
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const { createJiti } = require("jiti");

const repository = path.resolve(__dirname, "../../..");
const directory = mkdtempSync("/tmp/opencode/autocomplete-consumer-");
const check = (command, args, seconds = 180, heap = 1024) => {
  const result = spawnSync(
    "timeout",
    ["--signal=TERM", "--kill-after=5s", `${seconds}s`, command, ...args],
    {
      cwd: directory,
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
  console.log(`${command} ${args.join(" ")}: ${result.status}`);
  if (result.status !== 0) {
    throw new Error(
      `${command} exited ${result.status}: ${(result.stdout + result.stderr).slice(-16_000)}`
    );
  }
  return result.stdout;
};
const hash = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");

try {
  mkdirSync(path.join(directory, "app"));
  for (const filename of ["package.json", "components.json", "tsconfig.json"]) {
    copyFileSync(
      path.join(__dirname, `${filename}.template`),
      path.join(directory, filename)
    );
  }
  copyFileSync(
    path.join(__dirname, "globals.css.template"),
    path.join(directory, "app/globals.css")
  );
  writeFileSync(
    path.join(directory, "next-env.d.ts"),
    '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n'
  );
  writeFileSync(
    path.join(directory, "app/layout.tsx"),
    'import "./globals.css";\nimport type { ReactNode } from "react";\nexport default function Layout({children}: {children: ReactNode}) { return <html lang="en"><body>{children}</body></html>; }\n'
  );
  writeFileSync(
    path.join(directory, "app/page.tsx"),
    'import { Autocomplete } from "@/shared/ui/autocomplete";\nexport default function Page() { return <main><Autocomplete items={["React", "Vue"]} label="Framework" /></main>; }\n'
  );
  writeFileSync(
    path.join(directory, "next.config.mjs"),
    "export default { experimental: { cpus: 1 }, typescript: { ignoreBuildErrors: false } };\n"
  );
  writeFileSync(
    path.join(directory, "postcss.config.mjs"),
    'export default { plugins: { "@tailwindcss/postcss": {} } };\n'
  );
  // Install only this consumer's declared graph; never symlink repository modules.
  check(
    "pnpm",
    [
      "install",
      "--no-frozen-lockfile",
      "--network-concurrency=1",
      "--child-concurrency=1",
    ],
    240
  );
  // package.json is not exported by shadcn. Resolve its public entry first,
  // then read the installed manifest to discover the declared CLI bin.
  const cliPackagePath = path.resolve(
    path.dirname(require.resolve("shadcn", { paths: [repository] })),
    "../package.json"
  );
  const cliPackage = JSON.parse(readFileSync(cliPackagePath, "utf-8"));
  const cliEntry = path.resolve(
    path.dirname(cliPackagePath),
    typeof cliPackage.bin === "string" ? cliPackage.bin : cliPackage.bin.shadcn
  );
  check(process.execPath, [
    cliEntry,
    "add",
    path.join(repository, "public/r/autocomplete.json"),
    "--cwd",
    directory,
    "--yes",
  ]);
  const ui = path.join(directory, "shared/ui");
  assert.deepEqual(readdirSync(ui).toSorted(), [
    "autocomplete-root.tsx",
    "autocomplete-types.ts",
    "autocomplete-utils.ts",
    "autocomplete.tsx",
  ]);
  const playground = createJiti(__filename, {
    alias: { "@": repository },
    fsCache: false,
  })(path.join(repository, "lib/autocomplete-playground.ts"));
  for (const mode of ["free-text", "selection"]) {
    for (const multiple of [false, true]) {
      const code = playground.getAutocompleteCode({
        ...playground.getAutocompleteDefaults(),
        grouping: true,
        mode,
        multiple,
      });
      writeFileSync(
        path.join(directory, `demo-${mode}-${multiple}.tsx`),
        code.replaceAll(
          "@/components/ui/autocomplete",
          "@/shared/ui/autocomplete"
        )
      );
    }
  }
  const tsc = path.join(directory, "node_modules/typescript/bin/tsc");
  check(process.execPath, [tsc, "--noEmit"], 120, 1024);
  // A real Server Component import crosses the installed client module boundary.
  check(
    process.execPath,
    [
      path.join(directory, "node_modules/next/dist/bin/next"),
      "build",
      "--webpack",
    ],
    360,
    2048
  );
  const entry = path.join(ui, "autocomplete.tsx");
  writeFileSync(
    entry,
    `${readFileSync(entry, "utf-8")}\n// Consumer customization: must survive optional story installation.\n`
  );
  const before = Object.fromEntries(
    readdirSync(ui).map((filename) => [filename, hash(path.join(ui, filename))])
  );
  check(process.execPath, [
    cliEntry,
    "add",
    path.join(repository, "public/r/autocomplete-stories.json"),
    "--cwd",
    directory,
    "--yes",
  ]);
  for (const [filename, checksum] of Object.entries(before)) {
    assert.equal(
      hash(path.join(ui, filename)),
      checksum,
      `${filename} preserved`
    );
  }
  assert.ok(readdirSync(ui).includes("autocomplete.stories.tsx"));
  check(process.execPath, [tsc, "--noEmit"], 120, 1024);
  console.log(
    "GATE-CONSUMER: PASS — real CLI, non-default shared/ui alias, generated demos, Next RSC build, stories checksum preservation and actual Storybook types."
  );
} catch (error) {
  console.error(`GATE-CONSUMER: BLOCKED/FAIL — ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(directory, { force: true, recursive: true });
}
