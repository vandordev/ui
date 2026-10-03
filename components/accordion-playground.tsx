"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  accordionItems,
  accordionProps,
  getAccordionCode,
  getAccordionDefaults,
} from "@/lib/accordion-playground";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/new-york/accordion";

export const AccordionPlayground = () => (
  <ComponentPlayground
    title="Accordion"
    definitions={accordionProps}
    initialValues={getAccordionDefaults()}
    getCode={getAccordionCode}
    hint="Click a heading to toggle its panel. Tab moves between triggers; Enter or Space toggles the focused item."
    renderPreview={(values) => (
      <Accordion
        key={String(values.multiple)}
        className="max-w-md"
        defaultValue={["accessible"]}
        multiple={values.multiple}
        disabled={values.disabled}
      >
        {accordionItems.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )}
  />
);
