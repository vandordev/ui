import { MinusIcon, PlusIcon } from "lucide-react";
import { createElement } from "react";
import type { ComponentProps } from "react";

import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";
import type { AccordionTrigger } from "@/registry/new-york/accordion";

export const accordionItems = [
  {
    answer:
      "Yes. Base UI provides heading and panel relationships, keyboard activation, and disabled states.",
    question: "Is it accessible?",
    value: "accessible",
  },
  {
    answer:
      "Use the shadcn CLI to install editable source code into your project.",
    question: "How do I install it?",
    value: "installation",
  },
  {
    answer: "Yes. Enable the multiple prop to keep more than one panel open.",
    question: "Can I open multiple panels?",
    value: "multiple",
  },
];

export const accordionProps = {
  defaultValue: {
    defaultValue: "Not set",
    description:
      "Accordion: initial uncontrolled array of expanded item values.",
    type: "Value[]",
  },
  disabled: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Disabled",
    },
    defaultValue: "false",
    description: "Accordion or AccordionItem: prevents interaction.",
    type: "boolean",
  },
  expandedIcon: {
    defaultValue: "Not set",
    description:
      "AccordionTrigger: optional expanded indicator. When provided, the two icons crossfade and gently scale instead of rotating.",
    type: "ReactNode",
  },
  icon: {
    defaultValue: "ChevronDownIcon",
    description:
      "AccordionTrigger: decorative indicator React node. Pass null to hide it; custom icon components do not need Motion props or refs.",
    type: "ReactNode",
  },
  iconRotation: {
    defaultValue: "180",
    description:
      "AccordionTrigger: expanded rotation in degrees for a single icon. Ignored when expandedIcon is supplied. Use 45 to turn Plus into a close mark, or 0 for no rotation.",
    type: "number",
  },
  iconStyle: {
    control: {
      initialValue: "chevron" as
        | "chevron"
        | "plus-minus"
        | "plus-rotate"
        | "none",
      kind: "select",
      label: "Icon style",
      options: ["chevron", "plus-minus", "plus-rotate", "none"],
    },
    defaultValue: '"chevron" (demo)',
    description:
      "Demo composition: default chevron, Plus/Minus crossfade, Plus rotation, or no indicator. Configures AccordionTrigger props.",
    type: "string (demo only)",
  },
  keepMounted: {
    defaultValue: "false",
    description: "AccordionContent: keeps closed panels in the DOM.",
    type: "boolean",
  },
  multiple: {
    control: {
      initialValue: false as boolean,
      kind: "boolean",
      label: "Multiple",
    },
    defaultValue: "false",
    description: "Accordion: allows multiple panels to remain open.",
    type: "boolean",
  },
  onValueChange: {
    defaultValue: "Not set",
    description:
      "Accordion: receives expanded values and Base UI event details.",
    type: "(value, details) => void",
  },
  value: {
    defaultValue: "Not set",
    description: "Accordion: controlled array of expanded item values.",
    type: "Value[]",
  },
} satisfies Record<string, PropDefinition>;

export const getAccordionDefaults = () => getPlaygroundDefaults(accordionProps);
export type AccordionPlaygroundValues = ReturnType<typeof getAccordionDefaults>;
export const getAccordionIconProps = (
  style: AccordionPlaygroundValues["iconStyle"]
): ComponentProps<typeof AccordionTrigger> => {
  if (style === "plus-minus") {
    return {
      expandedIcon: createElement(MinusIcon),
      icon: createElement(PlusIcon),
    };
  }
  if (style === "plus-rotate") {
    return { icon: createElement(PlusIcon), iconRotation: 45 };
  }
  if (style === "none") {
    return { icon: null };
  }
  return {};
};

const iconCode = {
  chevron: "",
  none: " icon={null}",
  "plus-minus": " icon={<PlusIcon />} expandedIcon={<MinusIcon />}",
  "plus-rotate": " icon={<PlusIcon />} iconRotation={45}",
};

export const getAccordionCode = (
  values: AccordionPlaygroundValues
) => `${values.iconStyle.startsWith("plus") ? `import { PlusIcon${values.iconStyle === "plus-minus" ? ", MinusIcon" : ""} } from "lucide-react";\n` : ""}import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const items = ${JSON.stringify(accordionItems, null, 2)};

export const AccordionDemo = () => (
  <Accordion defaultValue={["accessible"]}${values.multiple ? " multiple" : ""}${values.disabled ? " disabled" : ""}>
    {items.map((item) => (
      <AccordionItem key={item.value} value={item.value}>
        <AccordionTrigger${iconCode[values.iconStyle]}>{item.question}</AccordionTrigger>
        <AccordionContent>{item.answer}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);`;
