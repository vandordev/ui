import { cn } from "cn";
import * as React from "react";

export type InputOTPProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "maxLength"
> & {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  type?: "numeric" | "alphanumeric";
};

export const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  function InputOTP(
    {
      length = 6,
      value,
      defaultValue = "",
      onValueChange,
      onComplete,
      type = "numeric",
      className,
      onChange,
      ...props
    },
    forwardedRef
  ) {
    const pattern = type === "numeric" ? /[^0-9]/g : /[^a-z0-9]/gi;
    const sanitize = React.useCallback(
      (raw: string) => raw.replace(pattern, "").slice(0, length),
      [length, pattern]
    );
    const [internal, setInternal] = React.useState(() =>
      sanitize(defaultValue)
    );
    const [focused, setFocused] = React.useState(false);
    const current = sanitize(value === undefined ? internal : value);
    const previous = React.useRef(current);
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement
    );
    if (!Number.isInteger(length) || length < 1) {
      throw new Error("InputOTP length must be a positive integer.");
    }
    React.useEffect(() => {
      if (value !== undefined) {
        previous.current = current;
      }
    }, [current, value]);

    function update(raw: string, event: React.ChangeEvent<HTMLInputElement>) {
      const next = sanitize(raw);
      if (value === undefined) {
        setInternal(next);
      }
      if (next !== previous.current) {
        previous.current = next;
        onValueChange?.(next);
        if (next.length === length) {
          onComplete?.(next);
        }
      }
      onChange?.(event);
    }

    return (
      <div
        data-slot="input-otp"
        data-focused={focused}
        className={cn("group relative inline-flex min-w-0 gap-2", className)}
        onClick={() => inputRef.current?.focus()}
      >
        <div aria-hidden="true" className="flex gap-2">
          {Array.from({ length }, (_, index) => (
            <span
              key={index}
              data-filled={index < current.length}
              className="flex size-11 items-center justify-center rounded-md border border-input bg-background text-lg text-foreground data-[filled=true]:border-ring group-data-[focused=true]:ring-[3px] group-data-[focused=true]:ring-ring/50"
            >
              {current[index] ?? ""}
            </span>
          ))}
        </div>
        <input
          {...props}
          ref={inputRef}
          aria-label={props["aria-label"] ?? "One-time code"}
          autoComplete={props.autoComplete ?? "one-time-code"}
          inputMode={type === "numeric" ? "numeric" : "text"}
          maxLength={length}
          value={current}
          onChange={(event) => update(event.currentTarget.value, event)}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          className="absolute inset-0 size-full cursor-text opacity-0"
        />
      </div>
    );
  }
);
