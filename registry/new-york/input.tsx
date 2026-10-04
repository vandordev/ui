"use client";

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

export const fieldSurfaceClassName =
  "bg-background bg-linear-to-b from-white/10 to-black/10 dark:bg-input/30";

const floatingLabelClassName =
  "pointer-events-none absolute top-1/2 left-3 z-10 max-w-[calc(100%-1.5rem)] origin-left -translate-y-1/2 truncate text-sm text-muted-foreground transition-[top,scale,color] duration-150 peer-focus:top-0 peer-focus:scale-75 peer-focus:text-foreground peer-autofill:top-0 peer-autofill:scale-75 peer-autofill:text-foreground data-[floating=true]:top-0 data-[floating=true]:scale-75 data-[floating=true]:text-foreground motion-reduce:transition-none";

const fieldClassName =
  "h-9 w-full min-w-0 rounded-md border border-input px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 motion-reduce:transition-none";

const InputIcon = ({
  icon,
  staticLabel,
}: {
  icon: React.ReactNode;
  staticLabel: boolean;
}) =>
  icon ? (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-3 z-10 -translate-y-1/2 text-muted-foreground",
        staticLabel ? "bottom-4.5 translate-y-1/2" : "top-1/2"
      )}
    >
      {icon}
    </span>
  ) : null;

const InputLabel = ({
  label,
  labelStyle,
  inputId,
  hasValue,
  icon,
  className,
}: {
  label?: string;
  labelStyle: InputProps["labelStyle"];
  inputId: string;
  hasValue: boolean;
  icon: React.ReactNode;
  className?: string;
}) => {
  if (!label) {
    return null;
  }
  if (labelStyle === "static") {
    return (
      <label htmlFor={inputId} className={cn("text-sm font-medium", className)}>
        {label}
      </label>
    );
  }
  return (
    <label
      data-floating={hasValue ? "true" : "false"}
      htmlFor={inputId}
      className={cn(floatingLabelClassName, icon && "left-10", className)}
    >
      {label}
    </label>
  );
};

const InputOutline = ({
  label,
  hasValue,
  icon,
}: {
  label?: string;
  hasValue: boolean;
  icon: React.ReactNode;
}) => (
  <fieldset
    aria-hidden="true"
    data-slot="input-outline"
    className={cn(
      "pointer-events-none absolute inset-x-0 -top-1.5 bottom-0 min-w-0 rounded-md border border-input px-2 peer-focus-visible:border-2 peer-focus-visible:border-ring peer-aria-invalid:border-destructive peer-disabled:opacity-50",
      "[&>legend]:max-w-0 peer-focus:[&>legend]:max-w-full peer-autofill:[&>legend]:max-w-full",
      hasValue && "[&>legend]:max-w-full",
      icon && "pl-9"
    )}
  >
    <legend className="invisible block h-3 overflow-hidden whitespace-nowrap p-0 text-[10.5px] leading-3 transition-[max-width] duration-150 motion-reduce:transition-none">
      <span className="px-1">{label}</span>
    </legend>
  </fieldset>
);

export const Input = ({
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
}: InputProps) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const floating = label && labelStyle === "floating";
  const staticLabel = Boolean(label) && labelStyle === "static";
  const hasValue =
    String((value === undefined ? internalValue : value) ?? "").length > 0;

  const input = (
    <input
      data-slot="input"
      {...props}
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
        fieldSurfaceClassName,
        floating &&
          "peer h-10 border-0 px-3 py-2 placeholder:text-transparent focus:placeholder:text-muted-foreground focus-visible:ring-0 aria-invalid:ring-0",
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
        staticLabel && "grid gap-1.5",
        containerClassName
      )}
    >
      <InputIcon icon={icon} staticLabel={staticLabel} />
      {staticLabel && (
        <InputLabel
          label={label}
          labelStyle="static"
          inputId={inputId}
          hasValue={hasValue}
          icon={icon}
          className={labelClassName}
        />
      )}
      {input}
      {floating && (
        <>
          <InputOutline label={label} hasValue={hasValue} icon={icon} />
          <InputLabel
            label={label}
            labelStyle="floating"
            inputId={inputId}
            hasValue={hasValue}
            icon={icon}
            className={labelClassName}
          />
        </>
      )}
    </div>
  );
};
