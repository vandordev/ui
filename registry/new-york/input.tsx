import { cn } from "cn";
import type { ComponentProps } from "react";
import * as React from "react";

export type InputProps = Omit<ComponentProps<"input">, "children"> & {
  label?: string;
  labelStyle?: "floating" | "static";
  icon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
};

const fieldClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 motion-reduce:transition-none";

export function Input({
  className,
  containerClassName,
  defaultValue,
  icon,
  id,
  label,
  labelClassName,
  labelStyle = "floating",
  value,
  onChange,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const [internalValue, setInternalValue] = React.useState(
    String(defaultValue ?? "")
  );
  const floating = label && labelStyle === "floating";
  const hasValue =
    String(value === undefined ? internalValue : (value ?? "")).length > 0;

  const input = (
    <input
      {...props}
      data-slot="input"
      id={label ? inputId : id}
      {...(value === undefined ? { defaultValue } : { value })}
      onChange={(event) => {
        if (value === undefined) {
          setInternalValue(event.currentTarget.value);
        }
        onChange?.(event);
      }}
      aria-label={props["aria-label"] ?? label}
      placeholder={props.placeholder}
      className={cn(
        fieldClassName,
        floating &&
          "peer h-10 bg-background px-3 placeholder:text-transparent focus:placeholder:text-muted-foreground",
        icon && "pl-10",
        className
      )}
    />
  );

  if (!label && !icon && !containerClassName) {
    return input;
  }

  return (
    <div
      data-slot={floating ? "floating-input" : "input-field"}
      data-label-style={label ? labelStyle : undefined}
      className={cn(
        "relative min-w-0",
        label && labelStyle === "static" && "grid gap-1.5",
        containerClassName
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground"
        >
          {icon}
        </span>
      ) : null}
      {label && labelStyle === "static" ? (
        <label
          htmlFor={inputId}
          className={cn("text-sm font-medium", labelClassName)}
        >
          {label}
        </label>
      ) : null}
      {input}
      {floating ? (
        <label
          data-floating={hasValue ? "true" : "false"}
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute top-1/2 left-2 z-10 origin-left -translate-y-1/2 rounded-sm bg-background px-1 text-sm text-muted-foreground transition-[top,transform,color] duration-150 peer-focus:top-0 peer-focus:scale-85 peer-focus:text-foreground peer-autofill:top-0 peer-autofill:scale-85 peer-autofill:text-foreground data-[floating=true]:top-0 data-[floating=true]:scale-85 data-[floating=true]:text-foreground motion-reduce:transition-none",
            icon && "peer-placeholder-shown:translate-x-7",
            labelClassName
          )}
        >
          {label}
        </label>
      ) : null}
    </div>
  );
}
