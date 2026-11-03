const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const { createJiti } = require("jiti");
const { test } = require("node:test");
const {
  prepareFamilyArtifacts,
} = require("../scripts/component-family-artifacts.cjs");

test("installed families and fields compile for ES2022 consumers with strict indexed access and divergent aliases", () => {
  const project = process.cwd();
  const directory = mkdtempSync("/tmp/opencode/consumer-compatibility-");
  try {
    const output = path.join(directory, "artifacts");
    mkdirSync(output);
    symlinkSync(
      path.join(project, "node_modules"),
      path.join(directory, "node_modules"),
      "dir"
    );
    writeFileSync(
      path.join(directory, "components.json"),
      JSON.stringify({
        aliases: { components: "~/widgets", ui: "~/primitives" },
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
          noUncheckedIndexedAccess: true,
          paths: {
            react: [path.join(project, "node_modules/@types/react")],
            "~/*": ["./src/*"],
          },
          skipLibCheck: true,
          strict: true,
          target: "ES2022",
        },
        include: [],
      })
    );
    const installed = new Set();
    const install = (artifactPath) => {
      const item = JSON.parse(readFileSync(artifactPath, "utf-8"));
      if (installed.has(item.name)) {
        return;
      }
      installed.add(item.name);
      for (const dependency of item.registryDependencies ?? []) {
        install(
          /^https?:/.test(dependency)
            ? path.join(project, "public/r", path.basename(dependency))
            : dependency
        );
      }
      for (const file of item.files ?? []) {
        // Model stock shadcn target resolution without rewriting ordinary artifacts.
        // Family artifacts alone require the documented installer preparation.
        let relative = `src/primitives/${path.basename(file.path)}`;
        if (file.target) {
          relative = file.target.startsWith("~/")
            ? file.target.slice(2)
            : `src/${file.target}`;
        }
        const target = path.join(directory, relative);
        mkdirSync(path.dirname(target), { recursive: true });
        writeFileSync(
          target,
          file.content
            .replaceAll("@/registry/new-york/ui/", "~/primitives/")
            .replaceAll("@/registry/new-york/components/", "~/widgets/")
            .replaceAll("@/components/", "~/widgets/")
        );
      }
    };
    for (const name of [
      "input-password",
      "input-phone",
      "input-password-stories",
      "textarea",
      "input-group",
      "input-search",
      "input-amount",
      "input-otp",
      "input-secret",
      "date-picker",
      "date-range-picker",
      "toast-tanstack-query",
      "select-stories",
    ]) {
      install(path.join(project, `public/r/${name}.json`));
    }
    for (const name of [
      "autocomplete",
      "autocomplete-query",
      "data-grid",
      "data-grid-schema",
      "date-time",
      "date-time-stories",
      "app-shell",
      "app-shell-stories",
      "loading",
    ]) {
      install(
        prepareFamilyArtifacts({
          artifactDirectory: path.join(project, "public/r"),
          cwd: directory,
          name,
          outputDirectory: output,
        })
      );
    }
    const jiti = createJiti(__filename, {
      alias: { "@": project },
      fsCache: false,
      jsx: { runtime: "automatic" },
    });
    const select = jiti("../lib/select-playground.ts");
    const dateTime = jiti("../lib/date-time-playground.ts");
    const input = jiti("../lib/input-component-props.ts");
    for (const [name, code] of [
      [
        "phone",
        input.getInputPlaygroundCode(
          "input-phone",
          input.getInputPlaygroundDefaults("input-phone")
        ),
      ],
      [
        "range",
        input.getInputPlaygroundCode("date-range-picker", {
          ...input.getInputPlaygroundDefaults("date-range-picker"),
          dateFormat: "yyyy-MM-dd",
        }),
      ],
      [
        "password",
        input.getInputPlaygroundCode("input-password", {
          ...input.getInputPlaygroundDefaults("input-password"),
          hidePasswordLabel: "Sembunyikan",
          showPasswordLabel: 'Tampilkan "sandi" <aman>',
        }),
      ],
      [
        "select",
        select.getSelectCode({
          ...select.getSelectDefaults(),
          label: 'A "quoted" <label> {value}\nnext',
          labelStyle: "static",
        }),
      ],
      [
        "date-time",
        dateTime.getDateTimeCode({
          ...dateTime.getDateTimeDefaults(),
          display: "date",
          locale: "id-ID",
          timeZone: "Asia/Jakarta",
        }),
      ],
    ]) {
      writeFileSync(
        path.join(directory, `generated-${name}.tsx`),
        code
          .replaceAll("@/components/ui/", "~/primitives/")
          .replaceAll("@/components/", "~/widgets/")
      );
    }
    writeFileSync(
      path.join(directory, "generated-source.tsx"),
      readFileSync(
        path.join(project, "tests/data-grid-source.types.tsx"),
        "utf-8"
      )
        .replaceAll(
          "../registry/new-york/data-grid-schema",
          "~/widgets/data-grid/schema"
        )
        .replaceAll(
          "../registry/new-york/use-data-grid-source",
          "~/widgets/data-grid"
        )
        .replaceAll(
          "../registry/new-york/data-grid-index",
          "~/widgets/data-grid"
        )
        .replaceAll(
          "../registry/new-york/data-grid-context",
          "~/widgets/data-grid/data-grid-context"
        )
    );
    // Compile independent graphs serially within the 512 MiB heap budget.
    for (const include of [
      ["src/widgets/autocomplete/**/*.ts*"],
      ["src/widgets/data-grid/**/*.ts*", "generated-source.tsx"],
      [
        "src/primitives/**/*.ts*",
        "generated-phone.tsx",
        "generated-range.tsx",
        "generated-password.tsx",
        "generated-select.tsx",
      ],
      ["src/widgets/date-time/**/*.ts*", "generated-date-time.tsx"],
    ]) {
      const configPath = path.join(directory, "tsconfig.json");
      const config = JSON.parse(readFileSync(configPath, "utf-8"));
      config.include = include;
      writeFileSync(configPath, JSON.stringify(config));
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
          cwd: directory,
          encoding: "utf-8",
          env: {
            ...process.env,
            NODE_OPTIONS: "--max-old-space-size=512",
            UV_THREADPOOL_SIZE: "1",
          },
          maxBuffer: 24_000,
        }
      );
      assert.equal(
        result.status,
        0,
        `Consumer compilation (${include[0]}):\n${(result.stdout + result.stderr).slice(0, 20_000)}`
      );
    }
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
