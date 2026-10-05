import type { ReactNode } from "react";

import { AccordionPlayground } from "@/components/accordion-playground";
import { ButtonPlayground } from "@/components/button-playground";
import { CheckboxPlayground } from "@/components/checkbox-playground";
import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper";
import { ComponentDependencies } from "@/components/component-dependencies";
import { DialogPlayground } from "@/components/dialog-playground";
import { DrawerPlayground } from "@/components/drawer-playground";
import { EmptyPlayground } from "@/components/empty-playground";
import { InputFamilyPlayground } from "@/components/input-family-playground";
import { LoadingPlayground } from "@/components/loading-playground";
import { PopoverPlayground } from "@/components/popover-playground";
import { PropsReference } from "@/components/props-reference";
import { SelectPlayground } from "@/components/select-playground";
import { componentDocDefinitions } from "@/lib/component-docs";

const playgrounds: Record<string, () => ReactNode> = {
  accordion: AccordionPlayground,
  button: ButtonPlayground,
  calendar: () => <InputFamilyPlayground component="calendar" />,
  checkbox: CheckboxPlayground,
  "date-picker": () => <InputFamilyPlayground component="date-picker" />,
  "date-range-picker": () => (
    <InputFamilyPlayground component="date-range-picker" />
  ),
  dialog: DialogPlayground,
  drawer: DrawerPlayground,
  empty: EmptyPlayground,
  input: () => <InputFamilyPlayground component="input" />,
  "input-amount": () => <InputFamilyPlayground component="input-amount" />,
  "input-group": () => <InputFamilyPlayground component="input-group" />,
  "input-otp": () => <InputFamilyPlayground component="input-otp" />,
  "input-password": () => <InputFamilyPlayground component="input-password" />,
  "input-phone": () => <InputFamilyPlayground component="input-phone" />,
  "input-search": () => <InputFamilyPlayground component="input-search" />,
  "input-secret": () => <InputFamilyPlayground component="input-secret" />,
  loading: LoadingPlayground,
  popover: PopoverPlayground,
  select: SelectPlayground,
  textarea: () => <InputFamilyPlayground component="textarea" />,
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
