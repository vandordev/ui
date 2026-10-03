import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { rehypePrettyCode } from "rehype-pretty-code";

import { componentFrontmatterSchema } from "@/lib/component-docs";
import { DOCS_DIR } from "@/lib/docs";
import { transformers } from "@/lib/highlight-code";
import { remarkComponentDocs } from "@/lib/remark-component-docs";

export default defineConfig({
  mdxOptions: {
    preset: "fumadocs",
    rehypePlugins: (plugins) => {
      plugins.shift();
      plugins.push([
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light-default",
          },
          transformers,
        },
      ]);

      return plugins;
    },
    remarkPlugins: (plugins) => [remarkComponentDocs, ...plugins],
  },
});

export const docs = defineDocs({
  dir: DOCS_DIR,
  docs: {
    postprocess: {
      includeProcessedMarkdown: {
        stringify(node, _parent, state, info) {
          if (
            node.type === "mdxJsxFlowElement" &&
            node.name === "ComponentDocumentation"
          ) {
            return state.containerFlow(node, info);
          }
        },
      },
    },
    schema: frontmatterSchema.extend(componentFrontmatterSchema.shape),
  },
  meta: {
    schema: metaSchema,
  },
});
