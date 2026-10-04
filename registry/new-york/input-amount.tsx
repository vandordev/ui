"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";

export type InputAmountProps = Omit<
  NumericFormatProps<ComponentProps<"input">>,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "thousandSeparator"
  | "decimalSeparator"
  | "prefix"
  | "suffix"
  | "decimalScale"
  | "fixedDecimalScale"
  | "allowNegative"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  thousandSeparator?: string | boolean;
  decimalSeparator?: string;
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
  allowNegative?: boolean;
};

const fieldClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 motion-reduce:transition-none";

export function InputAmount({
  className,
  thousandSeparator = false,
  decimalSeparator = ".",
  prefix = "",
  suffix = "",
  decimalScale,
  fixedDecimalScale = false,
  allowNegative = false,
  onValueChange,
  ...props
}: InputAmountProps) {
  if (
    typeof thousandSeparator === "string" &&
    thousandSeparator === decimalSeparator
  ) {
    throw new Error(
      "thousandSeparator and decimalSeparator must be different."
    );
  }
  return (
    <NumericFormat
      {...props}
      data-slot="amount-input"
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      prefix={prefix}
      suffix={suffix}
      decimalScale={decimalScale}
      fixedDecimalScale={fixedDecimalScale}
      allowNegative={allowNegative}
      onValueChange={(values, sourceInfo) => {
        if (sourceInfo.source === "event") {
          onValueChange?.(values.value);
        }
      }}
      className={cn(fieldClassName, className)}
    />
  );
}
