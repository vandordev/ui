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

export function InputSearch({
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
}: InputSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uncontrolled, setUncontrolled] = React.useState(
    String(defaultValue ?? "")
  );
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
        className={["pr-10", className].filter(Boolean).join(" ")}
      />
      {clearable && current && !disabled && !readOnly ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={clearLabel}
          className="absolute top-1/2 right-1 -translate-y-1/2"
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
            const changeEvent = new Event("change", { bubbles: true });
            Object.defineProperties(changeEvent, {
              currentTarget: { value: input },
              target: { value: input },
            });
            onChange?.(
              changeEvent as unknown as React.ChangeEvent<HTMLInputElement>
            );
            input.focus();
          }}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
