"use client";

import { PlusIcon } from "lucide-react";

import { ComponentPlayground } from "@/components/component-playground";
import {
  buttonPlaygroundDefinitions,
  getButtonAccessibleLabel,
  getButtonCode,
  getButtonDefaults,
  getButtonWhileTap,
  isIconSize,
} from "@/lib/button-playground";
import { Button } from "@/registry/new-york/button";

export const ButtonPlayground = () => (
  <ComponentPlayground
    title="Button"
    definitions={buttonPlaygroundDefinitions}
    initialValues={getButtonDefaults()}
    getCode={getButtonCode}
    renderPreview={(values) => (
      <Button
        variant={values.variant}
        size={values.size}
        disabled={values.disabled}
        whileTap={getButtonWhileTap(values)}
        aria-label={getButtonAccessibleLabel(values)}
      >
        {isIconSize(values.size) ? <PlusIcon /> : values.children}
      </Button>
    )}
  />
);
