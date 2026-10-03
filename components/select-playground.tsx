"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getSelectCode,
  getSelectDefaults,
  selectItems,
  selectProps,
} from "@/lib/select-playground";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york/select";

export const SelectPlayground = () => (
  <ComponentPlayground
    title="Select"
    definitions={selectProps}
    initialValues={getSelectDefaults()}
    getCode={getSelectCode}
    hint="Open the menu to preview the motion. Arrow keys navigate, Enter selects, and Escape closes."
    renderPreview={(values) => (
      <Select items={selectItems} disabled={values.disabled}>
        <SelectTrigger
          aria-label="Fruit"
          className="w-56 max-w-full"
          size={values.size}
        >
          <SelectValue placeholder={values.placeholder} />
        </SelectTrigger>
        <SelectContent animated={values.animated}>
          <SelectGroup>
            {selectItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )}
  />
);
