import type { ReactNode } from "react";

import { ButtonPlayground } from "@/components/button-playground";
import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper";
import { ComponentDependencies } from "@/components/component-dependencies";
import { LoadingPlayground } from "@/components/loading-playground";
import { PropsReference } from "@/components/props-reference";
import { componentDocDefinitions } from "@/lib/component-docs";

const playgrounds: Record<string, () => ReactNode> = {
  button: ButtonPlayground,
  loading: LoadingPlayground,
};

export const ComponentDocumentation = ({
  component,
  section,
  children,
}: {
  component: string;
  section: string;
  children?: ReactNode;
}) => {
  if (section === "playground") {
    const Playground = playgrounds[component];
    return Playground ? <Playground /> : children;
  }
  if (section === "dependencies") {
    return <ComponentDependencies name={component} />;
  }
  if (section === "props") {
    const definitions = componentDocDefinitions[component]?.props;
    return definitions ? (
      <PropsReference definitions={definitions} />
    ) : (
      children
    );
  }
  if (section === "source") {
    return <CodeCollapsibleWrapper>{children}</CodeCollapsibleWrapper>;
  }
  return children;
};
