import { cn } from "cn";
import type { ComponentProps } from "react";
import * as React from "react";

export type TextAreaProps = ComponentProps<"textarea"> & {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
};

export function TextArea({
  className,
  containerClassName,
  id,
  label,
  labelClassName,
  ...props
}: TextAreaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const textarea = (
    <textarea
      {...props}
      id={label ? textareaId : id}
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 motion-reduce:transition-none",
        className
      )}
    />
  );
  if (!label && !containerClassName) {
    return textarea;
  }
  return (
    <div className={cn("grid min-w-0 gap-1.5", containerClassName)}>
      {label ? (
        <label
          htmlFor={textareaId}
          className={cn("text-sm font-medium", labelClassName)}
        >
          {label}
        </label>
      ) : null}
      {textarea}
    </div>
  );
}
