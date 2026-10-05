# Vandor UI project instructions

These instructions apply to this repository only and supplement ancestor instructions.

## Strict memory safety

Protect the user's laptop from RAM exhaustion. Before running tests or other
resource-intensive verification, follow the mandatory memory-safety rules in
[`.agent/frontend-workflow.md`](.agent/frontend-workflow.md#strict-memory-safety-for-verification).
Never run unbounded Node tests, inspect whole DOM/React object graphs in failure
output, run heavy checks concurrently, or raise memory limits after an OOM without
explicit user approval. These are safety requirements, not optional optimizations.

Before starting frontend implementation or verification, read and follow
[`.agent/frontend-workflow.md`](.agent/frontend-workflow.md). This applies to
OpenChamber, OpenCode, Codex, and other agents working in this checkout.

Before implementing or substantially improving registry components, their docs,
or playgrounds, also read and follow
[`.agent/component-implementation.md`](.agent/component-implementation.md).

Before changing registry items, distributable source, installation instructions,
or distribution checks, also read and follow
[`.agent/registry-distribution.md`](.agent/registry-distribution.md).
