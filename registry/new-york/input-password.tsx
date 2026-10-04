"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import { Input } from "./input";
import type { InputProps } from "./input";

export type InputPasswordProps = Omit<InputProps, "type" | "icon">;

export function InputPassword({
  className,
  disabled,
  readOnly,
  ...props
}: InputPasswordProps) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div data-slot="password-input" className="relative min-w-0">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        disabled={disabled}
        readOnly={readOnly}
        className={["pr-11", className].filter(Boolean).join(" ")}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-1 -translate-y-1/2"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  );
}
