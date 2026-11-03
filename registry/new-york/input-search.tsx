"use client";

import { cn } from "cn";
import { Search, X } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import { Input } from "./input";
import type { InputProps } from "./input";

export type InputSearchProps = Omit<InputProps, "type" | "icon"> & {
  clearable?: boolean;
  searchLabel?: string;
  clearLabel?: string;
};

export const InputSearch = React.forwardRef<HTMLInputElement, InputSearchProps>(
  function InputSearch(
    {
      clearable = false,
      clearLabel = "Clear search",
      disabled,
      readOnly,
      searchLabel = "Search",
      value,
      defaultValue,
      onChange,
      className,
      ...props
    },
    forwardedRef
  ) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement
    );
    const [uncontrolled, setUncontrolled] = React.useState(
      String(defaultValue ?? "")
    );
    React.useEffect(() => {
      const form = inputRef.current?.form;
      if (!form || value !== undefined) {
        return;
      }
      const reset = (event: Event) => {
        queueMicrotask(() => {
          if (!event.defaultPrevented) {
            setUncontrolled(String(defaultValue ?? ""));
          }
        });
      };
      form.addEventListener("reset", reset);
      return () => form.removeEventListener("reset", reset);
    }, [defaultValue, props.form, value]);
    const current = String(value === undefined ? uncontrolled : (value ?? ""));
    return (
      <div data-slot="search-input" className="relative min-w-0">
        <Input
          {...props}
          ref={inputRef}
          type="search"
          aria-label={props["aria-label"] ?? props.label ?? searchLabel}
          icon={<Search aria-label={searchLabel} size={16} />}
          disabled={disabled}
          readOnly={readOnly}
          value={current}
          onChange={(event) => {
            if (value === undefined) {
              setUncontrolled(event.currentTarget.value);
            }
            onChange?.(event);
          }}
          className={cn(
            "pr-10 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
            className
          )}
        />
        {clearable && current && !disabled && !readOnly ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={clearLabel}
            className={cn(
              "absolute right-1",
              props.label && props.labelStyle === "static"
                ? "bottom-4.5 translate-y-1/2"
                : "top-1/2 -translate-y-1/2"
            )}
            onClick={() => {
              const input = inputRef.current;
              if (!input) {
                return;
              }
              const setter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value"
              )?.set;
              setter?.call(input, "");
              setUncontrolled("");
              input.dispatchEvent(new Event("input", { bubbles: true }));
              input.focus();
            }}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    );
  }
);
