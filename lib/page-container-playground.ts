import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { PageContainerProps } from "@/registry/new-york/page-container";

type PageContainerSize = NonNullable<PageContainerProps["size"]>;

export const pageContainerProps = {
  children: {
    control: { initialValue: "Page content", kind: "text", label: "Content" },
    defaultValue: "Not set",
    description:
      "Page content. The playground uses text inside a sample content area.",
    type: "ReactNode",
  },
  className: {
    defaultValue: "Not set",
    description:
      "Merged layout classes. Override gutters at each breakpoint when needed, such as px-0 sm:px-0 lg:px-0.",
    type: "string",
  },
  ref: {
    defaultValue: "Not set",
    description: "React 19 ref forwarded to the native div.",
    type: "Ref<HTMLDivElement>",
  },
  size: {
    control: {
      initialValue: "lg" as PageContainerSize,
      kind: "select",
      label: "Size",
      options: ["sm", "md", "lg", "xl", "full"] satisfies PageContainerSize[],
    },
    defaultValue: '"lg"',
    description:
      "Maximum outer width: sm 42rem, md 56rem, lg 72rem, xl 80rem; full has no cap. Gutters are included in this width.",
    type: '"sm" | "md" | "lg" | "xl" | "full"',
  },
} satisfies Record<string, PropDefinition>;

export const getPageContainerDefaults = () =>
  getPlaygroundDefaults(pageContainerProps);
export type PageContainerPlaygroundValues = ReturnType<
  typeof getPageContainerDefaults
>;

export const getPageContainerCode = (values: PageContainerPlaygroundValues) => {
  const size =
    values.size === "lg" ? "" : ` size=${JSON.stringify(values.size)}`;
  return `import { PageContainer } from "@/components/ui/page-container";

export const PageContainerDemo = () => (
  <PageContainer${size}>
    <div className="bg-muted py-8 text-sm text-foreground">
      {${JSON.stringify(values.children)}}
    </div>
  </PageContainer>
);`;
};
