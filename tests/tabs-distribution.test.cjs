/* eslint-disable global-require -- Generated consumer modules resolve declared packages, not repository component source. */
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { createJiti } = require("jiti");

test("Tabs artifacts, stories and generated demos compile with a divergent UI alias and reject mixed contracts", () => {
  const project = process.cwd();
  const directory = mkdtempSync("/tmp/opencode/tabs-consumer-");
  try {
    symlinkSync(
      path.join(project, "node_modules"),
      path.join(directory, "node_modules"),
      "dir"
    );
    const ui = path.join(directory, "src/widgets/controls");
    mkdirSync(ui, { recursive: true });
    for (const name of ["tabs", "tabs-stories"]) {
      const artifact = JSON.parse(
        readFileSync(`public/r/${name}.json`, "utf-8")
      );
      writeFileSync(
        path.join(ui, name === "tabs" ? "tabs.tsx" : "tabs.stories.tsx"),
        artifact.files[0].content
      );
    }
    const { getTabsCode, getTabsDefaults } = createJiti(__filename, {
      alias: { "@": project },
      fsCache: false,
      jsx: { runtime: "automatic" },
    })("../lib/tabs-playground.ts");
    let index = 0;
    for (const mode of ["panels", "links"]) {
      for (const variant of ["underline", "pill", "segmented"]) {
        for (const orientation of ["horizontal", "vertical"]) {
          writeFileSync(
            path.join(directory, `demo-${(index += 1)}.tsx`),
            getTabsCode({
              ...getTabsDefaults(),
              activationMode: "automatic",
              animated: false,
              disabled: true,
              keepMounted: true,
              label: 'Project "draft" <now> {value}\nnext',
              mode,
              orientation,
              variant,
            }).replaceAll("@/components/ui/tabs", "~/widgets/controls/tabs")
          );
        }
      }
    }
    writeFileSync(
      path.join(directory, "consumer.tsx"),
      `
import Link from "next/link";
import { createRef } from "react";
import type { ComponentProps } from "react";
import { Tabs } from "~/widgets/controls/tabs";
import type { TabsPanelProps, TabsNavigationProps } from "~/widgets/controls/tabs";

// No use-client directive: a server-compatible module importing the client boundary.
export function Consumer() {
  return <Tabs aria-label="Routes" ref={createRef<HTMLElement>()} items={[
    { link: <Link href="/overview" prefetch={false}>Overview</Link>, active: true },
    { link: <a href="/activity" target="_blank" rel="noreferrer">Activity</a> },
  ]} />;
}
const RouterLink = ({ to, ...props }: Omit<ComponentProps<"a">, "href"> & { to: string }) => <a {...props} href={to} />;
export const RouterConsumer = () => <Tabs aria-label="Routes" items={[{ link: <RouterLink to="/overview">Overview</RouterLink>, active: true }]} />;
export const TypedPanels = () => <Tabs<"overview" | "activity"> aria-label="Panels" value="overview" items={[{ value: "overview", label: "Overview", content: "Content" }]} onValueChange={(value, details) => { const selection: "overview" | "activity" | null = value; details.cancel(); }} />;
// @ts-expect-error Panel and navigation items cannot be mixed.
const mixed: TabsPanelProps["items"] | TabsNavigationProps["items"] = [{ value: "one", label: "One", content: "One" }, { link: <a href="/two">Two</a> }];
// @ts-expect-error Link mode has no local panel selection.
const localLinkState: TabsNavigationProps = { items: [{ link: <a href="/one">One</a> }], value: "one" };
// @ts-expect-error A panel requires a stable value.
const anonymousPanel: TabsPanelProps = { items: [{ label: "One", content: "One" }] };
// @ts-expect-error Typed values reject unknown selection.
const unknown: TabsPanelProps<"one"> = { items: [{ value: "one", label: "One", content: "One" }], value: "two" };
`
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
      `Consumer typecheck: ${(result.stdout + result.stderr).slice(0, 12_000)}`
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
