"use client";

import { accordionItems } from "@/lib/accordion-playground";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/new-york/accordion";

export const AccordionDemo = () => (
  <Accordion className="max-w-md" defaultValue={["accessible"]}>
    {accordionItems.map((item) => (
      <AccordionItem key={item.value} value={item.value}>
        <AccordionTrigger>{item.question}</AccordionTrigger>
        <AccordionContent>{item.answer}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
