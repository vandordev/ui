import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  buildComponentDocSections,
  componentFrontmatterSchema,
} from "@/lib/component-docs";
import type { DocumentationNode } from "@/lib/component-docs";
import registry from "@/registry.json";

export const remarkComponentDocs =
  () => async (input: unknown, inputFile: unknown) => {
    const tree = input as DocumentationNode;
    const file = inputFile as { data: { frontmatter?: unknown } };
    const metadata = componentFrontmatterSchema.parse(
      file.data.frontmatter ?? {}
    );
    if (!metadata.component || !tree.children) {
      return;
    }
    const item = registry.items.find(
      (entry) => entry.name === metadata.component
    );
    const sourcePath = item?.files.find(
      (entry) => entry.type === "registry:ui"
    )?.path;
    const source = sourcePath
      ? await readFile(path.resolve(process.cwd(), sourcePath), "utf-8")
      : null;
    const sections = buildComponentDocSections(metadata, source);
    const imports = tree.children.filter((node) => node.type === "mdxjsEsm");
    const body = tree.children.filter((node) => node.type !== "mdxjsEsm");
    tree.children = [
      ...imports,
      ...sections.before,
      ...body,
      ...sections.after,
    ];
  };
