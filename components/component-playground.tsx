"use client";

import { RotateCcwIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PlaygroundValues, PropDefinition } from "@/lib/playground";

export const ComponentPlayground = <T extends PlaygroundValues>({
  title,
  definitions,
  initialValues,
  renderPreview,
  getCode,
  hint,
}: {
  title: string;
  definitions: Record<string, PropDefinition>;
  initialValues: T;
  renderPreview: (values: T) => ReactNode;
  getCode: (values: T) => string;
  hint?: string;
}) => {
  const id = useId();
  const [values, setValues] = useState<T>(() => ({ ...initialValues }));
  const code = getCode(values);
  const updateValue = (name: string, value: string | boolean) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <section
      className="mt-6 min-w-0 overflow-hidden rounded-md border"
      aria-label={`${title} playground`}
    >
      <div className="grid min-w-0 md:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="flex min-w-0 flex-col">
          <div className="px-5 pt-4 text-xs font-medium text-muted-foreground">
            Live preview
          </div>
          <div
            className="flex min-h-56 min-w-0 flex-1 items-center justify-center overflow-x-auto p-8"
            data-slot="playground-preview"
          >
            {renderPreview(values)}
          </div>
          <div className="px-5 pb-4 text-xs leading-relaxed text-muted-foreground">
            {hint ?? "Change the controls to explore this component."}
          </div>
        </div>
        <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 border-t p-5 md:border-t-0 md:border-l">
          <legend className="sr-only">Customize {title}</legend>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Customize</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setValues({ ...initialValues })}
            >
              <RotateCcwIcon data-icon="inline-start" /> Reset
            </Button>
          </div>
          {Object.entries(definitions).map(([name, definition]) => {
            const { control } = definition;
            if (!control) {
              return null;
            }
            const controlId = `${id}-${name}`;
            if (control.kind === "boolean") {
              return (
                <div
                  className="flex min-h-9 cursor-pointer items-center justify-between gap-3 text-sm"
                  key={name}
                >
                  <label htmlFor={controlId}>{control.label}</label>
                  <Switch
                    id={controlId}
                    checked={values[name] === true}
                    onCheckedChange={(checked) => updateValue(name, checked)}
                  />
                </div>
              );
            }
            return (
              <div className="flex flex-col gap-2 text-sm" key={name}>
                <label htmlFor={controlId}>{control.label}</label>
                {control.kind === "select" ? (
                  <Select
                    value={String(values[name])}
                    onValueChange={(value) => updateValue(name, value)}
                  >
                    <SelectTrigger id={controlId} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      <SelectGroup>
                        {control.options.map((option) => (
                          <SelectItem value={option} key={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={controlId}
                    value={String(values[name])}
                    onChange={(event) => updateValue(name, event.target.value)}
                  />
                )}
              </div>
            );
          })}
        </fieldset>
      </div>
      <div className="min-w-0 border-t bg-code text-code-foreground">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
          <span className="font-mono text-xs">
            {title.toLowerCase()}-demo.tsx
          </span>
          <CopyButton
            value={code}
            showTooltip={false}
            aria-label="Copy playground code"
          >
            Copy code
          </CopyButton>
        </div>
        {/* Scrollable code must be keyboard-focusable, including in Firefox. */}
        <pre
          className="m-0 max-h-80 overflow-auto p-4 font-mono text-xs leading-relaxed"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          aria-label="Generated component code"
        >
          <code>{code}</code>
        </pre>
      </div>
    </section>
  );
};
