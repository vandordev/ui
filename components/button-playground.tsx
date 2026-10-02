"use client";

import { PlusIcon } from "lucide-react";

import { ComponentPlayground } from "@/components/component-playground";
import {
  buttonProps,
  getButtonAccessibleLabel,
  getButtonCode,
  getButtonDefaults,
  isIconSize,
} from "@/lib/button-playground";
import { Button } from "@/registry/new-york/button";

export const ButtonPlayground = () => (
  <ComponentPlayground
    title="Button"
    definitions={buttonProps}
    initialValues={getButtonDefaults()}
    getCode={getButtonCode}
    hint="Press and hold to feel the scale feedback. Icon sizes use the Label as their accessible name."
    renderPreview={(values) => (
      <Button
        variant={values.variant}
        size={values.size}
        disabled={values.disabled}
        aria-label={getButtonAccessibleLabel(values)}
      >
        {isIconSize(values.size) ? <PlusIcon /> : values.children}
      </Button>
    )}
  />
);
