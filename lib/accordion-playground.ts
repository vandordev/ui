import type { PropDefinition } from "@/lib/playground";
import { getPlaygroundDefaults } from "@/lib/playground";

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

export const getAccordionCode = (values: AccordionPlaygroundValues) => `import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const items = ${JSON.stringify(accordionItems, null, 2)};

export const AccordionDemo = () => (
  <Accordion defaultValue={["accessible"]}${values.multiple ? " multiple" : ""}${values.disabled ? " disabled" : ""}>
    {items.map((item) => (
      <AccordionItem key={item.value} value={item.value}>
        <AccordionTrigger>{item.question}</AccordionTrigger>
        <AccordionContent>{item.answer}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);`;
