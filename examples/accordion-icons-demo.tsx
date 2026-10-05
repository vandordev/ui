"use client";

import { MinusIcon, PlusIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/new-york/accordion";

export const AccordionIconsDemo = () => (
  <Accordion className="max-w-md">
    <AccordionItem value="swap">
      <AccordionTrigger icon={<PlusIcon />} expandedIcon={<MinusIcon />}>
        Technical details
      </AccordionTrigger>
      <AccordionContent>
        Reference: DEMO-1042. The Plus and Minus indicators crossfade while the
        panel expands.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="rotate">
      <AccordionTrigger icon={<PlusIcon />} iconRotation={45}>
        A rotating custom icon
      </AccordionTrigger>
      <AccordionContent>
        A single Plus indicator rotates into a close mark. Use any decorative
        React node.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
