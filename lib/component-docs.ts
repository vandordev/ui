import { z } from "zod";

import {
  accordionProps,
  getAccordionCode,
  getAccordionDefaults,
} from "@/lib/accordion-playground";
import {
  blobatarProps,
  getBlobatarCode,
  getBlobatarDefaults,
} from "@/lib/blobatar-playground";
import {
  buttonProps,
  getButtonCode,
  getButtonDefaults,
} from "@/lib/button-playground";
import {
  checkboxProps,
  getCheckboxCode,
  getCheckboxDefaults,
} from "@/lib/checkbox-playground";
import {
  dialogProps,
  getDialogCode,
  getDialogDefaults,
} from "@/lib/dialog-playground";
import {
  drawerProps,
  getDrawerCode,
  getDrawerDefaults,
} from "@/lib/drawer-playground";
import {
  dropdownProps,
  getDropdownCode,
  getDropdownDefaults,
} from "@/lib/dropdown-playground";
import {
  emptyProps,
  getEmptyCode,
  getEmptyDefaults,
} from "@/lib/empty-playground";
import {
  errorStateProps,
  getErrorStateCode,
  getErrorStateDefaults,
} from "@/lib/error-state-playground";
import {
  inputComponentProps,
  inputPlaygroundCode,
} from "@/lib/input-component-props";
import {
  getLoadingCode,
  getLoadingDefaults,
  loadingProps,
} from "@/lib/loading-playground";
import type { PropDefinition } from "@/lib/playground";
import {
  getPopoverCode,
  getPopoverDefaults,
  popoverProps,
} from "@/lib/popover-playground";
import {
  getSelectCode,
  getSelectDefaults,
  selectProps,
} from "@/lib/select-playground";
import {
  getToastCode,
  getToastDefaults,
  toastApiProps,
} from "@/lib/toast-playground";
import registry from "@/registry.json";

interface ComponentDocDefinition {
  playground?: { code: string };
  props?: Record<string, PropDefinition>;
}

export const componentDocDefinitions: Record<string, ComponentDocDefinition> = {
  ...Object.fromEntries(
    Object.entries(inputComponentProps).map(([name, props]) => [
      name,
      { playground: { code: inputPlaygroundCode[name] }, props },
    ])
  ),
  accordion: {
    playground: { code: getAccordionCode(getAccordionDefaults()) },
    props: accordionProps,
  },
  blobatar: {
    playground: { code: getBlobatarCode(getBlobatarDefaults()) },
    props: blobatarProps,
  },
  button: {
    playground: {
      code: getButtonCode(getButtonDefaults()),
    },
    props: buttonProps,
  },
  checkbox: {
    playground: { code: getCheckboxCode(getCheckboxDefaults()) },
    props: checkboxProps,
  },
  dialog: {
    playground: { code: getDialogCode(getDialogDefaults()) },
    props: dialogProps,
  },
  drawer: {
    playground: { code: getDrawerCode(getDrawerDefaults()) },
    props: drawerProps,
  },
  dropdown: {
    playground: { code: getDropdownCode(getDropdownDefaults()) },
    props: dropdownProps,
  },
  empty: {
    playground: { code: getEmptyCode(getEmptyDefaults()) },
    props: emptyProps,
  },
  "error-state": {
    playground: { code: getErrorStateCode(getErrorStateDefaults()) },
    props: errorStateProps,
  },
  loading: {
    playground: { code: getLoadingCode(getLoadingDefaults()) },
    props: loadingProps,
  },
  popover: {
    playground: { code: getPopoverCode(getPopoverDefaults()) },
    props: popoverProps,
  },
  select: {
    playground: { code: getSelectCode(getSelectDefaults()) },
    props: selectProps,
  },
  toast: {
    playground: { code: getToastCode(getToastDefaults()) },
    props: toastApiProps,
  },
};

export const componentFrontmatterSchema = z.object({
  component: z
    .string()
    .refine(
      (name) => registry.items.some((item) => item.name === name),
      "Unknown registry component"
    )
    .optional(),
  credits: z
    .array(
      z.object({
        contribution: z.string().min(1),
        name: z.string().min(1),
        url: z
          .url()
          .refine(
            (url) => /^https?:\/\//.test(url),
            "Credit URLs must use http or https"
          ),
      })
    )
    .optional(),
});

export type ComponentDocFrontmatter = z.infer<
  typeof componentFrontmatterSchema
>;

// A small structural subset of MDAST, including MDX elements. No parser-specific runtime dependency.
export interface DocumentationNode {
  type: string;
  children?: DocumentationNode[];
  value?: string;
  depth?: number;
  lang?: string;
  url?: string;
  name?: string;
  attributes?: { type: "mdxJsxAttribute"; name: string; value: string }[];
}

const text = (value: string): DocumentationNode => ({ type: "text", value });
const paragraph = (value: string): DocumentationNode => ({
  children: [text(value)],
  type: "paragraph",
});
const heading = (value: string): DocumentationNode => ({
  children: [text(value)],
  depth: 2,
  type: "heading",
});
const code = (value: string, lang: string): DocumentationNode => ({
  lang,
  type: "code",
  value,
});
const section = (
  component: string,
  kind: string,
  children: DocumentationNode[]
): DocumentationNode => ({
  attributes: [
    { name: "component", type: "mdxJsxAttribute", value: component },
    { name: "section", type: "mdxJsxAttribute", value: kind },
  ],
  children,
  name: "ComponentDocumentation",
  type: "mdxJsxFlowElement",
});

export const buildComponentDocSections = (
  metadata: ComponentDocFrontmatter,
  source: string | null
): { before: DocumentationNode[]; after: DocumentationNode[] } => {
  const before: DocumentationNode[] = [];
  const after: DocumentationNode[] = [];
  if (!metadata.component) {
    return { after, before };
  }
  const name = metadata.component;
  const item = registry.items.find((entry) => entry.name === name);
  if (!item) {
    throw new Error(`Unknown registry component: ${name}`);
  }
  const definition = componentDocDefinitions[name];

  if (definition?.playground) {
    before.push(
      heading("Playground"),
      section(name, "playground", [code(definition.playground.code, "tsx")])
    );
  }
  before.push(
    heading("Installation"),
    paragraph(
      "Initialize shadcn in your React project, then install this component from the Vandor UI registry:"
    ),
    code(`npx shadcn@latest add ${registry.homepage}/r/${name}.json`, "bash")
  );
  const [firstFile] = item.files;
  const target =
    firstFile && "target" in firstFile ? firstFile.target : undefined;
  if (target) {
    before.push(
      paragraph(
        `The default installation target is ${target}. Review the CLI's overwrite prompt before replacing local customizations.`
      )
    );
  }
  if (item.dependencies?.length) {
    before.push(
      heading("Dependencies"),
      paragraph(
        "Installed automatically by the registry CLI. For manual setup:"
      ),
      section(name, "dependencies", [
        code(`npm install ${item.dependencies.join(" ")}`, "bash"),
      ])
    );
  }
  if (definition?.props) {
    const cell = (value: string): DocumentationNode => ({
      children: [text(value)],
      type: "tableCell",
    });
    const row = (values: string[]): DocumentationNode => ({
      children: values.map(cell),
      type: "tableRow",
    });
    const table: DocumentationNode = {
      children: [
        row(["Prop", "Type", "Default", "Description"]),
        ...Object.entries(definition.props).map(([prop, value]) =>
          row([prop, value.type, value.defaultValue, value.description])
        ),
      ],
      type: "table",
    };
    after.push(
      heading("Props"),
      section(name, "props", [table]),
      paragraph(
        "The reference lists component-specific props and selected native props, not the complete React API. Other native attributes are forwarded to the rendered element."
      )
    );
  }
  if (source) {
    after.push(
      heading("Source"),
      section(name, "source", [code(source, "tsx")])
    );
  }
  if (metadata.credits?.length) {
    after.push(heading("Credits"), {
      children: metadata.credits.map((credit) => ({
        children: [
          {
            children: [
              { children: [text(credit.name)], type: "link", url: credit.url },
              text(`: ${credit.contribution}`),
            ],
            type: "paragraph",
          },
        ],
        type: "listItem",
      })),
      type: "list",
    });
  }
  return { after, before };
};
