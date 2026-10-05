const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const registry = require("../registry.json");

test("Dialog artifacts preserve registered files, dependencies, client boundary, and upstream license", () => {
  for (const name of ["dialog", "dialog-stories"]) {
    const item = registry.items.find((entry) => entry.name === name);
    const artifact = JSON.parse(
      readFileSync(
        path.join(__dirname, "..", "public/r", `${name}.json`),
        "utf-8"
      )
    );
    assert.equal(artifact.name, item.name);
    assert.equal(artifact.type, item.type);
    assert.deepEqual(artifact.dependencies ?? [], item.dependencies ?? []);
    assert.deepEqual(artifact.registryDependencies ?? [], []);
    assert.equal(artifact.files.length, 1);
    const [file] = artifact.files;
    assert.deepEqual(
      {
        path: file.path,
        type: file.type,
        ...(file.target ? { target: file.target } : {}),
      },
      item.files[0]
    );
    assert.equal(
      file.content,
      readFileSync(path.join(__dirname, "..", file.path), "utf-8")
    );
    if (name === "dialog") {
      assert.match(file.content, /^"use client";/);
      assert.match(file.content, /Copyright \(c\) 2023 shadcn/);
      assert.doesNotMatch(file.content, /from ["']@\//);
      assert.doesNotMatch(file.content, /from ["']\./);
      assert.ok(
        !item.files.some((entry) => entry.path.endsWith(".stories.tsx"))
      );
    } else {
      assert.equal(file.target, undefined);
      assert.deepEqual(artifact.dependencies ?? [], []);
      assert.deepEqual(artifact.devDependencies ?? [], []);
      assert.match(file.content, /from "\.\/dialog"/);
    }
  }
});
